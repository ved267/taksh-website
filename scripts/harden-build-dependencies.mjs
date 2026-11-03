// Temporary, repeatable mitigation for GHSA-vfj7-8cjw-p6xm. Upstream braces
// has no patched release. Keep npm audit visible; remove this when it does.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const marker='TAKSH_BRACES_DEPTH_GUARD';
const guard=`// ${marker}: validate iteratively before upstream recursive walkers.
module.exports = function checkDepth(ast) {
 const pending=[[ast,0]],seen=new Set();let count=0;
 while(pending.length){
  const [node,depth]=pending.pop();
  if(!node||typeof node!=='object')continue;
  if(depth>128||seen.has(node)||++count>65536)throw new SyntaxError('Brace nesting exceeds safe limit.');
  seen.add(node);
  if(Array.isArray(node.nodes))for(const child of node.nodes)pending.push([child,depth+1]);
 }
};
`;
const edits=[
 ['parse.js','      stack.push(block);',"      if(stack.length>=128)throw new SyntaxError('Brace nesting exceeds safe limit.');\n      stack.push(block);"],
 ['compile.js','const compile = (ast, options = {}) => {',"const compile = (ast, options = {}) => {\n  require('./taksh-depth-guard')(ast);"],
 ['expand.js','const expand = (ast, options = {}) => {',"const expand = (ast, options = {}) => {\n  require('./taksh-depth-guard')(ast);"],
 ['stringify.js','module.exports = (ast, options = {}) => {',"module.exports = (ast, options = {}) => {\n  require('./taksh-depth-guard')(ast);"],
];
let patched=0;
for(const [relative,entry] of Object.entries(lock.packages)){
 if(!relative.endsWith('/braces'))continue;
 if(entry.version!=='3.0.3')throw new Error('Review braces security mitigation for the new upstream version.');
 const folder=path.join(root,relative,'lib');
 if(!fs.existsSync(folder))throw new Error('Install locked dependencies before applying the braces guard.');
 for(const [name,from,to] of edits){
  const file=path.join(folder,name),source=fs.readFileSync(file,'utf8');
  if(source.includes(marker))continue;
  if(!source.includes(from))throw new Error('Unexpected braces source; security patch was not applied.');
  fs.writeFileSync(file,`// ${marker}\n`+source.replaceAll(from,to));
 }
 fs.writeFileSync(path.join(folder,'taksh-depth-guard.js'),guard);patched++;
}
if(!patched)throw new Error('Review whether the braces mitigation is still needed.');
console.log(`Applied nesting guard to ${patched} locked braces package(s). Audit advisories remain visible.`);
