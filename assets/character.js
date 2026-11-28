// The homepage companion. Drawings and dialogue are defined in content/character.json.
export function mountCharacter({ button, sections, hoverArea, config }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const drawing = button.querySelector('.drawing');
  const initial = drawing.querySelector('.layer');
  const bubble = button.querySelector('.bubble');
  const { poses = {}, moments = {}, lines = {} } = config;
  const layersBySource = new Map([[initial.querySelector('img').getAttribute('src'), Promise.resolve(initial)]]);
  const loadedPoses = new Map();

  function loadLayer(src) {
    if (!layersBySource.has(src)) {
      const img = new Image();
      img.alt = '';
      img.src = src;
      layersBySource.set(src, img.decode().then(() => {
        const layer = document.createElement('span');
        layer.className = 'layer';
        layer.append(img);
        return layer;
      }, () => null));
    }
    return layersBySource.get(src);
  }

  function loadPose(name) {
    if (!loadedPoses.has(name)) {
      const def = poses[name];
      const pose = typeof def === 'string' ? { frames: [def] } : def || {};
      const loaded = Promise.all((pose.frames || []).map(loadLayer)).then(layers => ({
        ...pose, frames: layers.filter(Boolean),
      }));
      loadedPoses.set(name, loaded);
    }
    return loadedPoses.get(name);
  }

  let shown = initial, shownPose = 'still', blend, swapping = Promise.resolve();
  let current, frameTimer = 0, gestureTimer = 0, hideTimer = 0;
  let basePose = 'still', greeting;
  const seated = new Set(['working']);

  async function show(layer, name, run, frame = false) {
    // Keep the outgoing drawing fully opaque until the incoming drawing has arrived.
    // Wait for that handoff before using either layer again, then skip superseded requests.
    await swapping;
    if (run !== current || layer === shown) return;
    const [duration, blur] = frame ? [60, 0] :
      seated.has(name) !== seated.has(shownPose) ? [450, 6] : [180, 2];
    layer.style.zIndex = 1;
    drawing.append(layer);

    function commit() {
      shown.remove();
      layer.style.zIndex = '';
      shown = layer;
      shownPose = name;
    }

    if (reduced.matches || document.hidden) { commit(); return; }

    // Standing and sitting have different outlines, so overlapping them shows two figures.
    // For a stance change the old drawing leaves first, then the new one arrives. Never both at once.
    if (!frame && seated.has(name) !== seated.has(shownPose)) {
      layer.style.opacity = 0;
      const out = shown.animate([{ opacity: 1, filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(4px)' }],
        { duration: 170, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
      swapping = out.finished.then(() => {
        layer.style.opacity = '';
        const enter = layer.animate([{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }],
          { duration: 260, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
        blend = enter;
        return enter.finished.then(() => { out.cancel(); commit(); enter.cancel(); blend = null; });
      });
      await swapping;
      return;
    }

    const keyframes = blur
      ? [{ opacity: 0, filter: `blur(${blur}px)` }, { opacity: 1, filter: 'blur(0px)' }]
      : [{ opacity: 0 }, { opacity: 1 }];
    blend = layer.animate(keyframes, { duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
    swapping = blend.finished.then(() => {
      commit();
      blend.cancel();
      blend = null;
    });
    await swapping;
  }

  function queueFrame(run, next, delay) {
    if (current !== run) return;
    run.next = () => {
      run.next = null;
      next();
    };
    run.delay = delay;
    if (!document.hidden) frameTimer = setTimeout(run.next, delay);
  }

  function updatePose() {
    const requested = greeting || basePose;
    const name = reduced.matches ? poses[requested]?.then || requested : requested;
    if (current?.name === name) return;
    if (name !== 'still') button.classList.remove('look');
    clearTimeout(frameTimer);
    const run = current = { name };
    renderPose(run);
  }

  async function renderPose(run) {
    const { name } = run;
    const pose = await loadPose(name);
    if (run !== current) return;
    const { frames, fps = 3, breathe, loops, then } = pose;
    const first = frames[0] || initial;
    const effectiveName = frames.length ? name : 'still';
    if (name === 'wave' && !frames.length && !seated.has(shownPose)) pulse('wiggle');
    await show(first, effectiveName, run);
    if (run !== current) return;
    button.classList.toggle('breathe', (first === initial || !!breathe) && !reduced.matches);
    if (reduced.matches) return;

    function finish() {
      if (greeting === name) greeting = null;
      else if (basePose === name) basePose = then || 'still';
      updatePose();
    }

    if (frames.length < 2) {
      if (then || greeting === name) queueFrame(run, finish, 1800);
      return;
    }

    const interval = 1000 / fps;
    const total = loops ? loops * frames.length : Infinity;
    let step = 1;
    async function advance() {
      if (step === total) { if (then || greeting === name) finish(); return; }
      const started = performance.now();
      const frame = frames[step % frames.length];
      step += 1;
      await show(frame, name, run, true);
      queueFrame(run, advance, Math.max(0, interval - (performance.now() - started)));
    }
    queueFrame(run, advance, interval);
  }

  function say(text, ms = 3000) {
    clearTimeout(hideTimer);
    if (!text) { bubble.classList.remove('show'); return; }
    bubble.textContent = text;
    bubble.classList.add('show');
    hideTimer = setTimeout(() => bubble.classList.remove('show'), ms);
  }

  function pulse(cls) {
    if (reduced.matches) return;
    clearTimeout(gestureTimer);
    button.classList.remove('wiggle', 'nudge');
    void drawing.offsetWidth;
    button.classList.add(cls);
    gestureTimer = setTimeout(() => button.classList.remove(cls), 900);
  }

  function greet(name) {
    const moment = moments[name];
    if (!moment) return;
    clearTimeout(sayLater); // a direct greeting replaces any line still waiting its turn
    // At the desk he just answers in the bubble; standing up to wave and sitting back down is too jumpy.
    if (seated.has(shownPose) && !seated.has(moment.pose)) { say(moment.say); return; }
    greeting = reduced.matches ? null : moment.pose;
    updatePose();
    say(moment.say);
  }

  // The active section is the one filling most of the screen once scrolling settles.
  // A new section only takes over when it clearly fills more, so he doesn't flip at the edges.
  let section;
  let hurriedAt = -Infinity, sayLater = 0;
  const coverage = el => {
    const { top, bottom } = el.getBoundingClientRect();
    return Math.max(0, Math.min(bottom, innerHeight) - Math.max(top, 0)) / innerHeight;
  };
  function activeSection() {
    if (scrollY === 0) return sections[0];
    const last = sections.at(-1);
    if (last && scrollY + innerHeight >= document.documentElement.scrollHeight - 1) return last;
    let best = null, bestCover = 0;
    for (const el of sections) { const c = coverage(el); if (c > bestCover) { best = el; bestCover = c; } }
    if (section && best !== section && bestCover < coverage(section) + .15) return section;
    return bestCover >= .3 ? best : section;
  }
  function react({ skipped = false } = {}) {
    const active = activeSection();
    if (!active || active === section) {
      if (skipped) hurry();
      return;
    }
    const from = sections.indexOf(section);
    section = active;
    greeting = null;
    const moment = moments[section.dataset.moment];
    basePose = moment?.pose || 'still';
    updatePose();
    // Jumping past at least one whole section counts as skipping, wherever it happens on the page.
    if (skipped || (from >= 0 && Math.abs(sections.indexOf(section) - from) > 1)) hurry(moment?.say);
    else say(moment?.say);
  }

  // One gentle remark for skimming, at most every 8 seconds; the section's own line follows it.
  function hurry(next) {
    const now = performance.now();
    clearTimeout(sayLater);
    if (lines.hurry && now - hurriedAt > 8000) {
      hurriedAt = now;
      say(lines.hurry, 2400);
      if (next) sayLater = setTimeout(() => say(next), 2600);
    } else if (next) say(next);
  }

  let settleTimer = 0, lookTimer = 0, glancedAt = -Infinity, jumpAt = -Infinity;
  let restingY = scrollY, burstFast = false;
  const trail = [];
  const arrival = setTimeout(() => {
    if (section?.id === 'home' && !settleTimer && !greeting) greet('hello');
  }, reduced.matches ? 0 : 600);

  react();
  button.addEventListener('click', () => {
    clearTimeout(arrival);
    greet('poke');
  });

  document.addEventListener('click', e => {
    if (e.target.closest('a[href^="#"]')) jumpAt = performance.now();
  });
  addEventListener('scroll', () => {
    const now = performance.now();
    clearTimeout(arrival);
    if (!trail.length) trail.push([now - 1, restingY]);
    trail.push([now, scrollY]);
    while (now - trail[0][0] > 330) trail.shift();
    const travelled = Math.abs(scrollY - trail[0][1]);
    const manualScroll = now - jumpAt > 1500;
    const fast = travelled > Math.max(520, innerHeight * .65);
    if (fast && manualScroll) burstFast = true;

    // Move only the pupils, and let each glance end even when the page is still scrolling.
    if (shown === initial && current?.name === 'still' && !reduced.matches &&
        manualScroll && !fast && travelled > 18 && now - glancedAt > 4500) {
      glancedAt = now;
      button.classList.add('look');
      lookTimer = setTimeout(() => button.classList.remove('look'), 360);
    }

    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = 0;
      trail.length = 0;
      restingY = scrollY;
      const skipped = burstFast;
      burstFast = false;
      react({ skipped });
    }, 260);
  }, { passive: true });
  addEventListener('resize', () => react());

  // Actual mouse movement over the list can trigger one lean per visit.
  let insideList = false, leaveTimer = 0;
  if (hoverArea) {
    hoverArea.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !e.target.closest('.case')) return;
      clearTimeout(leaveTimer);
      if (insideList) return;
      insideList = true;
      if (!seated.has(shownPose)) pulse('nudge');
      if (moments.hover?.say) say(moments.hover.say, 1800);
    });
    hoverArea.addEventListener('pointerleave', () => {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { insideList = false; }, 1500);
    });
    hoverArea.addEventListener('focusin', e => {
      if (!insideList && e.target.closest('.case')) { insideList = true; if (!seated.has(shownPose)) pulse('nudge'); }
    });
    hoverArea.addEventListener('focusout', e => {
      if (!hoverArea.contains(e.relatedTarget)) insideList = false;
    });
  }

  document.addEventListener('visibilitychange', () => {
    button.classList.toggle('paused', document.hidden);
    if (document.hidden) {
      clearTimeout(frameTimer);
      clearTimeout(lookTimer);
      button.classList.remove('look');
      blend?.finish();
    } else if (current?.next) {
      frameTimer = setTimeout(current.next, current.delay);
    }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      greeting = null;
      if (poses[basePose]?.then) basePose = poses[basePose].then;
      clearTimeout(lookTimer);
      button.classList.remove('look', 'wiggle', 'nudge', 'breathe');
      blend?.finish();
    }
    current = null;
    updatePose();
  });
}
