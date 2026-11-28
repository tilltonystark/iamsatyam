// Fades elements in from a soft blur as they scroll into view. Siblings that arrive together are
// staggered slightly. Content is only hidden once this script runs, so nothing disappears without it.
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let io;

export function reveal(elements, { stagger = .07 } = {}) {
  if (reduced.matches) return;
  io ??= new IntersectionObserver(entries => {
    const arriving = entries.filter(e => e.isIntersecting);
    arriving.forEach((e, i) => {
      e.target.style.setProperty('--d', `${Math.min(i, 6) * stagger}s`);
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
  for (const el of elements) {
    if (!el || el.classList.contains('reveal')) continue;
    el.classList.add('reveal');
    io.observe(el);
  }
}
