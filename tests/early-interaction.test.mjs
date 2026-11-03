import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {earlyInteractionScript} from '../lib/early-interaction.mjs';
function setup(){let listener;const document={addEventListener(type,fn){listener=fn},removeEventListener(type,fn){assert.equal(fn,listener);listener=null}};const window={};runInNewContext(earlyInteractionScript,{window,document});return{window,click(target){let blocked=false;listener?.({target:{closest:()=>target},preventDefault(){blocked=true},stopImmediatePropagation(){}});return blocked},get attached(){return !!listener}}}
test('an early visual tap is replayed once after readiness',()=>{const s=setup();let taps=0;const t={isConnected:true,disabled:false,click(){taps++}};assert.equal(s.click(t),true);s.window.__takshReleaseVisualTap();assert.equal(taps,1);assert.equal(s.attached,false);assert.equal(s.window.__takshReleaseVisualTap,undefined)});
test('nonvisual and disabled controls are not intercepted',()=>{const s=setup();assert.equal(s.click(null),false);assert.equal(s.click({disabled:true}),false);s.window.__takshReleaseVisualTap()});
test('the latest choice replaces the earlier tap and detached targets are ignored',()=>{const s=setup();let taps=0;s.click({isConnected:true,click(){taps++}});s.click({isConnected:false,click(){taps++}});s.window.__takshReleaseVisualTap();assert.equal(taps,0)});
test('a cookie choice tap before hydration opens the preferences once ready',()=>{
 let listener,taps=0;const document={addEventListener(type,fn){listener=fn},removeEventListener(){listener=null}},window={};
 runInNewContext(earlyInteractionScript,{window,document});
 const button={disabled:false,isConnected:true,click(){taps++}};
 listener({target:{closest:selector=>selector.split(',').includes('.analytics-choices')?button:null},preventDefault(){},stopImmediatePropagation(){}});
 window.__takshReleaseVisualTap();assert.equal(taps,1);
});

test('Gully build and gallery tools preserve the first startup tap',()=>{
 for(const selector of ['.gc-build-choices button','.gc-explorer-tools button']){
  let listener,taps=0;const document={addEventListener(type,fn){listener=fn},removeEventListener(){listener=null}},window={};
  runInNewContext(earlyInteractionScript,{window,document});
  const button={disabled:false,isConnected:true,click(){taps++}};
  listener({target:{closest:selectors=>selectors.split(',').includes(selector)?button:null},preventDefault(){},stopImmediatePropagation(){}});
  window.__takshReleaseVisualTap();assert.equal(taps,1);
 }
});
