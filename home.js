// Homepage: work list and testimonials from the content files, plus the character glancing at the work.
import { esc, slot, healSlots } from './assets/frames.js';

const isPreview = ['127.0.0.1', 'localhost', ''].includes(location.hostname);

async function json(path) {
  const r = await fetch(path);
  if (!r.ok) throw Error(path);
  return r.json();
}

// Work list. Order comes from "order" in content/projects.json.
json('content/projects.json').then(data => {
  const list = document.querySelector('.work-list');
  list.innerHTML = data.order.map(slug => {
    const p = data.projects[slug];
    const covers = (p.cover || p.hero || []).map(m => slot(m, `assets/work/${slug}/`)).join('');
    return `<a class="case" href="work/${slug}.html" style="--tint:${esc(p.tint)}">
      <div class="cover panel">${covers}</div>
      <div class="meta"><span class="case-name">${esc(p.name)}</span><span class="label">${esc(p.kind)}</span><p>${esc(p.summary)}</p><span class="more">Read the case study</span></div>
    </a>`;
  }).join('');
  list.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
  healSlots(list);
  watchGlance(list);
}).catch(() => {});

// Testimonials. Placeholder slots only show on the local preview.
json('content/testimonials.json').then(data => {
  const quotes = (data.quotes || []).filter(q => !q.placeholder || isPreview);
  if (!quotes.length) return;
  document.querySelector('.quotes').innerHTML = quotes.map(q => `<figure class="quote${q.placeholder ? ' slot-empty' : ''}">
      <blockquote>${q.placeholder ? '' : '“'}${esc(q.text)}${q.placeholder ? '' : '”'}</blockquote>
      <figcaption class="label">${q.placeholder ? 'Placeholder · ' : ''}${esc(q.by)}</figcaption>
    </figure>`).join('');
}).catch(() => {});

// The illustration glances toward a case study while you hover or focus it.
function watchGlance(list) {
  const still = document.querySelector('.pose .still');
  const glance = document.querySelector('.pose .glance');
  if (!still || !glance) return;
  let timer = 0;
  const look = on => {
    clearTimeout(timer);
    // A short delay stops it flickering when the pointer just passes over.
    timer = setTimeout(() => {
      glance.classList.toggle('on', on);
      still.classList.toggle('on', !on);
    }, on ? 60 : 180);
  };
  list.addEventListener('pointerover', e => { if (e.target.closest('.case')) look(true); });
  list.addEventListener('pointerout', e => { if (!e.relatedTarget?.closest?.('.case')) look(false); });
  list.addEventListener('focusin', () => look(true));
  list.addEventListener('focusout', e => { if (!list.contains(e.relatedTarget)) look(false); });
}
