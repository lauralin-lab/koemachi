/* Koemachi · ja: 日本語. What is said (or typed) in Japanese is rewritten, clause by clause, into the English phrasing the instant grammar in mind.js already
   understands: 春にして → "make it spring", 雪を降らせて → "let it snow", 夜にして → "make it night", ここに桜の木を置いて → "add a cherry tree here", これを大きくして →
   "make it bigger", 元に戻して → "undo". So every local rule has a Japanese way of saying it without a third parser. A clause nothing here recognises is left
   as it is, and goes on to the model, which reads Japanese itself.
   YX.ja.toEn(text) -> the English text, or null when nothing in it was Japanese or recognised. YX.ja.pref is set by the UI when the speech language is 日本語:
   then a sentence in kanji alone (夜, 春) counts as Japanese too; otherwise a sentence is Japanese when it has kana in it. The grammar's messages stay English. */
'use strict';
(function () {
  const YX = window.YX, M = YX.mind, J = (YX.ja = { pref: false });
  const KANA = /[぀-ヿ]/, KANJI = /[一-鿿]/;
  const N = '(?:\\d+|[一二三四五六七八九十百]+)';
  const NUMJ = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 百: 100 };
  const num = (s) => { if (/^\d+$/.test(s)) return +s; let n = 0, cur = 0; for (const c of s) { const v = NUMJ[c]; if (v === 10) { n += (cur || 1) * 10; cur = 0; } else if (v === 100) { n += (cur || 1) * 100; cur = 0; } else cur = cur * 10 + v; } return n + cur; };
  const WORDS = ['zero', 'a', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const count = (n) => (n <= 10 ? WORDS[n] : String(n));

  /* nouns: the Japanese word -> the English word the grammar knows (longest first) */
  const NOUN = { 桜の木: 'cherry tree', 桜: 'cherry tree', さくら: 'cherry tree', 紅葉: 'maple tree', もみじ: 'maple tree', モミジ: 'maple tree', 楓: 'maple tree', 黒松: 'pine tree', 松: 'pine tree', 木: 'tree', 樹: 'tree', 花: 'flowers', 草: 'bush', 茂み: 'bush', 岩: 'rock', 石: 'rock', 山: 'hill', 丘: 'hill', 池: 'pond', 湖: 'pond', 噴水: 'fountain',
    家: 'wooden house', 民家: 'wooden house', 一軒家: 'wooden house', 町家: 'wooden house', 建物: 'house', ビル: 'tower', 店: 'shop', お店: 'shop', 商店: 'shop', カフェ: 'cafe', 喫茶店: 'cafe', ラーメン屋: 'ramen shop', 和菓子屋: 'wagashi shop', 雑貨屋: 'general store', 銭湯: 'sento', お風呂屋: 'sento',
    神社: 'shrine', 鳥居: 'torii', 灯籠: 'stone lantern', 石灯籠: 'stone lantern', 提灯: 'paper lanterns', 電柱: 'utility pole', 街灯: 'street light', 街路灯: 'street light', 外灯: 'street light', 自動販売機: 'vending machine', 自販機: 'vending machine', ポスト: 'post box', 郵便ポスト: 'post box', カーブミラー: 'convex mirror', ベンチ: 'bench', 長椅子: 'bench', 椅子: 'chair', テーブル: 'table', 机: 'table',
    自転車: 'bicycle', 車: 'car', 自動車: 'car', タクシー: 'taxi', バス: 'bus', 電車: 'train', 列車: 'train', 船: 'fishing boat', 漁船: 'fishing boat', ボート: 'boat', 灯台: 'lighthouse', 風車: 'windmill', 橋: 'bridge', 階段: 'stone steps', 塀: 'block wall', 駅: 'station',
    猫: 'cat', ねこ: 'cat', ネコ: 'cat', 犬: 'dog', いぬ: 'dog', イヌ: 'dog', 人: 'person', 人々: 'people', 人たち: 'people', 子供: 'child', 子ども: 'child', 鳥: 'bird', 雲: 'cloud', 風船: 'balloon', 気球: 'balloon', 屋台: 'ramen shop', 看板: 'sign', 旗: 'flag', 灯り: 'lamp', 電灯: 'lamp', ライト: 'light', 照明: 'light' };
  const NK = Object.keys(NOUN).sort((a, b) => b.length - a.length), NRE = '(' + NK.join('|') + ')';
  const COLOR = { 赤: 'red', 青: 'blue', 白: 'white', 黒: 'black', 黄色: 'yellow', 黄: 'yellow', 緑: 'green', 茶色: 'brown', 茶: 'brown', ピンク: 'pink', 桃色: 'pink', 紫: 'purple', オレンジ: 'orange', 橙: 'orange', 灰色: 'gray', グレー: 'gray', 金: 'gold', 銀: 'silver', 水色: 'light blue' };
  const CK = Object.keys(COLOR).sort((a, b) => b.length - a.length), CRE = '(' + CK.join('|') + ')';
  const SEASON = { 春: 'spring', 夏: 'summer', 秋: 'autumn', 冬: 'winter' };
  const WEATHER = [[/大?雨/, 'rain'], [/嵐|暴風|雷/, 'storm'], [/霧|もや|靄/, 'fog'], [/曇り?|くもり/, 'cloudy'], [/晴れ|快晴|青空|晴天/, 'clear'], [/雪/, 'snow']];
  const TIMEW = [[/真夜中|深夜|夜中|午前0時|零時/, 'midnight'], [/夜明け|明け方|日の出|早朝/, 'sunrise'], [/夕焼け|夕暮れ|夕方|黄昏|ゴールデンアワー|マジックアワー|夕日/, 'golden hour'], [/日没|日の入り/, 'sunset'], [/真昼|正午|昼間|昼|お昼/, 'noon'], [/午後/, 'afternoon'], [/午前|朝/, 'morning'], [/夜|晩|ナイト/, 'night']];
  const DIR = { 左: 'left', 右: 'right', 前: 'forward', 手前: 'back', 後ろ: 'back', 奥: 'forward', 上: 'up', 下: 'down' };
  const ADJ = [[/大きく/, 'bigger'], [/小さく/, 'smaller'], [/高く/, 'taller'], [/低く|短く/, 'shorter'], [/広く|太く|幅を広く/, 'wider'], [/狭く|細く/, 'narrower'], [/長く/, 'longer'], [/厚く/, 'thicker'], [/薄く/, 'thinner']];
  const AMT = [[/ちょっとだけ|ほんの少し|少しだけ|ちょっと|少し|やや/, 'a bit '], [/もっと|さらに|もう少し|もう一段/, 'even '], [/とても|すごく|かなり|うんと|ずっと/, 'much ']];

  /* the thing a sentence is about: これ/この家/その木 -> it / this house / that tree */
  function target(s) {
    let m;
    if ((m = s.match(new RegExp('(?:この|その|あの|目の前の|前の)' + NRE)))) return { en: (/^(?:この|目の前の|前の)/.test(m[0]) ? 'this ' : 'that ') + NOUN[m[1]], rest: s.replace(m[0], ' ') };
    if ((m = s.match(new RegExp('(?:すべての|全ての|全部の|みんなの|あらゆる)' + NRE + '(?:を|が)?')))) return { en: 'all the ' + plural(NOUN[m[1]]), rest: s.replace(m[0], ' ') };
    if ((m = s.match(new RegExp('^' + NRE + '(?:を|が|は)')))) return { en: 'the ' + NOUN[m[1]], rest: s.replace(m[0], ' ') };
    if ((m = s.match(/(?:これ|それ|あれ|こいつ|コレ)(?:を|が|は)?/))) return { en: 'it', rest: s.replace(m[0], ' ') };
    return { en: 'it', rest: s };
  }
  const plural = (w) => (/y$/.test(w) ? w.slice(0, -1) + 'ies' : /(?:s|x|ch|sh)$/.test(w) ? w + 'es' : w === 'person' ? 'people' : w === 'child' ? 'children' : w + 's');
  const UNIT = '(?:メートル|ｍ|m|メーター|センチ|cm)';

  /* one clause -> one English clause, or null */
  function clause(c0) {
    let c = c0.replace(/\s+/g, '').replace(/(?:お願いします|お願い|ください|下さい|くれる|くれない|ほしい|欲しい|だよ|だね|ですか|ですよ|です|ます|よね|かな|かも|ね|よ|な)+$/, '').replace(/^(?:ねえ|あの|えっと|じゃあ|では|はい|さあ)+/, ''), m;
    if (!c) return null;
    // undo, reset
    if (/^(?:元に戻|もとに戻|取り消|取りけ|アンドゥ|やり直|一つ戻|ひとつ戻|さっきの(?:を)?(?:取り消|消))/.test(c)) return 'undo';
    if (/^(?:リセット|初期化|最初から|最初に戻|町を初期|世界を初期|はじめから)/.test(c)) return 'reset the town';
    // time flows / stops
    if (/時間(?:を|が)?(?:流|進め|早送り|動か)/.test(c)) return 'let time flow'; if (/時間(?:を|が)?(?:止め|停止|ストップ|固定)/.test(c)) return 'stop the time';
    // clock time: 午後3時, 夜の8時半, 15時にして
    if ((m = c.match(new RegExp('(午前|午後|朝|昼|夕方|夜|晩)?の?(' + N + ')時(半|(' + N + ')分)?')))) { let h = num(m[2]); const half = m[3] === '半' ? 30 : m[4] ? num(m[4]) : 0; if (h <= 24) { if (/午後|夕方|夜|晩/.test(m[1] || '') && h < 12) h += 12; return 'make it ' + String(h).padStart(2, '0') + ':' + String(half).padStart(2, '0'); } }
    // seasons
    if (/桜(?:を|が)?(?:咲か|咲い|満開)|桜の季節|花見/.test(c)) return 'make it spring';
    if (/紅葉(?:させ|にし|の季節|したい|が見たい)|(?:葉|木)(?:を|が)?赤く|紅葉/.test(c) && !new RegExp('^' + NRE + '(?:を|が)置').test(c) && !/(?:置|出|作|植|立)/.test(c)) return 'make it autumn';
    if ((m = c.match(/(?:^|[にをへはがのとで])([春夏秋冬])(?:の季節|の景色|の風景|の空気|らしく|っぽく|に|を|へ|が|$)/)) || (m = c.match(/^([春夏秋冬])$/))) if (!/(?:冬瓜|夏みかん|春雨|秋刀魚)/.test(c) && !new RegExp(NRE + '(?:を|が)?(?:置|出|作)').test(c)) return 'make it ' + SEASON[m[1]];
    // weather: 雪を降らせて, 雨にして, 雨を止めて, 晴れにして
    if ((m = c.match(/(雪|雨|大雨|霧)(?:を|が)?(?:止め|やま|やん|消し|無く|なくし|晴ら)/))) return 'stop the ' + (m[1] === '雪' ? 'snow' : m[1] === '霧' ? 'fog' : 'rain');
    for (const [re, w] of WEATHER) if (re.test(c) && /(?:降ら|降っ|降る|降れ|にし|なれ|なっ|変え|させ|起こ|出し|吹か|立ち込め|晴れ|晴れて|[にが]?$)/.test(c) && !/置|作|描/.test(c) && c.length < 14) return w === 'clear' ? 'clear sky' : w === 'snow' ? 'let it snow' : w === 'rain' ? (/大雨/.test(c) ? 'heavy rain' : 'make it rain') : w === 'storm' ? 'make it stormy' : w === 'fog' ? 'make it foggy' : 'make it cloudy';
    // time of day
    for (const [re, w] of TIMEW) if (re.test(c) && c.length < 16 && !/置|作|描|消|大き|小さ/.test(c) && /(?:にし|なれ|なっ|に変え|にな|^|の空|の景色|に切り|のよう|っぽく|を見せ|が見たい|にし|にして)/.test(c)) return 'make it ' + w;
    // looks and light
    if (/白黒|モノクロ|モノトーン/.test(c)) return 'make it black and white'; if (/暖かい色|暖色|あたたかい色/.test(c)) return 'make it warmer'; if (/冷たい色|寒色|クール/.test(c)) return 'make it cooler'; if (/鮮やか|ビビッド/.test(c)) return 'make it vivid'; if (/フィルム|レトロ|褪せ/.test(c)) return 'make it faded'; if (/夢のよう|ドリーミー|幻想/.test(c)) return 'make it dreamy'; if (/通常の色|元の色調|ノーマルの色/.test(c)) return 'normal colors';
    if (/柔らかい光|光を柔らか|ソフトライト|ふわっと/.test(c)) return 'soft light'; if (/硬い光|強い光|ハードライト|くっきり/.test(c)) return 'hard light'; if (/逆光/.test(c)) return 'backlit'; if (/順光/.test(c)) return 'front lit';
    if ((m = c.match(/(?:地面|地)(?:を|が)?(草地|砂地|砂|雪|土|石畳|石)(?:に|へ)/))) return 'make the ground ' + ({ 草地: 'grass', 砂地: 'sand', 砂: 'sand', 雪: 'snow', 土: 'dirt', 石畳: 'stone', 石: 'stone' })[m[1]];
    // adding things: a verb of putting (置いて, 植えて, 作って...), a thing, and maybe a colour, a number and a place
    if (/(?:置い|出し|追加|作っ|作れ|作る|建て|植え|立て|生や|設置|配置|描い|呼ん|召喚|増や|入れ|飾っ|吊るし|吊し|掛け|かけ|足し|加え|並べ)/.test(c)) {
      let rest = c, place = '', where = '';
      if ((m = rest.match(new RegExp('(?:(?:この|あの|その)?' + NRE + 'の)?(?:隣|横|そば|前|後ろ|屋根の上|上)(?:に|へ)')))) { where = m[1] ? (/屋根/.test(m[0]) ? 'on the roof of this ' + NOUN[m[1]] : 'next to this ' + NOUN[m[1]]) : (/屋根/.test(m[0]) ? 'on the roof of this house' : 'next to this'); rest = rest.replace(m[0], ''); }
      else if ((m = rest.match(/道の向かい(?:側)?(?:に|へ)|向かい(?:側)?(?:に|へ)|通りの向こう(?:側)?(?:に|へ)/))) { where = 'across the street'; rest = rest.replace(m[0], ''); }
      else if ((m = rest.match(/ここ(?:に|へ|で)|この場所(?:に|へ)|こっち(?:に|へ)/))) { where = 'here'; rest = rest.replace(m[0], ''); }
      else if ((m = rest.match(/(?:目の前|すぐ前|手前|前方)(?:に|へ)/))) { where = 'in front of me'; rest = rest.replace(m[0], ''); }
      else if ((m = rest.match(/右(?:側)?(?:に|へ)/))) { where = 'on my right'; rest = rest.replace(m[0], ''); } else if ((m = rest.match(/左(?:側)?(?:に|へ)/))) { where = 'on my left'; rest = rest.replace(m[0], ''); } else if ((m = rest.match(/(?:近く|そば|周り)(?:に|へ)/))) { where = 'nearby'; rest = rest.replace(m[0], ''); }
      const nm = rest.match(new RegExp(NRE)); if (nm) {
        const noun = NOUN[nm[1]], cm = rest.match(new RegExp(CRE + '(?:い|色の|色|の)?' + NRE)), col = cm && rest.indexOf(cm[1]) < rest.indexOf(nm[1]) ? COLOR[cm[1]] : '';
        const qn = rest.match(new RegExp('(' + N + ')(?:つ|個|本|軒|台|匹|羽|人|棟|艘|隻|輪|枚|基|脚|体|頭)')), many = /たくさん|沢山|いっぱい|大量/.test(rest), few = /いくつか|数本|何本か|数個|数匹|数羽/.test(rest), row = /一列|並べ/.test(rest);
        const n = qn ? num(qn[1]) : many ? 0 : 1;
        return 'add ' + (row ? 'a row of ' + plural(noun) : many ? 'many ' + plural(noun) : few ? 'a few ' + plural(noun) : n > 1 ? count(n) + ' ' + plural(noun) : 'a ' + (col ? col + ' ' : '') + noun) + (row || many || few || n > 1 ? '' : '') + ' ' + (where || 'here');
      }
    }
    // removing
    if (/(?:消し|消せ|削除|なくし|無くし|取り除|撤去|片付け|片づけ|取り壊|壊し|どけ|除去)/.test(c) && !/元に|取り消/.test(c)) { if (/全部|すべて|全て|みんな|何もかも/.test(c) && !new RegExp(NRE).test(c)) return 'clear the world'; const t = target(c); return 'remove ' + t.en; }
    // resizing, with a little or a lot
    for (const [re, adj] of ADJ) if (re.test(c) && /(?:して|し|なれ|なっ|に変|したい|してくれ|^|もう|もっと)/.test(c)) { const t = target(c); let amt = ''; for (const [ar, aw] of AMT) if (ar.test(c)) { amt = aw; break; } if ((m = c.match(/(二|三|四|五|2|3|4|5)倍/))) return 'make ' + t.en + ' ' + num(m[1]) + ' times as ' + ({ bigger: 'big', smaller: 'small', taller: 'tall', shorter: 'short', wider: 'wide', narrower: 'narrow', longer: 'long', thicker: 'thick', thinner: 'thin' })[adj]; if (/半分/.test(c)) return 'make ' + t.en + ' half as ' + ({ bigger: 'big', smaller: 'small', taller: 'tall', shorter: 'short', wider: 'wide', narrower: 'narrow', longer: 'long', thicker: 'thick', thinner: 'thin' })[adj]; return 'make ' + t.en + ' ' + amt + adj; }
    if ((m = c.match(/(二|三|四|五|十|2|3|4|5|10)倍(?:に|の大きさ)/))) return 'make ' + target(c).en + ' ' + num(m[1]) + ' times as big'; if (/倍にし|ダブル/.test(c)) return 'make ' + target(c).en + ' twice as big'; if (/半分(?:に|の大きさ)/.test(c)) return 'make ' + target(c).en + ' half the size';
    // colours: これを赤くして, 屋根を青に
    if ((m = c.match(new RegExp(CRE + '(?:く|い色に|色に|に|っぽく)(?:し|変え|塗|なれ|染め|なっ)')))) { const t = target(c); return 'make ' + t.en + ' ' + COLOR[m[1]]; }
    // moving and turning: 左に2メートル動かして, 90度回して
    if ((m = c.match(new RegExp('(?:(' + N + ')' + UNIT + '(?:ほど|くらい)?)?(左|右|前|後ろ|手前|奥|上|下)(?:に|へ)?(?:(' + N + ')' + UNIT + ')?(?:ほど|くらい)?(?:動かし|移動|ずらし|寄せ|引い|押し|持ち上げ|上げ|下げ|運ん)')))) { const n = m[1] || m[3], t = target(c); return 'move ' + t.en + (n ? ' ' + num(n) + ' meters ' : ' a bit ') + DIR[m[2]]; }
    if ((m = c.match(new RegExp('(?:(' + N + ')度)?(?:回し|回転|向け|ひねっ|回せ|ぐるっと)')))) { const t = target(c); return 'rotate ' + t.en + (m[1] ? ' ' + num(m[1]) + ' degrees' : ''); }
    if (/こっちに(?:移動|動かし|持ってき)|ここに(?:移動|動かし|持ってき)/.test(c)) return 'move ' + target(c).en + ' here';
    // going somewhere
    if ((m = c.match(new RegExp(NRE + '(?:まで|に|へ)?(?:連れて行っ|連れてって|行き|行っ|飛んで|飛ぶ|行こう|案内)')))) return 'take me to the ' + NOUN[m[1]];
    // the camera
    if (/(?:周り|まわり)(?:を|に)?(?:一周|ぐるっと|ぐるり|回)|(?:一周|ぐるっと|ぐるり)(?:して)?(?:撮|映|回)|オービット|周回/.test(c)) return 'orbit ' + target(c).en; if (/録画(?:停止|やめ|終わ|止め)|撮影(?:停止|終了|やめ)|止めて録画/.test(c)) return 'stop recording'; if (/録画|撮影|収録|撮って|撮る|記録して|レコード/.test(c)) return 'record it';
    if (/空から|上空から|ドローン|俯瞰/.test(c)) return 'fly over this'; if (/近づい|寄って|ズームイン|アップ/.test(c)) return 'push in'; if (/離れ|引いて|ズームアウト|遠ざか/.test(c)) return 'pull out';
    // what people do
    if (/座(?:らせ|って)|腰掛け/.test(c)) return 'make ' + target(c).en.replace(/^it$/, 'him') + ' sit'; if (/歩(?:かせ|いて|け)|散歩/.test(c)) return 'make ' + target(c).en.replace(/^it$/, 'him') + ' walk'; if (/手を振|手振/.test(c)) return 'make ' + target(c).en.replace(/^it$/, 'him') + ' wave'; if (/拍手/.test(c)) return 'make them clap'; if (/笑(?:わせ|って)/.test(c)) return 'make ' + target(c).en.replace(/^it$/, 'him') + ' laugh'; if (/走(?:らせ|って|れ)/.test(c)) return 'make ' + target(c).en.replace(/^it$/, 'him') + ' run'; if (/(?:おしゃべり|話し|会話|雑談)(?:させ|して)/.test(c)) return 'make them chat';
    return null;
  }

  J.toEn = function (text) {
    if (typeof text !== 'string' || !text) return null;
    if (!(KANA.test(text) || (J.pref && KANJI.test(text)))) return null;
    const s = text.normalize('NFKC').replace(/[「」『』]/g, ''), parts = s.split(/[。！？!?\n]+|、|，|,|(?:そして|それから|それで|次に|その後|あとは|あと)/).map((p) => p.trim()).filter(Boolean), out = []; let any = false;
    for (const p of parts) { const e = clause(p); if (e) { out.push(e); any = true; } else out.push(p); }
    return any ? out.join('. ') : null;
  };

  /* what the mind hears: the Japanese sentence in English words, parsed by the English grammar */
  const wrap = (fn) => function (text) {
    const en = typeof text === 'string' ? J.toEn(text) : null; if (!en) return fn.apply(this, arguments);
    const keep = YX.lang; YX.lang = 'en'; const args = Array.prototype.slice.call(arguments); args[0] = en;
    try { return fn.apply(this, args); } finally { YX.lang = keep; }
  };
  M.commit = wrap(M.commit); M.partial = wrap(M.partial);
})();
