# Satyam personal website

[Working website copy and content direction](./PERSONAL_SITE_COPY.md) · [Portfolio context and open questions](./PORTFOLIO_CONTEXT.md) · [Character motion components](./character-motion/)

## Preview on your Mac

In Terminal, from this folder:

```
python3 -m http.server 4186 --bind 127.0.0.1
```

Then open <http://127.0.0.1:4186/>. Pages read their words from the `content` folder, so double-clicking an HTML file won't work. Use the preview link.

## What's where

| Page | File | Words and images come from |
|---|---|---|
| Homepage | `index.html` | `content/projects.json` (work list), `content/testimonials.json` |
| Case studies | `work/jumbo.html`, `work/zorro.html`, `work/vertera.html` | `content/projects.json` + `assets/work/<project>/` |
| Playground grid | `playground.html` | `content/playground.json` + `assets/work/<folder>/` |
| Character demo | `character.html` | `character-motion/` |

Shared look (fonts, colours, labels, phone and browser frames): `assets/site.css`. Two typefaces only: Fraunces for headings, Inter for everything else.

## HOW TO UPDATE

You only ever need to touch the `content` folder and the image folders. You can edit the files in any text editor (VS Code, TextEdit in plain-text mode, or ask Claude).

### Swap an image

1. Find the image's name in `content/projects.json` (for example `"file": "aviator.png"`) or look in `assets/work/jumbo/`.
2. Drop your new image into the same folder **with exactly the same name**, replacing the old one.
3. Refresh the page. Done. No code changes.

If the new image has a different shape, also update its `"size"` (width×height in pixels, like `"1440×900"`) so the page reserves the right space.

**Empty slots** show a striped box with the recommended size and what to show, for example `720×1600 · phone · home screen before games moved up`. Save an image with the file name listed for that slot and it appears.

**Frames.** Each image has a `"frame"`: `phone`, `browser`, `app` (desktop window), `loose` (shadowed screen) or `bare` (no frame). Change the word to change the frame.

**Video.** Use a `.mp4` or `.webm` as the `"file"` and add `"poster": "name.png"` for the still that shows first. Videos play muted on a loop, and only play when someone hasn't asked their device to reduce motion.

**Tall screens.** Add `"crop": true` to show only the top part at the given size. Add `"focus": "50% 60%"` to slide the visible part down (0% is the top, 100% the bottom).

### Change words

All case study text is in `content/projects.json`, one block per project. Each paragraph looks like:

```
{ "text": "The paragraph.", "note": "An optional margin note beside it." }
```

Delete `"note"` to drop the margin note. Keep the quotes and commas; if the page goes blank after an edit, a missing comma or quote is almost always the cause.

Facts with an empty `"value"` stay hidden (Timeline is empty for now). Any key starting with `_` (like `"_todo"`) is a private note and never shows on the site.

### Change project order

In `content/projects.json`, edit `"order": ["jumbo", "zorro", "vertera"]`. This sets the homepage order and the "Next case study" links.

### Add work to the playground

Copy one block in `content/playground.json`, change the title, client, folder, file, size and tags. Cells show the plain image at full column width (no frame), so export screens the way you want them seen. For a transparent picture, add `"ratio": "4:5"` and `"bg": "#f5f4f0"` to place it on a coloured tile. New tags become filter buttons automatically. Add `"link"` to send the cell to another page; without it, clicking opens the image larger. The first item in the list shows first.

### The homepage character

`content/character.json` sets what he says and which pose he uses on arrival, in each section, when a project is hovered, and when he's clicked. Poses are pictures in `assets/character/` (`wave.png`, `working.png`, `glance.png`, `reading.png`). Until a pose file exists he uses the standing illustration, so nothing looks broken. For a clean swap, draw each pose on the same 1024×1536 canvas as `assets/satyam.png`, feet in the same spot, transparent or white background.

### Testimonials

Edit `content/testimonials.json`. To publish a real quote, fill in `"text"` and `"by"`, and set `"placeholder": false`. Placeholders only appear on your local preview, never on the live site.

### Publish changes

Ask Claude to "deploy the portfolio to Cloudflare", or run `npx wrangler deploy` in this folder. Files in `.assetsignore` (notes, Markdown files, motion source code) are never uploaded.
