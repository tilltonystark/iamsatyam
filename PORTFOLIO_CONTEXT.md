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

The second pass uses local Inter, the reference’s 535 px desktop reading column, and separate image tiles for each rectangle. The four main rows follow the frame’s order. Jumbo and Zorro use available screenshots. Slots for the second Zorro image, Slides, Buildojo, workflow, interests, and teaching are reserved for final assets. Greptile, Vertera Health, and Workers are grouped under More work. The testimonial uses the single quote attributed in the frame. The second card is reserved.
