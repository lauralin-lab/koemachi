// Tinker features hub: names what runs on Tinker, whether it is on, and how to start it.
const wait = (ms) => new Promise((r) => setTimeout(r, ms)), out = [], $ = (id) => document.getElementById(id), H = YX.hub, LF = YX.lookFix;
const cards = () => Array.from(document.querySelectorAll('#swHub .card')).map((c) => c.querySelector('.name').textContent + ' [' + c.querySelector('.chip').textContent + ']');
out.push('button: "' + $('swHubBtn').textContent + '", panel hidden at first: ' + !$('swHub').classList.contains('on'));
$('swHubBtn').click(); await wait(1500);
out.push('cards: ' + cards().join(' · '));
out.push('Look & Fix is on by default: ' + LF.enabled);
const tog = Array.from($('swHub').querySelectorAll('button')).find((b) => /Turn off/.test(b.textContent)); tog.click(); await wait(300);
out.push('after Turn off: enabled=' + LF.enabled + ', card says ' + cards()[0] + ', Try button disabled=' + Array.from($('swHub').querySelectorAll('button')).find((b) => /Try it/.test(b.textContent)).disabled);
Array.from($('swHub').querySelectorAll('button')).find((b) => /Turn on/.test(b.textContent)).click(); await wait(300);
out.push('after Turn on: enabled=' + LF.enabled + ', ' + cards()[0]);
LF.history.push({ ask: 'x', round: 0, match: false, problems: ['wheels were floating'] }); H.paint(); out.push('a past check is listed: ' + /wheels were floating/.test($('swHub').textContent));
Array.from($('swHub').querySelectorAll('button')).find((b) => /Open the training panel/.test(b.textContent)).click(); await wait(1500);
out.push('Open the training panel: hub closed=' + !$('swHub').classList.contains('on') + ', training panel open=' + ($('swTrain').style.display !== 'none') + ', it has the Watch it learn section=' + /Watch it learn/.test($('swTrain').textContent));
return out.join('\n');
