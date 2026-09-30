import {copyFileSync,cpSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
mkdirSync('dist/licenses',{recursive:true});
for(const name of ['music-license.md','effects-license.md','casino-audio-license.txt']){
 if(existsSync(`docs/${name}`))copyFileSync(`docs/${name}`,`dist/licenses/${name}`);
}
if(existsSync('docs/font-licenses'))cpSync('docs/font-licenses','dist/licenses/fonts',{recursive:true});
writeFileSync('dist/build.json',JSON.stringify({project:'Poo Star',revision,mode:'fictional-credit-demo'},null,2)+'\n');
writeFileSync('dist/.nojekyll','');
