# Character motion

Run the DialKit demo with Node 22+, `npm install`, `npm run build`, then `npm start`. Open http://127.0.0.1:4174. The two components also work independently in plain browser JavaScript.

Copy **src/** and **assets/** together to your site's public directory. Keep their relative positions. Load the following in a browser module after your markup exists.

```html
<div id="portrait" style="width:260px"></div>
<h2><span id="project-title">Projects</span></h2>
<script type="module">
  import {mountGaze} from '/character-motion/src/gaze.js';
  import {mountRunner} from '/character-motion/src/runner.js';
  const gaze = mountGaze(document.querySelector('#portrait'), {travel:7});
  const runner = mountRunner({target:'#project-title', speed:1, height:104,
    landingOffset:.13, startScale:.52, idleSeconds:6, wind:true, sound:false});
  // Call runner.configure({speed:1.2}) to tune live.
  // For manual replay: await runner.ready; runner.play();
  // On unmount: gaze.destroy(); runner.destroy();
</script>
```

Target an inline span around the landing text. A selector matching multiple spans uses the visible target closest to the viewport center. Landing offset runs from 0 (left edge) to 1 (right edge). Height is in CSS pixels. Start scale is a fraction of final height. Speed scales the entire sequence. Turn sound on from a user gesture so the browser can unlock Web Audio. Reduced motion disables the run and blink. The runner resets on scroll and resize.

The demo uses React and DialKit. Open the floating dial panel to choose a heading, landing position, approach size, speed, final height, idle delay, wind and synthesized sound. Replay scrolls a selected heading into view. The reusable modules have no React or DialKit dependency.
