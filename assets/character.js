// The homepage illustration reacts to the visitor: says howdy on arrival, changes pose and speech
// as each section comes into view, leans toward a hovered project, and says hi when pressed.
// Poses and lines live in content/character.json. A missing pose falls back to the standing one.
export async function mountCharacter({ button, sections, hoverArea, config }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = [...button.querySelectorAll('.layer')];
  const bubble = button.querySelector('.bubble');
  const { poses = {}, moments = {} } = config;
  const still = poses.still;

  // Check which pose files exist, once, so we never show a broken or blurry stand-in.
  const ready = {};
  await Promise.all(Object.entries(poses).map(([name, src]) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => { ready[name] = src; resolve(); };
    img.onerror = () => resolve();
    img.src = src;
  })));

  let front = 0, currentSrc = still, section = null, hovering = false, hideTimer = 0;

  function setPose(name) {
    const src = ready[name] || still;
    // Fallback gestures when the dedicated drawing isn't there yet.
    button.classList.toggle('lean', name === 'glance' && !ready.glance);
    if (name === 'wave' && !ready.wave) wiggle();
    if (src === currentSrc) return;
    currentSrc = src;
    const next = layers[1 - front];
    next.src = src;
    const swap = () => { next.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front; };
    next.decode ? next.decode().then(swap, swap) : swap();
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
  setTimeout(() => play('hello'), reduced.matches ? 0 : 500);

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

  // Hovering or focusing a project
  let hoverTimer = 0;
  const hover = on => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      if (on === hovering) return;
      hovering = on;
      if (on) play('hover');
      else if (section) play(section, { speak: false });
      else setPose('still');
      if (!on) button.classList.remove('lean');
    }, on ? 80 : 200);
  };
  if (hoverArea) {
    hoverArea.addEventListener('pointerover', e => { if (e.target.closest('.case')) hover(true); });
    hoverArea.addEventListener('pointerout', e => { if (!e.relatedTarget?.closest?.('.case')) hover(false); });
    hoverArea.addEventListener('focusin', e => { if (e.target.closest('.case')) hover(true); });
    hoverArea.addEventListener('focusout', e => { if (!hoverArea.contains(e.relatedTarget)) hover(false); });
  }

  // Press to say hi
  button.addEventListener('click', () => play('poke'));
}
