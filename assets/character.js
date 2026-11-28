// The homepage illustration reacts to the visitor: says howdy on arrival, changes pose and speech
// as each section comes into view, leans toward a hovered project, and says hi when pressed.
// Poses and lines live in content/character.json. A pose can be one picture or a short loop of frames.
// Any missing file is skipped; a pose with no files falls back to the standing illustration.
export async function mountCharacter({ button, sections, hoverArea, config }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = [...button.querySelectorAll('.layer')];
  const bubble = button.querySelector('.bubble');
  const { poses = {}, moments = {} } = config;

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
    if (frames.length) ready[name] = { frames, fps: d.fps || 3, breathe: !!d.breathe };
  }));
  const still = ready.still || { frames: [layers[0].src], fps: 1, breathe: false };

  let front = 0, shownSrc = layers[0].getAttribute('src'), current = null, frameTimer = 0, frameIndex = 0;
  let section = null, hovering = false, hideTimer = 0;

  // Cross-fade to a picture. Pose changes get a soft blur; frames within a pose swap quickly.
  function show(src, soft) {
    if (src === shownSrc) return;
    shownSrc = src;
    const next = layers[1 - front], prev = layers[front];
    button.classList.toggle('soft', !!soft);
    next.src = src;
    const swap = () => { next.classList.add('on'); prev.classList.remove('on'); front = 1 - front; };
    next.decode ? next.decode().then(swap, swap) : swap();
  }

  function setPose(name) {
    const pose = ready[name] || still;
    button.classList.toggle('lean', name === 'glance' && !ready.glance);
    if (name === 'wave' && !ready.wave) wiggle();
    if (pose === current) return;
    current = pose;
    clearInterval(frameTimer);
    frameIndex = 0;
    show(pose.frames[0], true);
    button.classList.toggle('breathe', pose.breathe && !reduced.matches);
    if (pose.frames.length > 1 && !reduced.matches) {
      frameTimer = setInterval(() => {
        frameIndex = (frameIndex + 1) % pose.frames.length;
        show(pose.frames[frameIndex], false);
      }, 1000 / pose.fps);
    }
  }

  function say(text) {
    clearTimeout(hideTimer);
    if (!text) { bubble.classList.remove('show'); return; }
    bubble.textContent = text;
    bubble.classList.remove('show');
    void bubble.offsetWidth; // restart the pop-in
    bubble.classList.add('show');
    hideTimer = setTimeout(() => bubble.classList.remove('show'), 3200);
  }

  function wiggle() {
    if (reduced.matches) return;
    button.classList.remove('wiggle');
    void button.offsetWidth;
    button.classList.add('wiggle');
  }

  function play(name, { speak = true } = {}) {
    const m = moments[name];
    if (!m) { setPose('still'); return; }
    setPose(m.pose || 'still');
    if (speak) say(m.say);
  }

  // Arrival
  setTimeout(() => play('hello'), reduced.matches ? 0 : 600);

  // Sections: react when a section reaches the middle of the screen.
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const name = e.target.dataset.moment || null;
      if (name === section) continue;
      section = name;
      if (!hovering) name ? play(name) : (setPose('still'), say(''));
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => io.observe(s));

  // Hovering or focusing a project. Cards that slide under a still pointer while scrolling don't count:
  // the pointer has to actually move. Scrolling ends any hover, so he never stays leaned.
  let hoverTimer = 0, lastPointerMove = 0;
  addEventListener('pointermove', () => { lastPointerMove = performance.now(); }, { passive: true });
  const hover = on => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (on === hovering) return;
      hovering = on;
      if (on) play('hover');
      else if (section) play(section, { speak: false });
      else setPose('still');
      if (!on) button.classList.remove('lean');
    }, on ? 120 : 160);
  };
  if (hoverArea) {
    hoverArea.addEventListener('pointerover', e => {
      if (e.pointerType === 'mouse' && performance.now() - lastPointerMove < 120 && e.target.closest('.case')) hover(true);
    });
    hoverArea.addEventListener('pointerout', e => { if (!e.relatedTarget?.closest?.('.case')) hover(false); });
    hoverArea.addEventListener('focusin', e => { if (e.target.closest('.case')) hover(true); });
    hoverArea.addEventListener('focusout', e => { if (!hoverArea.contains(e.relatedTarget)) hover(false); });
    const endHover = () => { if (hovering || button.classList.contains('lean')) hover(false); };
    addEventListener('scroll', endHover, { passive: true, capture: true });
  }

  // Press to say hi
  button.addEventListener('click', () => play('poke'));

  // Pause frame loops while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(frameTimer);
    else if (current) { const c = current; current = null; setPose(Object.keys(ready).find(k => ready[k] === c) || 'still'); }
  });
}
