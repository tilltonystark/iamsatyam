// A small Satyam that walks from the left edge of `track` to its right edge as you scroll through
// the case study, arriving (and sitting down) exactly when the bottom of `end` reaches the bottom of the screen.
// All poses are loaded once and stacked; switching pose only toggles a class, so nothing flickers.
// Position eases toward its target every frame, and the walk cycle runs on a steady clock.
export function mountWalker({ base, track, end }) {
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
  const endEl = () => (typeof end === 'function' ? end() : end);
  // 0 at the top of the page, 1 when the end of the case study is fully on screen.
  const progress = () => {
    const stop = endEl();
    const finish = stop ? stop.getBoundingClientRect().bottom + scrollY - innerHeight : document.documentElement.scrollHeight - innerHeight;
    return finish > 0 ? Math.min(1, Math.max(0, scrollY / finish)) : 1;
  };
  const isSeated = () => progress() >= .995;

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
    const place = () => { measure(true); el.style.transform = `translate3d(${x}px,0,0)`; show(isSeated() ? 'settled' : 'idle'); };
    requestAnimationFrame(place);
    addEventListener('scroll', place, { passive: true });
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
