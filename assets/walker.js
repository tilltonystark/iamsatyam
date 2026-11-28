// A small Satyam that walks along a track while the page scrolls, then sits down at the end.
// All poses are loaded once and stacked; switching pose only toggles a class, so nothing flickers.
// Position eases toward its target every frame, and the walk cycle runs on a steady clock.
export function mountWalker({ base, track, end, after, sitAt = .72 }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const el = document.createElement('div');
  el.className = 'walker';
  el.setAttribute('aria-hidden', 'true');
  const poses = { idle: 'glance', settled: 'settled', w0: 'walk0', w1: 'walk1', w2: 'walk2', w3: 'walk3' };
  const imgs = {};
  for (const [key, file] of Object.entries(poses)) {
    const img = new Image();
    img.src = `${base}${file}.webp`;
    img.alt = '';
    img.decoding = 'async';
    img.dataset.pose = key;
    el.append(img);
    imgs[key] = img;
  }
  document.body.append(el);

  let shown = 'idle';
  const show = key => {
    if (key === shown) return;
    imgs[shown].classList.remove('on');
    imgs[key].classList.add('on');
    shown = key;
  };
  imgs.idle.classList.add('on');

  let x = 0, target = 0, face = 1, lastScroll = scrollY, lastMove = 0, step = 0, stepClock = 0, raf = 0, prev = 0;

  const bounds = () => {
    const ref = typeof track === 'function' ? track() : track;
    if (!ref) return null;
    const r = ref.getBoundingClientRect();
    return { left: r.left, width: Math.max(0, r.width - el.offsetWidth) };
  };
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  const isSeated = () => {
    const stop = typeof end === 'function' ? end() : end;
    return !!stop && stop.getBoundingClientRect().top < innerHeight * sitAt;
  };

  // Stay hidden until the reader has scrolled past `after` (e.g. the hero), so it never sits on top of it.
  function updateVisible() {
    const gate = typeof after === 'function' ? after() : after;
    el.classList.toggle('shown', !gate || gate.getBoundingClientRect().bottom < innerHeight - 140);
  }

  function measure(snap) {
    const b = bounds();
    if (!b) return;
    target = b.left + progress() * b.width;
    if (snap) x = target;
  }

  function frame(now) {
    const dt = Math.min(64, now - (prev || now));
    prev = now;
    // Ease toward the target; about 120 ms to cover most of the gap.
    x += (target - x) * (1 - Math.exp(-dt / 120));
    const moving = Math.abs(target - x) > .4 || now - lastMove < 140;

    if (isSeated()) {
      show('settled');
    } else if (moving) {
      stepClock += dt;
      if (stepClock > 110) { stepClock = 0; step = (step + 1) % 4; }
      show('w' + step);
    } else {
      show('idle');
    }
    el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    updateVisible();
    el.classList.toggle('left', face < 0 && shown !== 'settled');

    raf = moving ? requestAnimationFrame(frame) : 0;
    if (!moving) prev = 0;
  }

  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function onScroll() {
    const dy = scrollY - lastScroll;
    lastScroll = scrollY;
    if (dy) face = dy > 0 ? 1 : -1;
    lastMove = performance.now();
    measure(false);
    kick();
  }

  if (reduced.matches) {
    requestAnimationFrame(() => { measure(true); el.style.transform = `translate3d(${x}px,0,0)`; updateVisible(); });
    addEventListener('scroll', updateVisible, { passive: true });
    return { destroy: () => el.remove() };
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(true); kick(); });
  requestAnimationFrame(() => { measure(true); kick(); });

  return {
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', onScroll);
      el.remove();
    }
  };
}
