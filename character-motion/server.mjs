import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist'),mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost'),p=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!p.startsWith(root+sep))throw Error();const body=await readFile(p);res.writeHead(200,{'Content-Type':mime[extname(p)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end()}}).listen(4174,'127.0.0.1',()=>console.log('http://127.0.0.1:4174'));
