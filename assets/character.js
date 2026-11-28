// The homepage illustration reacts to the visitor.
// - Arrives with a wave and "Howdy!".
// - Looks at the visitor; while the page scrolls, his eyes turn toward the page, then come back.
// - As each section settles in view, he changes pose and says its line (once per section).
// - Pointing at the projects makes him lean in once and straighten up. Moving from card to card
//   doesn't repeat it, so there's no back-and-forth.
// - Scrolling very fast gets one "in a hurry?" line instead of a stream of reactions.
// - Pressing him says hi.
// Poses and lines live in content/character.json. A pose can be one picture or a short loop of frames;
// missing files are skipped, and a pose with no files falls back to the standing illustration.
export async function mountCharacter({ button, sections, hoverArea, config }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = [...button.querySelectorAll('.layer')];
  const bubble = button.querySelector('.bubble');
  const { poses = {}, moments = {}, lines = {} } = config;

  const exists = src => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });

  // Normalise every pose to { frames: [...existing files], fps, breathe }.
  const ready = {};
  await Promise.all(Object.entries(poses).map(async ([name, def]) => {
    const d = typeof def === 'string' ? { frames: [def] } : def;
    const frames = (await Promise.all((d.frames || []).map(exists))).filter(Boolean);
    if (frames.length) ready[name] = { frames, fps: d.fps || 3, breathe: !!d.breathe, loops: d.loops || 0, then: d.then || null };
  }));
  const still = ready.still || { frames: [layers[0].getAttribute('src')], fps: 1, breathe: false };
  const stillSrc = still.frames[0];

  let front = 0, shownSrc = layers[0].getAttribute('src'), current = null, frameTimer = 0, frameIndex = 0;
  let section = null, spokenFor = null, hideTimer = 0, basePose = 'still', looking = false;

  // ---------- Drawing ----------
  // Poses that share the standing stance only differ a little, so they swap quickly.
  // Changing stance (standing <-> sitting at the laptop) is a bigger change and gets a slower blend.
  const seated = new Set(['working']);
  let shownName = 'still', eyesTimer = 0;
  const TIMING = { frame: [90, 0], small: [180, 2], big: [450, 6] }; // [ms, blur px]

  function show(src, kind, name) {
    const [ms, blur] = TIMING[kind];
    button.style.setProperty('--fade', ms + 'ms');
    button.style.setProperty('--blur', blur + 'px');
    // The drawn-on eyes belong to the standing drawing only: hide them the moment a change starts,
    // and bring them back once the standing drawing has fully arrived, so two sets of eyes never overlap.
    clearTimeout(eyesTimer);
    if (src !== stillSrc) button.classList.remove('still-on');
    if (src === shownSrc) { if (src === stillSrc) button.classList.add('still-on'); return; }
    shownSrc = src;
    const next = layers[1 - front], prev = layers[front];
    next.src = src;
    const swap = () => {
      // The incoming drawing fades in on top while the outgoing one stays fully visible underneath,
      // so the figure never dims mid-change (that dip is what read as blinking).
      clearTimeout(next._off);
      next.style.zIndex = 2; prev.style.zIndex = 1;
      next.classList.add('on');
      front = 1 - front;
      clearTimeout(prev._off);
      prev._off = setTimeout(() => prev.classList.remove('on'), ms + 30);
      if (src === stillSrc) eyesTimer = setTimeout(() => button.classList.add('still-on'), ms);
    };
    next.decode ? next.decode().then(swap, swap) : swap();
  }

  function setPose(name) {
    const pose = ready[name] || still;
    if (name === 'wave' && !ready.wave) wiggle();
    if (pose === current) return;
    const effective = ready[name] ? name : 'still'; // a missing pose shows the standing drawing
    const kind = seated.has(effective) !== seated.has(shownName) ? 'big' : 'small';
    shownName = effective;
    current = pose;
    clearInterval(frameTimer);
    frameIndex = 0;
    show(pose.frames[0], kind, name);
    button.classList.toggle('breathe', pose.breathe && !reduced.matches);
    if (pose.frames.length > 1 && !reduced.matches) {
      // loops: how many times to play the frames (0 = keep going). then: the pose to settle into after.
      let steps = pose.loops ? pose.loops * pose.frames.length : Infinity;
      frameTimer = setInterval(() => {
        if (--steps <= 0) {
          clearInterval(frameTimer);
          show(pose.frames[0], 'frame', name);
          if (pose.then) {
            if (basePose === name) basePose = pose.then; // once the gesture is done, it stays done
            if (current === pose && !looking) setTimeout(() => { if (current === pose) setPose(pose.then); }, 250);
          }
          return;
        }
        frameIndex = (frameIndex + 1) % pose.frames.length;
        show(pose.frames[frameIndex], 'frame', name);
      }, 1000 / pose.fps);
    } else if (pose.then && !reduced.matches) {
      setTimeout(() => {
        if (basePose === name) basePose = pose.then;
        if (current === pose && !looking) setPose(pose.then);
      }, 1800);
    }
  }

  function say(text, ms = 3000) {
    clearTimeout(hideTimer);
    if (!text) { bubble.classList.remove('show'); return; }
    bubble.textContent = text;
    bubble.classList.remove('show');
    void bubble.offsetWidth; // restart the pop-in
    bubble.classList.add('show');
    hideTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  function pulse(cls, ms) {
    if (reduced.matches) return;
    button.classList.remove(cls);
    void button.offsetWidth;
    button.classList.add(cls);
    setTimeout(() => button.classList.remove(cls), ms);
  }
  const wiggle = () => pulse('wiggle', 900);
  const nudge = () => pulse('nudge', 900);

  function play(name, { speak = true } = {}) {
    const m = moments[name];
    basePose = m?.pose || 'still';
    if (!looking) setPose(basePose);
    if (speak && m) say(m.say);
  }

  // ---------- Arrival ----------
  setTimeout(() => play('hello'), reduced.matches ? 0 : 600);

  // ---------- Scrolling: eyes follow the page, fast scrolling gets one remark ----------
  // "Fast" = more than about two-thirds of a screen' worth of scrolling within a third of a second,
  // which a quick trackpad flick or a few hard wheel spins easily reaches.
  let fastSince = 0, settleTimer = 0, lookTimer = 0, hurriedAt = -1e9;
  const trail = [];
  let restingY = scrollY; // where the page was before this burst of scrolling
  let jumpAt = -1e9;       // in-page link jumps (nav) glide fast on purpose; they don't count
  document.addEventListener('click', e => { if (e.target.closest('a[href*="#"]')) jumpAt = performance.now(); });

  addEventListener('scroll', () => {
    const now = performance.now();
    if (!trail.length) trail.push([now - 1, restingY]);
    trail.push([now, scrollY]);
    while (trail.length && now - trail[0][0] > 330) trail.shift();
    const travelled = Math.abs(scrollY - trail[0][1]);
    const fast = travelled > Math.max(520, innerHeight * .65) && now - jumpAt > 1500;

    // While scrolling he turns to look at the page (glance pose, or just his eyes), then faces you again.
    if (!reduced.matches) {
      button.classList.add('look');
      if (ready.glance && !looking) { looking = true; setPose('glance'); }
      clearTimeout(lookTimer);
      lookTimer = setTimeout(() => {
        button.classList.remove('look');
        if (looking) { looking = false; setPose(basePose); }
      }, 700);
    }

    if (fast) {
      fastSince ||= now;
      if (now - hurriedAt > 8000 && lines.hurry) {
        hurriedAt = now;
        say(lines.hurry, 2400);
      }
    }

    // Section lines wait until scrolling settles, so a quick scroll isn't a stream of chatter.
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { fastSince = 0; trail.length = 0; restingY = scrollY; react(); }, 260);
  }, { passive: true });

  // ---------- Sections ----------
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) section = e.target.dataset.moment || null;
    if (!fastSince) react();
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => io.observe(s));

  function react() {
    if (section === spokenFor) return;
    spokenFor = section;
    // Let a just-said "in a hurry?" finish before the next line.
    if (section) play(section, { speak: performance.now() - hurriedAt > 2200 });
    else { basePose = 'still'; if (!looking) setPose('still'); say(''); }
  }

  // ---------- Pointing at the projects: lean in once, then straighten up ----------
  let insideList = false, leaveTimer = 0;
  if (hoverArea) {
    // Movement over a card counts; cards sliding under a still pointer while scrolling don't.
    hoverArea.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !e.target.closest('.case')) return;
      clearTimeout(leaveTimer);
      if (insideList) return;
      insideList = true;
      nudge();
      const m = moments.hover;
      if (m?.say) say(m.say, 1800);
    });
    hoverArea.addEventListener('pointerleave', () => {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { insideList = false; }, 1500);
    });
    hoverArea.addEventListener('focusin', e => {
      if (!insideList && e.target.closest('.case')) { insideList = true; nudge(); }
    });
    hoverArea.addEventListener('focusout', e => { if (!hoverArea.contains(e.relatedTarget)) insideList = false; });
  }

  // ---------- Press to say hi ----------
  button.addEventListener('click', () => play('poke'));

  // Pause frame loops while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearInterval(frameTimer); return; }
    const name = Object.keys(ready).find(k => ready[k] === current) || 'still';
    current = null;
    setPose(name);
  });
}
