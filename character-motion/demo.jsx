import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useDialKit,DialRoot} from 'dialkit';
import 'dialkit/styles.css';
import {mountRunner} from './src/runner.js';
import {mountGaze} from './src/gaze.js';
const controls={speed:[1,.4,2,.05],height:[104,60,155,1],startScale:[.52,.25,.9,.01],landingOffset:[.13,.02,.95,.01],idleSeconds:[6,2,18,.5],wind:true,sound:false,target:{type:'select',options:['Visible heading','Design','Projects','Journal']}};
function Demo(){
 const v=useDialKit('Character motion',controls), runner=useRef(null),face=useRef(null),[phase,setPhase]=useState('At rest'),[enabled,setEnabled]=useState(true);
 useEffect(()=>{const portrait=mountGaze(face.current),r=mountRunner({onPhase:setPhase});runner.current=r;return()=>{r.destroy();portrait.destroy()}},[]);
 useEffect(()=>{runner.current?.configure({...v,target:v.target==='Visible heading'?'[data-land]':'#'+v.target,enabled})},[v.speed,v.height,v.startScale,v.landingOffset,v.idleSeconds,v.wind,v.sound,v.target,enabled]);
 function replay(){const el=v.target==='Visible heading'?null:document.getElementById(v.target);if(el){el.scrollIntoView({block:'center',behavior:'instant'});requestAnimationFrame(()=>requestAnimationFrame(()=>runner.current?.play()))}else runner.current?.play()}
 return <><header><b>Portrait Studio</b><span>Motion playground</span></header><main><h1>Motion studies.</h1><p>Move your cursor to guide his eyes. Pause to see the run, or replay it below.</p><nav><b role="status">{phase}</b><button onClick={()=>setEnabled(!enabled)}>{enabled?'Pause runner':'Enable runner'}</button><button onClick={replay} disabled={!enabled}>Replay jump</button></nav>{['Design','Projects','Journal'].map((s,i)=><section key={s}>{i===0&&<div className="portrait" ref={face}/>}<h2><span id={s} data-land>{s}</span></h2></section>)}</main><DialRoot productionEnabled defaultOpen={false}/></>
}
createRoot(document.getElementById('root')).render(<Demo/>)
