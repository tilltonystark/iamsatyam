import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DialRoot, useDialKit } from 'dialkit';
import 'dialkit/styles.css';
import { mountRunner } from './src/runner.js';
import { mountGaze } from './src/gaze.js';

const controls = {
  speed: [1, .55, 1.6, .05],
  height: [100, 48, 140, 1],
  landingOffset: [.07, .02, .95, .01],
  idleSeconds: [6, 2, 18, .5],
  snackDelay: [3, 1, 8, .25],
  wind: false,
  sound: false,
  target: { type: 'select', options: ['Largest visible', 'Design', 'Projects', 'Journal'] },
};
const headings = ['Design', 'Projects', 'Journal'];

function Demo() {
  const values = useDialKit('Character motion', controls);
  const runner = useRef(null);
  const face = useRef(null);
  const [phase, setPhase] = useState('At rest');
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const { speed, height, landingOffset, idleSeconds, snackDelay, wind, sound, target } = values;

  useEffect(() => {
    const portrait = mountGaze(face.current);
    const instance = mountRunner({ onPhase: setPhase });
    runner.current = instance;
    instance.ready.then(() => setLoaded(true)).catch(() => setPhase('Artwork unavailable'));
    return () => { instance.destroy(); portrait.destroy(); };
  }, []);

  useEffect(() => {
    runner.current?.configure({
      speed, height, landingOffset, idleSeconds, snackDelay, wind, sound, enabled,
      target: target === 'Largest visible' ? null : '#' + target,
    });
  }, [speed, height, landingOffset, idleSeconds, snackDelay, wind, sound, target, enabled]);

  function replay() {
    const heading = document.getElementById(target);
    if (!heading) {
      runner.current?.play();
      return;
    }
    heading.scrollIntoView({ block: 'center', behavior: 'instant' });
    requestAnimationFrame(() => requestAnimationFrame(() => runner.current?.play()));
  }

  return <>
    <header><a href="../">Portrait Studio</a><span>Motion playground</span></header>
    <main>
      <h1>Motion studies.</h1>
      <p>Move your cursor to guide his eyes. Replay the walk and jump, or pause to let him pick a heading.</p>
      <nav>
        <b role="status">{phase}</b>
        <button onClick={() => setEnabled(!enabled)}>{enabled ? 'Pause motion' : 'Enable motion'}</button>
        <button onClick={replay} disabled={!enabled || !loaded}>Replay walk &amp; jump</button>
      </nav>
      {headings.map((name, index) => <section key={name} className={index === 2 ? 'small-heading' : ''}>
        {index === 0 && <div className="portrait" ref={face} />}
        <h3 className="section-label">Portfolio</h3>
        <div className="heading">
          <h2><span id={name} data-land>{name}</span></h2>
        </div>
      </section>)}
    </main>
    <DialRoot productionEnabled defaultOpen={false} />
  </>;
}
createRoot(document.getElementById('root')).render(<Demo />);
