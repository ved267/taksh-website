import {execFileSync}from'node:child_process';import{previewBranchAllowed}from'../lib/cloudflare/deployment-policy.mjs';
const branch=process.env.TAKSH_PREVIEW_BRANCH,url=process.env.TAKSH_PREVIEW_URL;
if(!previewBranchAllowed(branch)||!/^https:\/\/[a-z0-9-]+\.taksh-ved267\.workers\.dev$/.test(url||''))throw new Error('Missing verified branch preview URL.');
function gh(args,input){return JSON.parse(execFileSync('gh',args,{encoding:'utf8',...(input?{input:JSON.stringify(input)}:{})}));}
const repository='ved267/taksh-website',prs=gh(['api',`repos/${repository}/pulls?state=open&head=ved267:${encodeURIComponent(branch)}`]);
const body=`<!-- taksh-preview -->\nPreview: [Open isolated Taksh preview](${url})\n\nBranch: ${branch}. Synthetic database and uploads; production storage and customer email are excluded. Claude and Codex use this same workflow.`;
for(const pr of prs){const comments=gh(['api',`repos/${repository}/issues/${pr.number}/comments`]);const previous=comments.find(c=>c.user?.type==='Bot'&&c.body?.startsWith('<!-- taksh-preview -->'));gh(['api',previous?`repos/${repository}/issues/comments/${previous.id}`:`repos/${repository}/issues/${pr.number}/comments`,'--method',previous?'PATCH':'POST','--input','-'],{body});}
console.log(prs.length?'Preview URL posted to pull request.':'No open pull request yet; preview URL is in the workflow summary.');
