// Builds a case study page from content/projects.json.
// The page only says which project it is: <body data-project="jumbo">.
import { esc, slot, healSlots } from '../assets/frames.js';
import { mountWalker } from '../assets/walker.js';
import { reveal } from '../assets/reveal.js';

const slug = document.body.dataset.project;
const root = document.getElementById('case');
const dir = `../assets/work/${slug}/`;
const frame = m => slot(m, dir);

// Paragraph with an optional margin note beside it.
const para = p => `<div class="grid para"><p class="story">${esc(p.text)}</p>${p.note ? `<aside class="side note" aria-label="Margin note">${esc(p.note)}</aside>` : ''}</div>`;
const paras = list => (list || []).map(para).join('');

function chapter(n, label, heading, body, id) {
  return `<section class="chapter" id="${id}" aria-labelledby="${id}-h">
    <div class="grid chapter-head"><p class="label">${String(n).padStart(2, '0')} — ${esc(label)}</p><h2 class="heading" id="${id}-h">${esc(heading)}</h2></div>
    ${body}
  </section>`;
}

function render(data) {
  const p = data.projects[slug];
  if (!p) { root.innerHTML = '<p>Project not found.</p>'; return; }
  const order = data.order;
  const nextSlug = order[(order.indexOf(slug) + 1) % order.length];
  const next = data.projects[nextSlug];

  document.title = `${p.name}: ${p.title.charAt(0).toLowerCase()}${p.title.slice(1)} · Satyam Gopal`;
  document.documentElement.style.setProperty('--tint', p.tint || '#f4f4f4');

  const facts = (p.facts || []).filter(f => f.value)
    .map(f => `<div><dt class="label">${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('');
  const owned = p.owned?.length ? `<div class="owned"><dt class="label">What I owned</dt><dd><ul>${p.owned.map(o => `<li>${esc(o)}</li>`).join('')}</ul></dd></div>` : '';

  let n = 0;
  const parts = [];

  if (p.moment) parts.push(chapter(++n, 'The moment', p.momentHeading || 'Where people paused', paras(p.moment), 'moment'));

  if (p.decision) {
    const d = p.decision;
    const options = (d.options || []).map(o => `<article class="option${o.chosen ? ' chosen' : ''}">
        <div class="shot panel">${frame(o.media)}</div>
        <p class="label">${esc(o.label)}</p>
        <h3>${esc(o.title)}</h3>
        <p>${esc(o.text)}</p>
      </article>`).join('');
    parts.push(chapter(++n, 'The decision', d.heading, `${paras(d.intro)}<div class="grid options n${(d.options || []).length}">${options}</div><div class="why">${paras(d.why)}</div>`, 'decision'));
  }

  if (p.details?.length) {
    const body = p.details.map((x, i) => `<div class="grid detail${i % 2 ? ' flip' : ''}${x.media?.frame === 'phone' ? '' : ' wide'}">
        <div class="shot panel">${frame(x.media)}</div>
        <div class="words"><p class="caption">${esc(x.caption)}</p>${x.note ? `<aside class="note" aria-label="Margin note">${esc(x.note)}</aside>` : ''}</div>
      </div>`).join('');
    parts.push(chapter(++n, 'Details', p.detailsHeading || 'The small calls', body, 'details'));
  }

  if (p.others) {
    const o = p.others;
    const table = o.table ? `<div class="grid"><table class="ledger story"><caption class="label">${esc(o.table.caption)}</caption><tbody>${o.table.rows.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div>` : '';
    const strip = list => list?.length ? `<div class="strip panel${list.every(m => m.frame === 'phone') ? '' : ' wide'}">${list.map(frame).join('')}</div>` : '';
    parts.push(chapter(++n, 'With others', o.heading, `${paras(o.text)}${table}${strip(o.media)}${paras(o.after)}${strip(o.media2)}`, 'others'));
  }

  if (p.lookingBack) {
    const quote = p.quote ? `<div class="grid"><figure class="quote story"><blockquote>“${esc(p.quote.text)}”</blockquote><figcaption class="label">${esc(p.quote.by)}</figcaption></figure></div>` : '';
    parts.push(chapter(++n, 'Looking back', p.lookingBackHeading || 'What stuck', paras(p.lookingBack) + quote, 'looking-back'));
  }

  const heroPhones = (p.hero || []).every(m => m.frame === 'phone');

  root.innerHTML = `
    <header class="wrap topnav">
      <a class="home" href="../index.html">Satyam.</a>
      <nav aria-label="Site">
        <a href="../index.html#work" data-text="Work">Work</a>
        <a href="../playground.html" data-text="Playground">Playground</a>
        <a href="../index.html#about" data-text="About">About</a>
      </nav>
    </header>
    <main id="main" class="wrap">
      <div class="grid hero">
        <p class="label full">${esc(p.name)} · ${esc(p.kind)}</p>
        <h1 class="display">${esc(p.title)}</h1>
        <p class="lede">${esc(p.summary)}</p>
      </div>
      <div class="hero-shots panel${heroPhones ? '' : ' wide'}">${(p.hero || []).map(frame).join('')}</div>
      <dl class="grid facts">${facts}${owned}</dl>
      ${parts.join('')}
      <nav class="next" aria-label="Next case study">
        <a href="${nextSlug}.html"><span class="label">Next case study</span><span class="name display"><span>${esc(next.name)} →</span></span><p>${esc(next.summary)}</p></a>
      </nav>
    </main>`;

  healSlots(root);
  window.addThemeToggle?.(root.querySelector('.topnav nav'));
  reveal(root.querySelectorAll('.hero > *, .hero-shots, .facts, .chapter-head > *, .para > *, .option, .detail .shot, .detail .words, .ledger, .strip, .why, .quote, .next'));

  {
    mountWalker({
      base: '../character-motion/assets/',
      track: 'viewport',
      end: () => document.getElementById('looking-back') || root.querySelector('.next'),
    });
  }

  // Honour a #section link once the page exists.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

fetch('../content/projects.json')
  .then(r => { if (!r.ok) throw Error(r.status); return r.json(); })
  .then(render)
  .catch(() => {
    root.innerHTML = '<main class="wrap" style="padding:80px 0"><p>This page reads its words from <code>content/projects.json</code>. Open it through the preview server (see README) instead of double-clicking the file.</p></main>';
  });
