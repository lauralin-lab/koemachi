YX.lang='zh'; YX.three.renderer.setPixelRatio(0.3); YX.resize && YX.resize();
const logs=[]; YX.hooks.log=(e)=>{ logs[e.id]={text:e.text,tier:e.tier,status:e.status,msgs:e.msgs.slice()}; };
const sent=[]; YX.mind.setSample(async (prompt,opt)=>{ sent.push(1); return {text:'{"op":"say","text":"(mock)"}'}; });
const wait=(ms)=>new Promise(r=>setTimeout(r,ms)); await wait(300);
const house = Array.from(YX.world.objs.values()).find(o=>o.type==='house');
const tests=['把眼前的这个房子变大一点、再高一点、再高一点','在这个房子上再加一只鸟','在马路对面放一个咖啡馆','再大一点','把它变成蓝色','变成黄昏','下雪','在咖啡馆旁边种三棵樱花树','路两边种一排松树','撤销','保存机位','85毫米','环绕这个房子一圈','往左移两米','天上放五朵云','在长椅上放一只猫','带我去喷泉','白模','恢复颜色','转一下','again','在这里放一盏灯','晚上八点','make it taller','给我来一辆红色的车','在房顶上加一只鸟然后变成晚上','把这个房子改成咖啡馆','把那辆出租车变成面包车','在路边放一个邮筒','把汽车开到马路上','让他走到长椅那里','让这个人坐下','大家鼓掌','把它挪到这里','把它放到咖啡馆旁边','加一只恐龙','删掉这个房子'];
const out=[];
for(const t of tests){ YX.world.aim = YX.world.objs.get(house.id) || null; const n0=YX.world.objs.size; YX.mind.commit(t); await wait(80); const e=logs[logs.length-1]; out.push(t+'  ⇒  ['+e.tier+'/'+e.status+'] '+e.msgs.join(' | ')+'  ('+n0+'→'+YX.world.objs.size+')'); }
await wait(600);
return out.join('\n')+'\nrouted calls: '+sent.length;
