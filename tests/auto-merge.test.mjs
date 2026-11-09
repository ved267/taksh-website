import test from 'node:test';
import assert from 'node:assert/strict';
import {decide,VALIDATE_JOB} from '../scripts/auto-merge.mjs';

const repo='ved267/taksh-website';
const base=()=>({
 run:{event:'pull_request',conclusion:'success',head_branch:'claude/x',head_sha:'h1'},
 pr:{state:'open',draft:false,labels:[],base:{ref:'main',sha:'m1'},head:{sha:'h1',repo:{full_name:repo}}},
 jobs:[{name:VALIDATE_JOB,conclusion:'success'}],
 mainSha:'m1',mainValidate:{status:'completed',conclusion:'success'},repo,hasToken:true});
const act=over=>{const c=base();over?.(c);return decide(c).action;};

test('merges a green, current claude/* pull request',()=>assert.equal(act(),'merge'));
test('never touches codex/* or other branches',()=>{assert.equal(act(c=>{c.run.head_branch='codex/y'}),'skip');assert.equal(act(c=>{c.run.head_branch='main'}),'skip');});
test('skips failed, drafts, holds, closed, forks and non-main bases',()=>{
 assert.equal(act(c=>{c.run.conclusion='failure'}),'skip');
 assert.equal(act(c=>{c.pr.draft=true}),'skip');
 assert.equal(act(c=>{c.pr.labels=[{name:'hold'}]}),'skip');
 assert.equal(act(c=>{c.pr.state='closed'}),'skip');
 assert.equal(act(c=>{c.pr.head.repo.full_name='someone/fork'}),'skip');
 assert.equal(act(c=>{c.pr.base.ref='release'}),'skip');
 assert.equal(act(c=>{c.pr=null}),'skip');
});
test('skips when the PR moved on after this Validate run',()=>assert.equal(act(c=>{c.pr.head.sha='h2'}),'skip'));
test('never merges when the Validate job was skipped (TAKSH_CI_READY off)',()=>{
 assert.equal(act(c=>{c.jobs=[{name:VALIDATE_JOB,conclusion:'skipped'}]}),'skip');
 assert.equal(act(c=>{c.jobs=[]}),'skip');
});
test('waits for main Validate, stops on a red main',()=>{
 assert.equal(act(c=>{c.mainValidate={status:'in_progress'}}),'wait');
 assert.equal(act(c=>{c.mainValidate=undefined}),'wait');
 const d=decide({...base(),mainValidate:{status:'completed',conclusion:'failure'}});
 assert.equal(d.action,'stop');assert.match(d.comment,/Validate on main/);
});
test('asks for the token instead of merging without it',()=>{const d=decide({...base(),hasToken:false});assert.equal(d.action,'stop');assert.match(d.comment,/auto-merge needs AUTOMERGE_TOKEN/);});
test('updates the branch when main has moved',()=>assert.equal(act(c=>{c.mainSha='m2'}),'update'));
