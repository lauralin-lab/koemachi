const car = byType('house')[0]; const up = (n) => YX.exec({ op: 'move', id: '#' + car.id, by: { up: n } }, YX.newCtx()).msg;
out.push(await say('zero gravity', null)); out.push('env.gravity=' + W.env.gravity);
out.push('lift 5: ' + up(5)); step(2.5); out.push('y after 2.5 s with no gravity: ' + car.y.toFixed(2));
out.push('saved gravity=' + YX.serialize().env.gravity);
out.push(await say('normal gravity', null)); step(2.5); out.push('y after gravity is back: ' + car.y.toFixed(2));
out.push(await say('关掉重力', null)); out.push('env.gravity=' + W.env.gravity); out.push(await say('undo', null)); out.push('after undo gravity=' + W.env.gravity);
out.push(await say('moon gravity', null)); out.push('lift 5: ' + up(5)); step(1.0); out.push('moon: y after 1 s ' + car.y.toFixed(2)); step(4); out.push('moon: y after 5 s ' + car.y.toFixed(2));
out.push(await say('normal gravity', null));
return out.join('\n');
