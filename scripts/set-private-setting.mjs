// Run personally in Terminal. Hidden entry; no plaintext/hash/token in argv, files or output.
import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';import{resolve}from'node:path';
const mode=process.argv[2];
const modes={
 'production-admin':{worker:'taksh-store',config:'wrangler.json',secret:'ADMIN_PASSWORD_HASH',password:true},
 'staging-admin':{worker:'taksh-staging',config:'wrangler.staging.json',secret:'ADMIN_PASSWORD_HASH',password:true},
 'production-sheet':{worker:'taksh-store',config:'wrangler.json',secret:'CUSTOMER_SHEET_SYNC_KEY',sync:true},
 'staging-sheet':{worker:'taksh-staging',config:'wrangler.staging.json',secret:'CUSTOMER_SHEET_SYNC_KEY',sync:true},
 'deployment-token':{github:true}
};
const setting=modes[mode];if(!setting)throw new Error('Choose production-admin, staging-admin, production-sheet, staging-sheet or deployment-token.');
async function hidden(prompt){if(!process.stdin.isTTY)throw new Error('Enter this setting personally in a private Terminal window.');process.stdout.write(prompt);process.stdin.setEncoding('utf8');process.stdin.setRawMode(true);process.stdin.resume();return new Promise((ok,bad)=>{let input='';function finish(error){process.stdin.off('data',read);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');if(error)bad(error);else ok(input);}function read(chunk){for(const char of chunk){if(char==='\u0003'){finish(new Error('Cancelled.'));return;}if(char==='\r'||char==='\n'){finish();return;}if(char==='\u007f'||char==='\b')input=Array.from(input).slice(0,-1).join('');else if(char>=' ')input+=char;if(input.length>4096){finish(new Error('Setting is too long.'));return;}}}process.stdin.on('data',read);});}
let value=await hidden(setting.password?'New owner password (hidden): ':'Private setting value (hidden): ');
if(setting.password){if(value.length<12)throw new Error('Use a password/passphrase of at least12characters.');if(value!==await hidden('Confirm password (hidden): '))throw new Error('Passwords do not match.');value=createHash('sha256').update(value).digest('hex');}
else if(setting.sync&&!/^[a-f0-9]{64}$/.test(value))throw new Error('Copy the existing64character hexadecimal Sheet key exactly.');
else if(!setting.sync&&(!value||/\s/.test(value)))throw new Error('The token must be a non-empty single value.');

if(setting.github)execFileSync('gh',['secret','set','CLOUDFLARE_API_TOKEN','--repo','ved267/taksh-website'],{input:value,stdio:['pipe','inherit','inherit']});
else execFileSync(process.execPath,[resolve('node_modules/wrangler/bin/wrangler.js'),'secret','put',setting.secret,'--name',setting.worker,'--config',setting.config],{input:value+'\n',stdio:['pipe','inherit','inherit'],env:{...process.env,WRANGLER_LOG:'warn'}});
value='';console.log('Private setting saved. Its value was not printed or saved in this checkout.');
