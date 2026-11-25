const mix=(a,b,t)=>a+(b-a)*t;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function mountRunner({target='[data-land]',speed=1,height=104,startScale=.52,landingOffset=.13,idleSeconds=6,wind=true,sound=false,onPhase=()=>{},...extra}={}){
 let options={target,speed,height,startScale,landingOffset,idleSeconds,wind,sound,...extra}, raf=0,timer=0,phase='',dead=false,loaded=false,audio;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'), c=document.createElement('canvas'), ctx=c.getContext('2d'),imgs={};
 c.style.cssText='position:fixed;inset:0;pointer-events:none;width:100vw;height:100vh;z-index:2';c.setAttribute('aria-hidden','true');document.body.append(c);
 const buffer=document.createElement("canvas"),rig=buffer.getContext("2d");
 const ready=Promise.all(['front','jump','run0','run1','run2','run3'].map(async k=>{const im=new Image();im.src=new URL('../assets/'+k+'.webp',import.meta.url);await im.decode();imgs[k]=im})).then(()=>{if(!dead){buffer.width=imgs.front.width;buffer.height=imgs.front.height;loaded=true;reset()}});
 function state(s){if(s!==phase){phase=s;onPhase(s)}}
 function reset(){cancelAnimationFrame(raf);clearTimeout(timer);c.hidden=true;state('At rest');if(loaded&&!document.hidden&&!reduce.matches&&options.enabled!==false&&matchMedia('(pointer:fine)').matches)timer=setTimeout(play,Math.max(.5,options.idleSeconds)*1000)}
 function unlock(){if(options.sound){const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio??=new Audio();audio.resume().catch(()=>{})}}}
 function tone(freq,len,vol){if(!options.sound||audio?.state!=='running')return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.45,t+len);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+len)}
 function play(){
  if(!loaded||dead||reduce.matches||document.hidden||options.enabled===false)return;
  const targets=typeof options.target==='string'?[...document.querySelectorAll(options.target)]:[options.target];
  const el=targets.filter(Boolean).filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.top>40&&r.top<innerHeight-15}).sort((a,b)=>Math.abs(a.getBoundingClientRect().top-innerHeight*.55)-Math.abs(b.getBoundingClientRect().top-innerHeight*.55))[0];
  if(!el)return;
  cancelAnimationFrame(raf);clearTimeout(timer);
  const r=el.getBoundingClientRect(),font=getComputedStyle(el);ctx.font=font.fontSize+' '+font.fontFamily;
  const m=ctx.measureText(el.textContent),seat=r.top+r.height/2+((m.fontBoundingBoxAscent||parseFloat(font.fontSize)*.88)-(m.fontBoundingBoxDescent||parseFloat(font.fontSize)*.22))/2-m.actualBoundingBoxAscent+1;
  const H=clamp(options.height,45,Math.min(170,innerWidth*.32)),end=r.left+r.width*clamp(options.landingOffset,0,1),start=Math.max(12,end-Math.min(420,innerWidth*.46)),take=mix(start,end,.7),floor=Math.min(innerHeight-12,seat+H*.85);
  const ratio=Math.min(devicePixelRatio,3);c.width=innerWidth*ratio;c.height=innerHeight*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);c.hidden=false;
  let last=-1,gesture=0,next=.5,wave=true;const begin=performance.now();
  function draw(im,x,y,h){const w=h*im.width/im.height;ctx.drawImage(im,x-w/2,y-h,w,h)}
  function animate(now){
   const t=(now-begin)/1000*clamp(options.speed,.25,3);ctx.clearRect(0,0,innerWidth,innerHeight);
   if(t<1.65){
    state('Running');const u=t/1.65,step=Math.floor(t*11),h=H*mix(clamp(options.startScale,.2,1),1,u),x=mix(start,take,u),y=mix(floor-32,floor,u)-h*.025*Math.sin(t*11*Math.PI/2)**2;
    if(step!==last&&step%2===0)tone(115,.055,.05);last=step;
    if(options.wind){ctx.strokeStyle='#423c344d';for(let i=0;i<3;i++){let f=(t*2+.33*i)%1;ctx.beginPath();ctx.moveTo(x-h*(.32+.15*f),y-h*(.34+.13*i));ctx.lineTo(x-h*(.40+.20*f),y-h*(.34+.13*i));ctx.stroke()}}
    draw(imgs['run'+step%4],x,y,h);
   }else if(t<2.36){
    if(phase!=='Jumping')tone(420,.16,.025);state('Jumping');const u=(t-1.65)/.71;draw(imgs.jump,mix(take,end,u),mix(floor,seat+.40*H,u)-4*u*(1-u)*H*.8,H*.86)
   }else{
    if(phase!=='Seated')tone(155,.085,.04);state('Seated');const age=t-2.36;if(age>=next){gesture=age;next=age+2.5+Math.random()*2.6;wave=Math.random()<.55}
    const env=Math.sin(Math.PI*clamp((age-gesture)/1.5,0,1)),hand=wave?env*Math.sin(age*10):0,leg=(.28+(wave?0:env))*Math.sin(age*4);
    const im=imgs.front,w=im.width,h=im.height;rig.clearRect(0,0,w,h);
    for(let y=0;y<h;y+=2){const v=y/h,split=Math.round((v<.37?.26:.5)*w),swing=clamp((v-.62)/.35,0,1)*leg*w*.05,reach=clamp((.34-v)/.20,0,1)*hand*w*.065;
     rig.drawImage(im,0,y,split,2,swing+reach,y,split,2.5);rig.drawImage(im,split,y,w-split,2,split-swing,y,w-split,2.5)}
    draw(buffer,end,seat+H*.41+2*Math.sin(Math.min(age/.16,1)*Math.PI),H)
   }
   raf=requestAnimationFrame(animate)
  }
  raf=requestAnimationFrame(animate)
 }
 function activity(){if(phase==='At rest')reset()}
 const listeners=[[window,'scroll',reset],[window,'resize',reset],[document,'visibilitychange',reset],[window,'pointerdown',unlock],[window,'pointermove',activity],[window,'keydown',activity],[reduce,'change',reset]];
 listeners.forEach(([el,k,fn])=>el.addEventListener(k,fn));reset();
 return {ready,play,configure(p){Object.assign(options,p);if(p.sound)unlock();reset()},destroy(){dead=true;clearTimeout(timer);cancelAnimationFrame(raf);listeners.forEach(([el,k,fn])=>el.removeEventListener(k,fn));audio?.close();c.remove()}};
}
