// Turns an image entry from the content files into a framed image, video or placeholder.
// Entry: { file, frame: "phone" | "browser" | "app" | "loose" | "bare", size: "1440×900", show, alt, poster, crop, focus }
// crop: true fills the size's shape; focus: "50% 60%" picks which part of a tall image shows.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function dims(size) {
  const [w, h] = String(size || '1600×1000').split(/[×x]/).map(Number);
  return { w: w || 1600, h: h || 1000 };
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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
      media = `<video src="${esc(src)}"${poster} muted playsinline${play} width="${w}" height="${h}" aria-label="${esc(m.alt)}" data-ph="${esc(ph)}"></video>`;
    } else {
      media = `<img src="${esc(src)}" alt="${esc(m.alt)}" width="${w}" height="${h}" loading="lazy" decoding="async"${m.focus ? ` style="object-position:${esc(m.focus)}"` : ''} data-ph="${esc(ph)}">`;
    }
  }
  return `<figure class="slot ${frame}${m.crop ? ' crop' : ''} ${extraClass}" style="--ratio:${w}/${h}"><div class="frame">${bar}${media}</div></figure>`;
}

// Missing files become placeholders instead of broken images.
export function healSlots(root) {
  root.querySelectorAll('[data-ph]').forEach(el => {
    const swap = () => { el.outerHTML = el.dataset.ph; };
    el.addEventListener('error', swap, { once: true });
    if (el.tagName === 'IMG' && el.complete && el.naturalWidth === 0) swap();
  });
}
