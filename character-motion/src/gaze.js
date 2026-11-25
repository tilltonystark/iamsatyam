// One shadow root per instance keeps the eye masks and blink keyframes local.
export function mountGaze(host,{width='100%',travel=7}={}){
 const root=host.shadowRoot||host.attachShadow({mode:'open'}), reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let disposed=false, frame=0,x=0,y=0,tx=0,ty=0,eyes=[];
 const ready=fetch(new URL('../assets/portrait.svg',import.meta.url)).then(r=>{if(!r.ok)throw Error('Portrait unavailable');return r.text()}).then(svg=>{
  if(disposed)return;
  root.innerHTML='<style>:host{display:block}svg{width:100%;height:auto;display:block}.closed{opacity:0}.blink{animation:b 4.8s infinite}.closed{animation:l 4.8s infinite}@keyframes b{0%,94%,99%,100%{transform:scaleY(1)}96%,97%{transform:scaleY(.04)}}@keyframes l{0%,94%,99%,100%{opacity:0}96%,97%{opacity:1}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>'+svg;
  root.querySelector('svg').style.width=typeof width==='number'?width+'px':width;eyes=root.querySelectorAll('.pupil');
 });
 function tick(){x+=(tx-x)*.25;y+=(ty-y)*.25;eyes.forEach(p=>p.setAttribute('transform','translate('+x+' '+y+')'));frame=Math.abs(tx-x)+Math.abs(ty-y)>.03?requestAnimationFrame(tick):0}
 function move(e){if(reduced.matches||e.pointerType==='touch')return;const r=(root.querySelector('svg')||host).getBoundingClientRect(),dx=e.clientX-r.left-r.width*.46,dy=e.clientY-r.top-r.height*.38,d=Math.max(65,Math.hypot(dx,dy));tx=dx/d*travel;ty=dy/d*3;if(!frame)tick()}
 function center(){tx=ty=0;if(!frame)tick()}
 window.addEventListener('pointermove',move);window.addEventListener('blur',center);
 return {ready,destroy(){disposed=true;cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);window.removeEventListener('blur',center);root.replaceChildren()}};
}
