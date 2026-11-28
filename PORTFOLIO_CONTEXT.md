# Portfolio handoff

Satyam Gopal is building a personal portfolio for product design roles. The first deliverable is a homepage draft. A hiring manager should be able to identify what Satyam owned and follow one concrete decision per project.

## Sources and scope

- [Homepage composition](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=151-118). The reference uses a 1024 × 640 viewport, a 425 px illustration column and a 535 px reading column starting at x=441. Intro starts at y=150. Keep the quiet white background, restrained typography, top navigation and generous vertical spacing.
- [Client design archive](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=128-2479). Section names are client names. Use satyam@vizually.design for Figma access.
- PERSONAL_SITE_COPY.md holds working biographical copy. This document records project scope and client attribution from Satyam. The character-motion directory holds a working prototype and integration notes. Satyam will brief the final illustration behavior and secondary pages separately.

## Homepage milestones

1. Build the split shell and introduction. On desktop fix the illustration in place and make the right column the only scroll container. Reserve the left mount for the final interactive character. Use the reference still for the first draft. Proposed phone layout uses a compact illustration above one reading column.
2. Populate the right column in reference order: introduction and contact, selected work, solo design workflow, interests, testimonials, teaching. Use the documented client list for work previews. Slides and Buildojo in the sketch need project details. Hold testimonials for confirmed attribution; the rough repeats a quote. Use section anchors until secondary pages are briefed. Preserve the existing motion playground.
3. Verify desktop scroll containment, keyboard navigation, in-page links, narrow-screen overflow and reduced-motion behavior. Review the draft beside the frame. Record implemented files, preview instructions and outstanding assets here before handoff.

## Client stories

### Jumbo
Satyam designed Aviator from scratch, designed Plinko and owned Ludo and cricket flows including women's cricket. Players often missed games behind the bottom Games tab. He explored homepage layouts that exposed more games and prioritized four or five. For Aviator he worked on large controls and fewer taps during rounds. He managed two designers, Siddharth and Rankesh, who worked on the wallet under his review. In the historical product, cash winnings, shopping credits and tokens had different uses. The wallet presented bank withdrawal alongside optional conversions, explained incentives, and distinguished pending identity verification, missing payout details and manual transaction review. Revenue, first-week player totals and failure counts are recollections pending records. [Screens](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=131-38076)

### Vertera Health
Satyam worked on course layouts in a team building a spine care app for people preparing for or recovering from surgery. He explored how much information patients needed before starting a lesson or exercise and contributed to pricing and onboarding iterations. The home and journal screens provide product context. [Screens](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=163-13747)

### Greptile
At Pixelup, Satyam worked on translating a new brand into an existing developer product. His scope included dashboard layouts, billing and pricing clarity, and the design system. The analytics screen pairs review metrics with examples of review activity. Funding rounds are company milestones. [Screens](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=163-40383)

### Zorro
Ahead of an investor meeting, Satyam mapped the fields across tests, bugs and reports, sketched table layouts on paper, and decided which details belonged on a dedicated page. He used Claude for high-fidelity exploration. The paused-run design illustrates the reasoning: when sign-in blocks the agent, the screen explains the pause and offers credentials, skip and stop actions. [Screens](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=166-49903)

### Workers
Satyam owned the first product interface for an agentic developer tool that began as a playground. He mapped the flow in FigJam, studied Manus, proposed the information architecture and took the founder-approved direction through wireframes and final layouts. The MVP design lets a developer launch a worker from an issue, follow the investigation and implementation, and inspect the spec and code diff. [Screens](https://www.figma.com/design/hVUid9pIthrz9vsftyDJtQ/Website?node-id=166-55815)

## Working agreement

Record changes and outstanding decisions in this file. Keep the homepage, project detail pages and interactive illustration independently editable. Verify screenshot crops before adding them, particularly personal or account data. Use local assets for the site. Satyam can supply a curated image section later. Keep prototype metrics and unconfirmed outcomes out of published copy.

## Homepage draft

Open index.html directly or serve the repository root with `python3 -m http.server 4186 --bind 127.0.0.1`. The homepage uses plain HTML and CSS. The desktop reading column owns scrolling. At 700 px and below, the illustration sits above the page content.

The first pass uses the reference still and six archived Figma screens across five project summaries. The summaries expand inline. The final character interaction, secondary pages, testimonial attribution, and additional content for Slides and Buildojo are pending. Before a public launch, review the screenshot selections and confirm any added dates or outcomes.

## Current interaction design

Work contains five documented clients. Each cover opens its native dialog in index.html. Keep client context, audience, ownership, design decisions and supported outcomes beside the corresponding screen exports in assets/work. portfolio.js handles dismissal and return focus. CSS supplies the dark backdrop, short transitions and reduced-motion alternative.

The workflow diagrams in assets/workflow-0.svg and assets/workflow-1.svg trace the full sequences clockwise from twelve o’clock. Update the accessible descriptions in index.html when changing the steps. The Playground link opens a standalone pointer-following character demo using the repository’s gaze component. The homepage portrait remains a still pending the final interaction brief.

Slides and Buildojo have been removed from the homepage at Satyam’s request. Confirmed product impact metrics can be added when records are available. Hobby and teaching photography are pending.

## Image sizing and review

Keep portfolio images in normal flow with a width bounded by their container and an automatic height. Give each image its intrinsic dimensions in HTML. Cover buttons grow to enclose their screenshots. The three personal illustrations and three teaching illustrations in assets/editorial are generated editorial placeholders. Replace them with approved personal assets when available. The testimonial uses the single supplied quote.

Section checks passed in Chrome at 320, 390, 768, 1024 and 1440 px, including cover and dialog image containment, keyboard dismissal and focus return. Also checked backdrop dismissal, the close button and the playground return link.

## Case studies, playground and shared system (28 Nov 2026)

Changes:
- Three case studies at `work/jumbo.html`, `work/zorro.html` and `work/vertera.html`. All three are built from `content/projects.json` with one template (`work/case.js`, `work/case.css`). Images live in `assets/work/<project>/`.
- Greptile and Workers moved to the playground grid (`playground.html`, `content/playground.json`). The character demo moved from `playground.html` to `character.html` and is one cell in the grid.
- Slides and Buildojo stay off the site.
- One shared look for every page in `assets/site.css`: Fraunces for headings and Inter for everything else (labels, navigation, buttons), plus the shared phone, browser, app and loose frames (`assets/frames.js`). The homepage pop-up case studies were removed in favour of links.
- Painted editorial placeholders are shown in greyscale (`.ink`) so they sit with the ink character until real photos arrive.
- Character: the homepage illustration glances at the work while a case study is hovered or focused. On case studies a small walker crosses the margin column while you scroll (eased position, steady walk cycle, standing when idle) and sits at "Looking back". Reduced motion shows a still pose.
- Testimonials come from `content/testimonials.json`. Placeholder quotes only render on the local preview.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`, `.assetsignore`, `404.html`).

Confirmed by Satyam on 28 Nov 2026: Aviator went live during his time on the team; he was the sole product designer on Workers; UPI was the payout method; Jumbo's players were across India.

Figma notes: the Zorro node 166-49903 no longer exists. Zorro screens now live in sections Test (213:18561), Bug (213:18863), Test Suite & Module (213:19092) and Components (213:19137). A second Jumbo section is 213:22807. Zorro, Vertera, Greptile and Workers exports are 1×; Jumbo exports are 2×. Re-export at 2× for sharper retina images.

Lines written from the context but phrased by Claude, to check:
- Jumbo: why leading with four or five games worked; the margin notes ("The tab wasn't broken…", "The hardest part of this layout was the list of games we left out", "Whenever a screen says 'pending'…"); the Looking back reflection; the "Before" and "Explored" option framing.
- Zorro: "Me, working with the founder"; the two-option framing and its "why"; detail captions on the test editor and bug bash; the state table wording; the Looking back line.
- Vertera: the "Everything upfront / Title only" options are framings of "showing every detail made it harder to scan, hiding too much made the next step unclear"; "A title and one line on why" is read from the home screen and labelled "In the app", not as Satyam's final decision; platform "iOS" is inferred from the 390×844 frames; the Looking back line.
- Jumbo platform "Android app" is inferred from the Figma frame names.

Empty image slots (recommended size · frame · what to show):
- jumbo/before-home.png · 720×1600 · phone · home screen before games moved up
- jumbo/home-explorations.png · 1600×1000 · loose · homepage layout explorations
- zorro/before-paused-run.png · 1440×900 · browser · run view before the redesign
- vertera/course-everything.png · 390×844 · phone · course layout showing every detail
- vertera/course-minimal.png · 390×844 · phone · course layout with titles only
- vertera/pricing.png · 390×844 · phone · pricing iteration
- vertera/onboarding.png · 390×844 · phone · onboarding iteration

Open questions:
- Timelines for each project (the facts row hides empty values).
- Jumbo revenue, first-week player totals and failure counts stay out until records confirm them.
- Real testimonials for Jumbo, Pixelup/Greptile and Workers.
- Real photos for the side quests and teaching rows.

## Later updates (28 Nov 2026)

Live at https://iamsatyam.com (also www and iamsatyam.tilltonystark.workers.dev). Hosting: Cloudflare Workers static assets. The domain is attached with worker routes (`iamsatyam.com/*`, `www.iamsatyam.com/*`) because old proxied DNS records still exist on the zone. Publish with `npx wrangler deploy` from this folder.

Design system
- Two typefaces only: Fraunces for headings, Inter for everything else (nav, labels, buttons, chips). The workflow SVGs use Inter-like system fonts.
- Neutral greys only (no warm tints). Homepage case study thumbnails sit on #f4f4f4. Each case study page keeps its project tint.
- Nav: Work · Playground · About, plus a light/dark toggle. Contact was removed from the nav; the contact section stays at the bottom of the homepage. Nav links are regular weight, semibold on hover, with no underline.
- Light and dark themes (`assets/theme.js`, tokens in `assets/site.css`). The theme follows the system until the visitor picks one. In dark, the character keeps its true colours with a light "sticker" edge, the workflow diagrams flip to light ink, and project tints become a quiet wash. Text contrast in dark: ink 15.8:1, muted 7.9:1.
- Page motion: text and images reveal from a soft blur; images load as a wireframe sketch and resolve into the screenshot (`assets/frames.js`, `assets/reveal.js`).
- The playground (`playground.html`, `content/playground.json`) is a recent.design-style grid: four equal columns with 12 px gaps, each cell the plain image at full column width, filter chips, and a larger view on click.
- The homepage scrolls as a whole page while the illustration stays fixed on the left. On phones the character becomes a small corner companion.
- Favicon and touch icon come from the character's face (`assets/icons/`). Share images are 1200×630 for the homepage and each case study (`assets/og/`, generated from `notes/og.html`). Every page has a title, description and Open Graph tags.

Character (homepage)
- `home.js` mounts `assets/character.js`. `content/character.json` defines the poses, timing and lines, and `assets/character/` holds the drawings. The generation prompt is in `notes/character-prompt.md`.
- He waves three times with "Howdy!" on arrival. A small pupil movement acknowledges manual scrolling while he is standing. Once scrolling settles, the section in the middle of the viewport determines the pose and line. Work plays the revised typing frames 1 → 2 → 1 → 3 → 1 → 4. Side quests show him reading. A fast scroll gets "Whoa, in a hurry?". Clicking him waves, then returns him to the section pose.
- Drawings decode on demand. A pose blend keeps its outgoing drawing at full opacity until the incoming drawing is ready to take over. Typing waits for the stance change before advancing. Reduced motion uses the first drawing of each activity and an idle pose for the wave.
- The standalone `character.html` demo uses `character-motion/src/gaze.js`. The `room-playground/` project next to this repository is a separate prototype.
- Animation rules from Satyam's feedback: `notes/animation.md`.

Walker (case studies): goes from 16 px from the screen's left edge to 16 px from its right edge in step with the scroll, sits down as the case study ends, and is smaller on phones.

Still open
- Images for the seven empty case study slots (list above).
- Real testimonials (placeholders show only on the local preview).
- Timelines for each project.
- Real photos for the side quests and teaching rows (currently greyscale editorial placeholders).
- Optional: re-export the 1× screens (Zorro, Vertera, Greptile, Workers) at 2× for sharper Retina images.

Character fixes (28 Nov 2026, evening). These build on another session's rewrite of `assets/character.js`, which moved the standing drawing to `assets/character/satyam.png`, added coffee frames (not used yet) and regenerated the working frames (all four now change only the hands, so all are in the loop).
- Standing ↔ sitting changes no longer overlap: the old drawing fades out, then the new one fades in.
- The seated pose never tilts. The hover lean and wiggle are standing-only, breathing has no rotation, and a click at the desk only shows the bubble.
- The active section is the one filling most of the screen, with a 15% margin before switching, so he no longer flips at section edges.
- The skimming line is now "No rush, take your time.". It fires anywhere a section is skipped and is followed by the section's own line.
- Hard rules: `notes/animation.md`.
