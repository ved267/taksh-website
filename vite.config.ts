import vinext from 'vinext';
import {defineConfig} from 'vite';
import {cloudflare} from '@cloudflare/vite-plugin';
export default defineConfig({
 define:{__TAKSH_BUILD__:JSON.stringify(process.env.TAKSH_PERFORMANCE_BUILD_ID||process.env.CF_VERSION_METADATA_ID||process.env.CF_PAGES_COMMIT_SHA||process.env.GITHUB_SHA||String(Date.now()))},
 plugins:[vinext(),cloudflare({configPath:process.env.TAKSH_WRANGLER_CONFIG||'wrangler.json',viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false})],
});
