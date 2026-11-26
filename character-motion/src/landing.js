const headingSelector = 'h1,h2,h3,h4,h5,h6,[role="heading"],[data-land]';
const sectionSelector = 'section, article, [role="region"], [data-character-section]';
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter() : null;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function intersection(a, b) {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.right, b.right);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.bottom, b.bottom);
  return {left, right, top, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top)};
}

function visibleBounds(element, viewport) {
  if (element.checkVisibility && !element.checkVisibility({opacityProperty: true, visibilityProperty: true})) return null;
  let bounds = viewport;
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = getComputedStyle(parent);
    const clipsX = /^(auto|hidden|clip|scroll)$/.test(style.overflowX);
    const clipsY = /^(auto|hidden|clip|scroll)$/.test(style.overflowY);
    if (!clipsX && !clipsY) continue;
    const rect = parent.getBoundingClientRect();
    bounds = intersection(bounds, {
      left: clipsX ? rect.left + parent.clientLeft : bounds.left,
      right: clipsX ? rect.left + parent.clientLeft + parent.clientWidth : bounds.right,
      top: clipsY ? rect.top + parent.clientTop : bounds.top,
      bottom: clipsY ? rect.top + parent.clientTop + parent.clientHeight : bounds.bottom,
    });
  }
  return bounds;
}

function rankTitles(target, viewport) {
  const automatic = target == null || target === 'auto';
  let elements;
  try {
    elements = automatic ? [...document.querySelectorAll(headingSelector)] :
      typeof target === 'string' ? [...document.querySelectorAll(target)] : [target];
  } catch (error) {
    if (error.name === 'SyntaxError') return [];
    throw error;
  }
  const viewportCenter = (viewport.top + viewport.bottom) / 2;
  const candidates = elements.flatMap(element => {
    if (!element?.getBoundingClientRect) return [];
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return [];
    const bounds = visibleBounds(element, viewport);
    if (!bounds || !element.textContent.trim()) return [];
    const visible = intersection(rect, bounds);
    if (visible.width < Math.min(20, rect.width * .5) || visible.height < Math.min(12, rect.height * .45)) return [];
    return [{element, bounds, fontSize: parseFloat(getComputedStyle(element).fontSize), distance: Math.abs((visible.top + visible.bottom) / 2 - viewportCenter)}];
  });
  const sortTitles = (a, b) => b.fontSize - a.fontSize || a.distance - b.distance;
  if (!automatic) return candidates.sort(sortTitles);
  const sections = new Map();
  for (const candidate of candidates) {
    const section = candidate.element.closest(sectionSelector);
    if (!section) continue;
    const group = sections.get(section);
    if (group) group.titles.push(candidate);
    else {
      const rect = intersection(section.getBoundingClientRect(), viewport);
      sections.set(section, {titles: [candidate], area: rect.width * rect.height, distance: Math.abs((rect.top + rect.bottom) / 2 - viewportCenter)});
    }
  }
  const orderedSections = [...sections.values()].sort((a, b) => b.area - a.area || a.distance - b.distance);
  return [...orderedSections.flatMap(({titles}) => titles.sort(sortTitles)),
    ...candidates.filter(({element}) => !element.closest(sectionSelector)).sort(sortTitles)];
}

function visibleGlyphs(element, bounds) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const glyphs = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const style = getComputedStyle(node.parentElement);
    if (style.visibility !== 'visible') continue;
    const graphemes = segmenter ? segmenter.segment(node.data) : [...node.data].map((segment, index, chars) => ({
      segment, index: chars.slice(0, index).join('').length,
    }));
    for (const {segment, index} of graphemes) {
      if (!segment.trim()) continue;
      range.setStart(node, index);
      range.setEnd(node, index + segment.length);
      const rect = range.getBoundingClientRect();
      const visible = intersection(rect, bounds);
      if (!rect.width || visible.width < rect.width * .65 || visible.height < rect.height * .7) continue;
      const text = style.textTransform === 'uppercase' ? segment.toLocaleUpperCase() :
        style.textTransform === 'lowercase' ? segment.toLocaleLowerCase() : segment;
      glyphs.push({rect, text, style});
    }
  }
  return glyphs;
}

function glyphContact({rect, text, style}, requestedX) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  const fontSize = parseFloat(style.fontSize);
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent ?? fontSize * .8;
  const descent = metrics.fontBoundingBoxDescent ?? fontSize * .2;
  const baseline = (rect.top + rect.bottom + ascent - descent) / 2;
  const glyphWidth = Math.ceil(Math.max(rect.width, metrics.width, metrics.actualBoundingBoxRight) + Math.abs(metrics.actualBoundingBoxLeft));
  const padding = 4;
  const resolution = 2;
  const width = Math.max(1, glyphWidth + 2 * padding) * resolution;
  const height = Math.ceil(ascent + descent + 2 * padding) * resolution;
  canvas.width = width;
  canvas.height = height;
  ctx.scale(resolution, resolution);
  ctx.font = font;
  ctx.fillText(text, padding, padding + ascent);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const wanted = clamp(Math.round((requestedX - rect.left + padding) * resolution), 0, width - 1);
  // Search toward the nearest column of ink when the requested point falls in a counter or sidebearing.
  let best = null;
  for (let x = 0; x < width; x++) {
    if (best && Math.abs(x - wanted) >= best.distance) continue;
    for (let y = 0; y < height; y++) {
      if (pixels[(y * width + x) * 4 + 3] < 110) continue;
      best = {x, y, distance: Math.abs(x - wanted)};
      break;
    }
  }
  return best ? {
    x: rect.left + best.x / resolution - padding,
    y: baseline + best.y / resolution - padding - ascent,
  } : {x: clamp(requestedX, rect.left, rect.right), y: baseline - metrics.actualBoundingBoxAscent};
}

export function resolveLanding(target, landingOffset = .13) {
  const viewport = {left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight};
  for (const {element, fontSize, bounds} of rankTitles(target, viewport)) {
    const glyphs = visibleGlyphs(element, bounds);
    const [first] = glyphs;
    if (!first) continue;
    const firstLine = glyphs.filter(({rect}) => Math.abs(rect.top - first.rect.top) < fontSize * .6);
    const left = Math.min(...firstLine.map(({rect}) => rect.left));
    const right = Math.max(...firstLine.map(({rect}) => rect.right));
    const x = left + (right - left) * clamp(landingOffset, 0, 1);
    const distance = ({rect}) => Math.max(rect.left - x, x - rect.right, 0);
    const glyph = firstLine.sort((a, b) => distance(a) - distance(b))[0];
    const contact = glyphContact(glyph, x);
    if (contact.x < bounds.left || contact.x >= bounds.right || contact.y < bounds.top || contact.y >= bounds.bottom) continue;
    return {...contact, fontSize, element};
  }
  return null;
}
