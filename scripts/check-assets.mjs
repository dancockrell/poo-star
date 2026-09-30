import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(readFileSync('docs/assets.json','utf8'));
for(const asset of [...manifest.assets,...(manifest.fontLicenseNotices||[])]){
 if(!existsSync(asset.path))throw Error(`Missing runtime asset: ${asset.path}`);
 const bytes=readFileSync(asset.path);
 if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error(`Runtime asset differs from manifest: ${asset.path}`);
}
console.log(`Verified ${manifest.assets.length} runtime assets against their recorded hashes.`);
