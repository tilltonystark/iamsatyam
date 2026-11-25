import {build} from 'esbuild';
import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await Promise.all(['assets','src','index.html'].map(path=>cp(path,'dist/'+path,{recursive:true})));
await build({entryPoints:['demo.jsx'],outfile:'dist/demo.js',bundle:true,format:'esm',external:['./src/*'],minify:true,define:{'process.env.NODE_ENV':'"production"'}});
