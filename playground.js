// Playground grid from content/playground.json: filter chips, equal-width columns, larger view on click.
import { esc, dims, slot, healSlots } from './assets/frames.js';

const grid = document.querySelector('.masonry');
const chips = document.querySelector('.chips');
const viewer = document.querySelector('.viewer');
let items = [];
let active = 'All';
let lastTrigger = null;

const columnsFor = width => width >= 1200 ? 4 : width >= 880 ? 3 : width >= 540 ? 2 : 1;

function cell(item, index) {
  const dir = item.folder ? `assets/work/${item.folder}/` : 'assets/work/';
  const art = slot({ ...item, show: item.title }, dir);
  const cap = `<span class="cap"><span><strong>${esc(item.title)}</strong></span><span class="label">${esc(item.client)}</span></span>`;
  const go = `<span class="go" aria-hidden="true">${item.link ? '↗' : '+'}</span>`;
  return item.link
    ? `<a class="cell" href="${esc(item.link)}"><span class="art">${art}</span>${go}${cap}</a>`
    : `<button class="cell" type="button" data-index="${index}" aria-label="View ${esc(item.title)} larger"><span class="art">${art}</span>${go}${cap}</button>`;
}

function layout() {
  const shown = items.map((item, i) => ({ item, i })).filter(({ item }) => active === 'All' || item.tags?.includes(active));
  const count = Math.min(columnsFor(grid.clientWidth), Math.max(1, shown.length));
  const cols = Array.from({ length: count }, () => ({ h: 0, html: [] }));
  for (const { item, i } of shown) {
    const { w, h } = dims(item.size);
    // Rough height of a cell in column-width units: picture + padding + caption.
    const est = (item.frame === 'bare' ? .44 * h / w : h / w) + .35;
    const col = cols.reduce((a, b) => (b.h < a.h ? b : a));
    col.h += est;
    col.html.push(cell(item, i));
  }
  grid.innerHTML = cols.map(c => `<div class="col">${c.html.join('')}</div>`).join('');
  healSlots(grid);
}

function renderChips() {
  const tags = ['All', ...new Set(items.flatMap(i => i.tags || []))];
  chips.innerHTML = tags.map(t => `<button type="button" aria-pressed="${t === active}">${esc(t)}</button>`).join('');
}

chips.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  active = b.textContent;
  renderChips();
  layout();
});

grid.addEventListener('click', e => {
  const b = e.target.closest('button.cell');
  if (!b) return;
  const item = items[b.dataset.index];
  const img = viewer.querySelector('img');
  img.src = `assets/work/${item.folder}/${item.file}`;
  img.alt = item.alt || item.title;
  viewer.querySelector('figcaption').innerHTML = `<span class="label">${esc(item.client)}</span><br>${esc(item.title)}${item.note ? ` — ${esc(item.note)}` : ''}`;
  lastTrigger = b;
  viewer.showModal();
});

const closeViewer = () => { viewer.close(); lastTrigger?.focus({ preventScroll: true }); };
viewer.querySelector('.close').addEventListener('click', closeViewer);
viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
viewer.addEventListener('cancel', e => { e.preventDefault(); closeViewer(); });

let lastCols = 0;
addEventListener('resize', () => {
  const c = columnsFor(grid.clientWidth);
  if (c !== lastCols) { lastCols = c; layout(); }
});

fetch('content/playground.json')
  .then(r => r.json())
  .then(data => {
    items = data.items || [];
    lastCols = columnsFor(grid.clientWidth);
    renderChips();
    layout();
  })
  .catch(() => { grid.innerHTML = '<p>Open this page through the preview server to see the grid.</p>'; });
