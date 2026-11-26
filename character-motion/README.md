# Character motion

Run the DialKit playground with Node 22+, `npm install`, `npm run build`, then `npm start`. Open http://127.0.0.1:4174. The two components also work independently in browser JavaScript.

Copy **src/** and **assets/** together to your site's public directory. Keep their relative positions. Load the following in a browser module after your markup exists.

```html
<div id="portrait" style="width:260px"></div>
<section>
  <h2><span id="project-title">Projects</span></h2>
</section>
<script type="module">
  import {mountGaze} from '/character-motion/src/gaze.js';
  import {mountRunner} from '/character-motion/src/runner.js';

  const gaze = mountGaze(document.querySelector('#portrait'), {travel:7});
  const motion = mountRunner({
    target: null,
    height: 100,
    speed: 1,
    landingOffset: .07,
    idleSeconds: 6,
    snackDelay: 3,
    sound: false
  });

  // Choose a specific heading if needed.
  // motion.configure({target:'#project-title'});
  // On manual replay: await motion.ready; motion.play();
  // On unmount: gaze.destroy(); motion.destroy();
</script>
```

By default the character picks the largest eligible visible heading in the active section. Set `target` to a selector or element for a specific title. Landing offset runs from 0 to 1 across the selected text. The height is a cap in CSS pixels. Smaller headings reduce the seated height automatically while preserving the illustration's width-to-height ratio. Speed changes the approach and jump pace. Snack delay is measured in seconds after landing.

The playground includes Design, Projects, and a 24 px Journal title. Use DialKit to select a target and adjust the size, pace, landing point, idle delay, snack delay, sound and wind. Replay scrolls an explicitly selected heading into view. Sound starts muted. Enable it with a user gesture to unlock Web Audio. Reduced motion disables the sequence and the portrait blink. Scrolling or resizing resets an in-progress sequence.
