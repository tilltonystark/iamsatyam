// Turns an image entry from the content files into a framed image, video or placeholder.
// Entry: { file, frame: "phone" | "browser" | "app" | "loose" | "bare", size: "1440×900", show, alt, poster, crop, focus }
// crop: true fills the size's shape; focus: "50% 60%" picks which part of a tall image shows.
// While an image loads, a wireframe sketch of a screen sits in its place; the real image then
// resolves over it from a soft blur.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function dims(size) {
  const [w, h] = String(size || '1600×1000').split(/[×x]/).map(Number);
  return { w: w || 1600, h: h || 1000 };
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// A light wireframe of a screen at the image's shape: a phone layout for tall images, a desktop app otherwise.
export function wireframe(w, h) {
  const H = +(100 * h / w).toFixed(2);
  const r = (x, y, ww, hh, c = 'b', rx = 1.2) => `<rect class="${c}" x="${x}" y="${y}" width="${ww}" height="${hh}" rx="${rx}"/>`;
  let s = '';
  if (H > 120) {
    // Phone: status bar, title, hero card, list rows, tab bar.
    const u = H / 100;
    s += r(6, 3 * u, 18, 1.6 * u, 'l') + r(76, 3 * u, 18, 1.6 * u, 'l');
    s += r(6, 9 * u, 46, 3.2 * u, 'd');
    s += r(6, 15 * u, 88, 20 * u, 'b', 3);
    for (let i = 0; i < 4; i++) {
      const y = (39 + i * 10.5) * u;
      s += `<circle class="b" cx="12" cy="${y + 3 * u}" r="${3.4}"/>` + r(20, y + 0.8 * u, 52, 2 * u, 'd') + r(20, y + 4 * u, 34, 1.6 * u, 'l');
    }
    s += r(0, H - 8 * u, 100, 8 * u, 'b', 0);
    for (let i = 0; i < 4; i++) s += r(10 + i * 23, H - 5.6 * u, 8, 3.2 * u, 'l');
  } else {
    // Desktop: sidebar, top bar, title, stat cards, table rows.
    s += r(0, 0, 17, H, 'b', 0);
    for (let i = 0; i < 7; i++) s += r(3, 5 + i * 4.2, i ? 10 : 7, 1.6, i ? 'l' : 'd');
    s += r(17, 0, 83, 5, 'b', 0);
    s += r(21, 9, 26, 2.8, 'd') + r(21, 13.4, 40, 1.6, 'l');
    for (let i = 0; i < 3; i++) s += r(21 + i * 25.6, 18, 23.6, Math.min(12, H * .2), 'b', 1.6);
    const top = 18 + Math.min(12, H * .2) + 4;
    for (let y = top, i = 0; y < H - 5 && i < 9; y += 4.6, i++) s += r(21, y, 75, 3.2, i ? 'l' : 'd', .8);
  }
  return `<svg class="wire" viewBox="0 0 100 ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true">${s}</svg>`;
}

export function slot(m, dir, extraClass = '') {
  if (!m) return '';
  const { w, h } = dims(m.size);
  const frame = ['phone', 'browser', 'app', 'loose', 'bare'].includes(m.frame) ? m.frame : 'loose';
  const bar = frame === 'browser' ? '<div class="bar" aria-hidden="true"><i></i><i></i><i></i><b></b></div>'
    : frame === 'app' ? '<div class="bar" aria-hidden="true"><i></i><i></i><i></i></div>' : '';
  const ph = `<div class="ph" role="img" aria-label="Image coming soon: ${esc(m.show)}"><strong>${esc(m.size)} · ${esc(frame)}</strong><span>${esc(m.show)}</span></div>`;
  let media = ph;
  if (m.file) {
    const src = dir + m.file;
    if (/\.(mp4|webm)$/i.test(m.file)) {
      const poster = m.poster ? ` poster="${esc(dir + m.poster)}"` : '';
      const play = reduced.matches ? ' controls' : ' autoplay loop';
      media = `<div class="media">${wireframe(w, h)}<video src="${esc(src)}"${poster} muted playsinline${play} width="${w}" height="${h}" aria-label="${esc(m.alt)}" data-ph="${esc(ph)}"></video></div>`;
    } else {
      media = `<div class="media">${wireframe(w, h)}<img src="${esc(src)}" alt="${esc(m.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"${m.focus ? ` style="object-position:${esc(m.focus)}"` : ''} data-ph="${esc(ph)}"></div>`;
    }
  }
  return `<figure class="slot ${frame}${m.crop ? ' crop' : ''} ${extraClass}" style="--ratio:${w}/${h}"><div class="frame">${bar}${media}</div></figure>`;
}

// When each image is ready, resolve it over its wireframe. Missing files become placeholders.
export function healSlots(root) {
  root.querySelectorAll('[data-ph]').forEach(el => {
    const media = el.closest('.media');
    const done = () => media?.classList.add('loaded');
    const fail = () => { (media || el).outerHTML = el.dataset.ph; };
    if (el.tagName === 'VIDEO') {
      el.addEventListener('loadeddata', done, { once: true });
      el.addEventListener('error', fail, { once: true });
      if (el.readyState >= 2) done();
      return;
    }
    el.addEventListener('load', done, { once: true });
    el.addEventListener('error', fail, { once: true });
    if (el.complete) el.naturalWidth ? done() : fail();
  });
}
