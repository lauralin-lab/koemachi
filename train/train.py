"""Koemachi, Train my world: fine-tune a LoRA on thinkingmachines/Inkling-2-Small from the edits you kept (data/sessions.jsonl).

Run by the local server (POST /__train), or by hand:
    uv run --project train python train/train.py            (needs TINKER_API_KEY in the environment or in .env)

Writes under data/:
    train/status.json   what the page polls: state (running|done|error), step, total, epoch, nll, message
    models.json         one entry per saved checkpoint: id, label, path (a tinker:// sampler path the Messages API accepts as `model`), epoch, nll
Every epoch saves sampler weights, so each one can be switched to later (and compared by Watch it learn).
"""
import argparse, json, os, random, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_env():
    for f in (ROOT / ".env", ROOT / "site" / ".env"):
        if f.exists():
            for line in f.read_text().splitlines():
                k, _, v = line.partition("=")
                k = k.strip().removeprefix("export ").strip()
                if k == "TINKER_API_KEY" and v.strip() and not os.environ.get(k):
                    os.environ[k] = v.strip().strip("'\"")


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, indent=1))
    os.replace(tmp, path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=str(ROOT / "data"))
    ap.add_argument("--model", default=os.environ.get("TRAIN_BASE_MODEL", "thinkingmachines/Inkling-2-Small"))
    ap.add_argument("--epochs", type=int, default=3)
    ap.add_argument("--batch-size", type=int, default=8)
    ap.add_argument("--lr", type=float, default=1e-4)
    ap.add_argument("--rank", type=int, default=16)
    ap.add_argument("--max-length", type=int, default=32768)
    a = ap.parse_args()
    data = Path(a.data)
    status_path, models_path = data / "train" / "status.json", data / "models.json"
    st = {"state": "running", "step": 0, "total": 0, "epoch": 0, "epochs": a.epochs, "nll": None, "message": "starting", "started": time.time(), "base": a.model}

    def status(**kw):
        st.update(kw)
        write_json(status_path, st)

    try:
        load_env()
        if not os.environ.get("TINKER_API_KEY"):
            raise RuntimeError("TINKER_API_KEY is not set (put it in .env)")
        rows = [json.loads(l) for l in (data / "sessions.jsonl").read_text().splitlines() if l.strip()]
        rows = [r["messages"] for r in rows if len(r.get("messages", [])) == 3]
        if not rows:
            raise RuntimeError("no kept edits in data/sessions.jsonl yet")
        status(message="loading tokenizer", examples=len(rows))

        import tinker
        from tinker_cookbook import model_info, renderers
        from tinker_cookbook.supervised.common import compute_mean_nll
        from tinker_cookbook.supervised.data import conversation_to_datum
        from tinker_cookbook.tokenizer_utils import get_tokenizer

        tok = get_tokenizer(a.model)
        renderer = renderers.get_renderer(model_info.get_recommended_renderer_name(a.model), tok)
        datums = [conversation_to_datum(m, renderer, a.max_length, renderers.TrainOnWhat.ALL_ASSISTANT_MESSAGES) for m in rows]

        bs = min(a.batch_size, len(datums))
        per_epoch = max(1, len(datums) // bs)  # drop the last partial batch: a smaller batch has a different gradient scale
        total = per_epoch * a.epochs
        status(total=total, message="connecting to Tinker")
        svc = tinker.ServiceClient(display_name="koemachi-train-my-world")
        tc = svc.create_lora_training_client(base_model=a.model, rank=a.rank).result()

        run_id = time.strftime("%Y%m%d-%H%M%S")
        step, rng = 0, random.Random(0)
        models = json.loads(models_path.read_text()) if models_path.exists() else []
        for ep in range(a.epochs):
            order = list(range(len(datums)))
            rng.shuffle(order)
            nlls = []
            for b in range(per_epoch):
                batch = [datums[i] for i in order[b * bs:(b + 1) * bs]]
                lr = a.lr * max(0.1, 1.0 - step / total)
                status(step=step, epoch=ep + 1, message=f"epoch {ep + 1}/{a.epochs}, step {step + 1}/{total}")
                fb = tc.forward_backward(batch, loss_fn="cross_entropy")
                op = tc.optim_step(tinker.AdamParams(learning_rate=lr, beta1=0.9, beta2=0.95, eps=1e-8))
                res = fb.result()
                op.result()
                nll = compute_mean_nll([x["logprobs"] for x in res.loss_fn_outputs], [d.loss_fn_inputs["weights"] for d in batch])
                nlls.append(float(nll))
                step += 1
                status(step=step, nll=float(nll))
            status(message=f"saving checkpoint {ep + 1}/{a.epochs}")
            saved = tc.save_weights_for_sampler(f"{run_id}-e{ep + 1}").result()
            models.append({
                "id": f"{run_id}-e{ep + 1}", "label": f"My world · {time.strftime('%b %d %H:%M')} · epoch {ep + 1}",
                "path": saved.path, "base": a.model, "epoch": ep + 1, "epochs": a.epochs, "examples": len(datums),
                "nll": sum(nlls) / len(nlls), "created": time.time(),
            })
            write_json(models_path, models)
        status(state="done", step=total, message="done", finished=time.time())
    except BaseException as e:  # the page shows the message
        status(state="error", message=f"{type(e).__name__}: {e}"[:400], finished=time.time())
        raise


if __name__ == "__main__":
    main()
