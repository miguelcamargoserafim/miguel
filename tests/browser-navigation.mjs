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
  await mkdir(root+'.test-results',{recursive:true});
  for(const page of ['index.html','contact.html']) {
    await cdp('Page.navigate',{url:new URL('../'+page,import.meta.url).href});
    for(let i=0;i<80;i++){await pause(100);if(await evaluate('typeof portfolioI18n!=="undefined"'))break;}
    for(const width of [390,768,1440]) {
      await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
      for(const language of ['pt-BR','en']) {
        await value('#language',language);
        assert.equal(await evaluate('document.documentElement.lang'),language);
        assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
        assert.equal(await evaluate('document.querySelectorAll(".site-header nav a").length'),3);
        assert.equal(await evaluate('document.querySelectorAll(".top-contacts a").length'),5);
        const theme=await evaluate('document.documentElement.dataset.theme');await click('#theme-toggle');
        assert.notEqual(await evaluate('document.documentElement.dataset.theme'),theme);await click('#theme-toggle');
      }
      if(page==='index.html') {
        await evaluate('window.scrollTo({top:0,behavior:"instant"})');await pause(100);
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        await writeFile(root+'.test-results/header-'+width+'.png',Buffer.from(shot.data,'base64'));
      }
    }
    assert.equal(await evaluate('Array.from(document.querySelectorAll("a")).some(a=>a.hash==="#projects")'),false);
    console.log('PASS: '+page+' — contatos, menu, idiomas e temas em três larguras');
  }
} finally {ws.close();}
