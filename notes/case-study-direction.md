# Case study direction (step 1, waiting for Satyam's yes)

## What I take from each reference

| Reference | Take | Avoid |
|---|---|---|
| baked.design | Open every project with one fixed outcome line before the process, so the point lands in a glance. | Stats-first headlines. We have no confirmed numbers, so the line states scope, not results. |
| hex.inc | Tag each project by kind of work (zero-to-one, redesign, system, leadership) in the index and the fact strip. | The dense agency list and showreel energy. Five projects deserve room. |
| recent.design/launch-videos | Poster first: every video slot shows a still frame and a one-line caption, then plays a short muted loop. | A grid of videos all moving at once. One loop per page, max. |
| Wall of Portfolios | Could not read it. The homepage loads, but Sakshi's page and the case study index return 404 and the other five names aren't listed. Continuing without it. | — |

Caveat: the fetch tool returns page text, not the rendered page, so typefaces and colours of these sites weren't readable.

## Type: pick one

Both are free to self-host. Inter stays as the text face because it's already in the repo and reads well at small sizes.

- **A. Editorial:** Fraunces for headings and project titles (soft serif, a little wonky at large sizes, feels personal) · Inter for text · JetBrains Mono for labels and facts.
- **B. Grotesk:** Bricolage Grotesque for headings (expressive widths, more poster-like) · Inter for text · Geist Mono for labels and facts.

Open `notes/type-specimen.html` to compare them on a real case study opening.

## Grid

- 1440 and 1024: 12 columns, 24 px gutters, content max 1200 px. Story takes 8 columns, the margin column takes 4 (project facts at the top, margin notes beside the paragraph they belong to). Mockups can break out to the full 12.
- 768: margin column folds in. Each note sits under its paragraph, indented with a thin rule.
- 375: one column, 20 px side margins.

## Colour

Quiet white base and #232323 ink from the Figma frame, #646464 for secondary text. Each project keeps its existing pale "paper" tint as the surface behind its mockups (Jumbo lilac, Zorro mint, Greptile sage, Vertera lavender, Workers grey). One accent, the existing #436ab2, used only for links and focus rings.

## Character

- Homepage: looks toward the project you hover or focus in the work list (reuses the gaze component).
- Case study: a small character in the margin column walks while you scroll, stops when you stop, and sits down (settled pose) when you reach "Looking back".
- Reduced motion: one still pose, no swaps.
- The motion playground stays untouched.

## How editing works

- Copy and image choices for all five projects live in `content/projects.json`. Images live in `assets/work/<project>/` with fixed names (`hero.png`, `decision-1.png`…). Replace a file with the same name and the page updates.
- Tradeoff: the pages read the content file in the browser, so they need the preview server (the same `python3 -m http.server` command the README already uses), not a double-click. No framework, no build step.
- The homepage's pop-up case studies get replaced by links to `/work/<project>.html`.

## Things that disagree, and what I'll do

1. **Slides and Buildojo.** The master prompt says "coming soon", but PORTFOLIO_CONTEXT says you asked to remove them. I'll keep them off.
2. **Testimonial.** The homepage shows the Zorro founder quote. The master prompt says hold testimonials until attribution is confirmed. Needs your call.
3. **Lines in the current pop-ups that aren't in PORTFOLIO_CONTEXT:** "Aviator went live during my time on the team", "Sole product designer" on Workers, UPI as the payout method, "Mobile players across India". I'll leave these out of the case studies unless you confirm them.
