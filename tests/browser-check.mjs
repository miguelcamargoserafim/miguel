/** Smoke test real no Chrome headless via CDP. Execute com o navegador na porta 9229. */
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const targets=await (await fetch('http://127.0.0.1:9229/json')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let sequence=0;const calls=new Map(),events=[];
ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.id){const call=calls.get(data.id);calls.delete(data.id);data.error?call.reject(new Error(data.error.message)):call.resolve(data.result);}else events.push(data);});
const cdp=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence;calls.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
const evaluate=async(expression,contextId)=>{const result=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,...(contextId?{contextId}:{})});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const click=selector=>evaluate('document.querySelector('+JSON.stringify(selector)+').click()');
const value=(selector,text)=>evaluate('(()=>{const n=document.querySelector('+JSON.stringify(selector)+');n.value='+JSON.stringify(text)+';n.dispatchEvent(new Event("change",{bubbles:true}));})()');
const text=selector=>evaluate('document.querySelector('+JSON.stringify(selector)+').textContent');
const open=async index=>{await click('.lab-card:nth-child('+index+') button');await pause(80);};
try {
  await cdp('Runtime.enable');await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate',{url:new URL('../index.html',import.meta.url).href});
  for(let i=0;i<100;i++){await pause(100);if(await evaluate('document.querySelectorAll(".lab-card").length===6'))break;}
  console.log(await evaluate('({url:location.href,title:document.title,ready:document.readyState,lab:typeof StackLab,body:document.body.innerText.slice(0,200)})'));
  console.log(JSON.stringify(events.filter(e=>e.method==="Runtime.exceptionThrown")));
  assert.equal(await evaluate('document.querySelectorAll(".lab-card").length'),6);
  assert.equal(await evaluate('document.querySelectorAll(".lab-project").length'),4);
  console.log('PASS: seis cards e quatro projetos carregados');

  await open(4);await value('#lab-command','about');await evaluate('document.querySelector(".lab-terminal-input").requestSubmit()');await pause(450);
  assert.match(await text('.lab-terminal'),/Miguel Camargo Serafim/);
  await evaluate('document.querySelector("#lab-command").focus()');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowUp',code:'ArrowUp'});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowUp',code:'ArrowUp'});
  assert.equal(await evaluate('document.querySelector("#lab-command").value'),'about');
  await value('#lab-command','clear');await evaluate('document.querySelector(".lab-terminal-input").requestSubmit()');
  assert.equal(await text('.lab-terminal'),'');console.log('PASS: terminal, histórico pelo teclado e clear');

  await open(1);await pause(500);
  assert.match(await text('#lab-body .lab-status'),/Prévia executada/);
  const frameTarget=(await cdp('Target.getTargets')).targetInfos.find(t=>t.type==='iframe');
  assert.ok(frameTarget,'Alvo isolado do iframe');
  const {sessionId}=await cdp('Target.attachToTarget',{targetId:frameTarget.targetId,flatten:true});
  const inFrame=async expression=>(await cdp('Runtime.evaluate',{expression,returnByValue:true},sessionId)).result.value;
  assert.equal(await inFrame('document.querySelector("#counter").textContent'),'Cliques: 0');
  await inFrame('document.querySelector("#counter").click()');
  assert.equal(await inFrame('document.querySelector("#counter").textContent'),'Cliques: 1');
  assert.equal(await inFrame('(()=>{try{parent.document.body;return false}catch{return true}})()'),true);
  await click('#lab-tab-js');await value('#lab-code-input','const = ;');await click('#lab-body .lab-actions button:first-child');await pause(250);
  assert.match(await text('#lab-body .lab-status'),/Erro na prévia/);
  await click('#lab-body .lab-actions button:nth-child(2)');await pause(250);
  assert.match(await text('#lab-body .lab-status'),/Prévia executada/);
  console.log('PASS: prévia interativa, isolamento, erro de sintaxe e restauração');

  await open(2);await value('#lab-body select','4');await click('#lab-body > button');
  assert.match(await text('#lab-body'),/79.7/);
  await value('#lab-body textarea','DROP TABLE users;');await click('#lab-body > button');
  assert.match(await text('#lab-body .lab-status'),/não suportada/);console.log('PASS: SQL e erro informativo');

  await open(3);await value('#lab-body select','POST');await evaluate('document.querySelector("#lab-body form").requestSubmit()');
  assert.ok(await evaluate('!!document.querySelector(".lab-confirm")'));
  await click('.lab-confirm button:last-child');await pause(350);
  assert.match(await text('#lab-body .lab-status'),/HTTP 201/);
  assert.equal(JSON.parse(await text('.lab-response')).title,'Novo jogo demo');
  await value('#lab-body select','GET');await value('#lab-body input','/games/999');await evaluate('document.querySelector("#lab-body form").requestSubmit()');await pause(350);
  assert.match(await text('#lab-body .lab-status'),/HTTP 404/);console.log('PASS: confirmação de alteração, criação e HTTP 404');

  await open(5);await click('.lab-choice-list button:nth-child(2)');
  assert.equal(await evaluate('document.querySelector(".lab-solution").hidden'),false);
  console.log('PASS: cenário de suporte e solução');

  await evaluate('localStorage.removeItem("stack-lab-progress-v1")');await open(6);await click('#lab-body > .lab-tabs button:nth-child(2)');await value('#lab-body textarea','false');await evaluate('document.querySelector("#lab-body form").requestSubmit()');
  assert.match(await text('.lab-score'),/^10 \/ 110/);
  await evaluate('document.querySelector("#lab-body form").requestSubmit()');assert.match(await text('.lab-score'),/^10 \/ 110/);
  await open(4);await open(6);await click('#lab-body > .lab-tabs button:nth-child(2)');assert.match(await text('.lab-score'),/^10 \/ 110/);console.log('PASS: respostas, pontos únicos e progresso persistente');

  for(const width of [390,768,1440]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    for(let i=1;i<=6;i++){
      await open(i);
      assert.ok(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Sem overflow em '+width+' / módulo '+i);
    }
  }
  console.log('PASS: seis módulos sem overflow em 390, 768 e 1440px');
  await click('#lab-close');await cdp('Page.bringToFront');await evaluate('document.querySelector(".lab-card button").focus()');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await pause(100);
  assert.equal(await evaluate('document.querySelector("#lab-workspace").hidden'),false);
  await evaluate('document.querySelector("#lab-tab-html").focus()');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight'});
  assert.equal(await evaluate('document.activeElement.id'),'lab-tab-css');
  await click('#lab-close');assert.equal(await evaluate('document.activeElement.closest(".lab-card")!==null'),true);
  console.log('PASS: abrir, alternar abas e retornar com foco pelo teclado');
  await mkdir(root+'.test-results',{recursive:true});
  for(const [name,width,height] of [['desktop',1440,1100],['mobile',390,1000]]){
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});
    await evaluate('document.querySelector("#stack-lab").scrollIntoView({behavior:"instant"})');await pause(150);
    const screenshot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(root+'.test-results/'+name+'.png',Buffer.from(screenshot.data,'base64'));
  }
  const exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown'&&!JSON.stringify(e.params).includes('SyntaxError'));
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));console.log('PASS: nenhum erro inesperado de JavaScript');
} finally {ws.close();}
