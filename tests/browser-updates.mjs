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
const waitForRun = async () => {
  for(let i=0;i<40;i++){await pause(100);if(await evaluate('!document.querySelector("#game-run")?.disabled'))return;}
  throw new Error('Execução não terminou no prazo esperado.');
};
const input = async (selector, text) => {
  await value(selector,text);
  await evaluate('document.querySelector('+JSON.stringify(selector)+').dispatchEvent(new Event("input",{bubbles:true}))');
};
const editGame = async code => {
  for(const [language,source] of Object.entries(code)) {
    await click('#game-tab-'+language);await input('#game-code',source);
  }
};
try {
  await cdp('Runtime.enable'); await cdp('Page.enable');
  await cdp('Page.navigate',{url:new URL('../index.html',import.meta.url).href});
  for(let i=0;i<100;i++){await pause(100);if(await evaluate('document.querySelectorAll(".lab-card").length===6'))break;}
  assert.equal(await evaluate('document.querySelector("#projects")'),null);
  assert.equal(await evaluate('Array.from(document.querySelectorAll("a")).filter(a=>a.hash==="#projects").length'),0);
  assert.equal(await evaluate('document.body.innerText.includes("SubControl")'),false);
  assert.equal(await evaluate('document.querySelectorAll(".top-contacts a").length'),5);
  assert.equal(await evaluate('Array.from(document.querySelectorAll(".lab-registered-skills span")).map(n=>n.textContent).join(",")'),'HTML,CSS,JavaScript,TypeScript,Cobalt,AI Specialist');
  console.log('PASS: remoções, contatos superiores e habilidades');

  await evaluate('localStorage.removeItem("stack-lab-games-v1")');
  await open(6);
  assert.ok(await evaluate('document.querySelector("#game-code").value.length>0'));
  assert.equal(await evaluate('document.querySelector(".game-panels").hidden'),true);
  await click('.game-start');await waitForRun();await click('#game-run');await waitForRun();
  assert.match(await text('.lab-score'),/^0 \/ 70/);
  assert.match(await text('.game-result-area .lab-status'),/Ainda falta/);
  await editGame({js:'let tentativa = 5; let numeroSecreto = 5; console.log("Parabéns! Você acertou!");'});await click('#game-run');await waitForRun();
  assert.match(await text('.lab-score'),/^0 \/ 70/);
  await editGame({js:'while (true) {}'});await click('#game-run');await waitForRun();
  assert.match(await text('.game-result-area .lab-status'),/demorou demais/);
  assert.ok(await evaluate('document.querySelector("#lab-close")!==null'));
  console.log('PASS: tentativas erradas não concluem e laço infinito é interrompido');

  for(let index=0;index<5;index++) {
    await value('#game-select',String(index));
    assert.ok(await evaluate('document.querySelector("#game-code").value.trim().length>0'));
    await click('.game-start');await waitForRun();
    if(index===3)assert.match(await text('.game-result-area .lab-status'),/loog/);
    await evaluate('Array.from(document.querySelectorAll(".game-instructions button")).find(b=>b.textContent==="Dica").click()');
    const hint1=await text('.game-instructions .lab-status');
    await evaluate('Array.from(document.querySelectorAll(".game-instructions button")).find(b=>b.textContent==="Dica").click()');
    assert.notEqual(await text('.game-instructions .lab-status'),hint1);
    await evaluate('Array.from(document.querySelectorAll(".game-instructions button")).find(b=>b.textContent==="Ver solução").click()');
    await evaluate('Array.from(document.querySelectorAll(".game-instructions button")).find(b=>b.textContent==="Aplicar solução no editor").click()');
    await click('#game-run');await waitForRun();
    assert.match(await text('.game-result-area .lab-status'),/Parabéns/,'Solução do jogo '+index);
    const points=await text('.lab-score');
    await click('#game-run');await waitForRun();assert.equal(await text('.lab-score'),points);
    await click('#game-restore');await waitForRun();
    assert.equal(await evaluate('document.querySelector("#game-code").value===StackLab.games['+index+'].code[document.querySelector(".game-editor-panel").getAttribute("aria-labelledby").replace("game-tab-","")]'),true);
  }
  assert.match(await text('.lab-score'),/^70 \/ 70/);
  await value('#game-select','2');await click('.game-start');await waitForRun();
  await value('#game-objective','subtract');
  const subtract=await evaluate('StackLab.games[2].solution.js.replace("numero1 * numero2","numero1 - numero2")');
  await editGame({js:subtract});await click('#game-run');await waitForRun();assert.match(await text('.game-result-area .lab-status'),/Parabéns/);
  await click('.game-result-area > button');assert.equal(await evaluate('document.querySelector(".game-panels").hidden'),true);
  await open(4);await open(6);assert.match(await text('.lab-score'),/^70 \/ 70/);
  await evaluate('Array.from(document.querySelectorAll("#lab-body button")).find(b=>b.textContent==="Reiniciar progresso dos minijogos").click()');
  await click('.lab-confirm button:last-child');assert.match(await text('.lab-score'),/^0 \/ 70/);
  console.log('PASS: cinco soluções, dicas, restauração, próximo, pontuação única, persistência e reinício');

  await open(5);
  assert.equal(await evaluate('document.querySelector("#support-library-category").options.length'),12);
  for(const id of await evaluate('StackLab.supportProblems.map(p=>p.id)')) {
    await value('#support-library-category',id);
    assert.match(await text('.support-library'),/Possíveis causas/);
  }
  await value('#support-problem','internet');await value('#support-level','severe');await value('#support-duration','other');
  assert.equal(await evaluate('document.querySelector("#support-other-period").required'),true);
  await input('#support-other-period','Desde ontem');
  await input('#support-description','Meu computador & Wi-Fi falham? "Teste" 😟');
  await value('#support-device','other');await input('#support-other-device','Mini PC');await input('#support-tried','Testei outro aparelho.');
  await evaluate('document.querySelector("#support-form").requestSubmit()');
  const prepared=await text('.support-review pre');
  const link=await evaluate('document.querySelector("#support-whatsapp").href');
  assert.equal(new URL(link).origin,'https://wa.me');
  assert.equal(new URL(link).pathname,'/5524999765334');
  assert.equal(new URL(link).searchParams.get('text'),prepared);
  assert.match(prepared,/Desde ontem/);assert.match(prepared,/Mini PC/);assert.match(prepared,/Testei outro aparelho/);
  await input('#support-description','Relato alterado');
  assert.equal(await evaluate('document.querySelector(".support-review").hidden'),true);
  assert.equal(await evaluate('document.querySelector("#support-whatsapp").hasAttribute("href")'),false);
  assert.equal(await evaluate('Object.keys(localStorage).some(k=>k.includes("support"))'),false);
  console.log('PASS: biblioteca, formulário, Outro, WhatsApp fiel e ausência de envio/armazenamento');

  await mkdir(root+'.test-results',{recursive:true});
  for(const width of [390,768,1440]) {
    await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
    await open(6);
    for(let i=0;i<5;i++) {
      await value('#game-select',String(i));await click('.game-start');await waitForRun();
      assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Sem overflow no jogo '+i+' em '+width);
    }
    await open(5);assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    await evaluate('document.querySelector("#lab-workspace").scrollIntoView({behavior:"instant"})');
    const screenshot=await cdp('Page.captureScreenshot',{format:'png'});
    await writeFile(root+'.test-results/support-'+width+'.png',Buffer.from(screenshot.data,'base64'));
  }
  console.log('PASS: cinco minijogos e suporte responsivos em 390, 768 e 1440px');
  await open(6);await click('.game-start');await waitForRun();
  await evaluate('document.querySelector("#lab-workspace").scrollIntoView({behavior:"instant"})');
  const screenshot=await cdp('Page.captureScreenshot',{format:'png'});
  await writeFile(root+'.test-results/game-desktop.png',Buffer.from(screenshot.data,'base64'));
  await evaluate('document.querySelector("#top").scrollIntoView({behavior:"instant"})');
  const header=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(root+'.test-results/header.png',Buffer.from(header.data,'base64'));
  console.log('PASS: capturas finais geradas');
} finally {ws.close();}
