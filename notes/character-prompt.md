# Master prompt: homepage character poses

Use this with any image model that accepts a reference image (ChatGPT/GPT Image, Nano Banana, Midjourney with --cref, Ideogram). **Always attach `assets/character/satyam.png` as the reference.** Generate one pose per chat or request, and keep the same chat going for every frame of the same pose. This keeps the face, outfit and line weight consistent.

---

## 1. Base prompt (paste first, every time)

```
Use the attached illustration as the exact character and style reference. Recreate the SAME person in a NEW pose. Treat everything below as hard rules.

CHARACTER (must match the reference exactly)
- Young South Asian man, slim build, about 1.75 m.
- Messy, voluminous dark wavy hair swept up and to his right, with a lighter highlight streak on top.
- Black rectangular glasses, thin moustache, slight friendly smile, small blush marks on the cheeks.
- Plain white oversized crew-neck T-shirt, short sleeves.
- Dark charcoal slim jeans with rolled-up cuffs.
- White low-top sneakers with dark laces.

STYLE (must match the reference exactly)
- Hand-drawn black ink illustration, clean confident outlines, the same line weight as the reference.
- Cross-hatching and stipple texture only on the jeans, hair and shadows, exactly as in the reference.
- No colour except black, white and the light grey of the hatching. No gradients, no drop shadows, no ground shadow, no background objects unless the pose asks for them.
- Pure white background (#FFFFFF), or transparent if the tool supports it.

CANVAS AND FRAMING (so poses swap without jumping)
- Portrait canvas, exactly 1024 × 1536 px (2:3).
- Full body visible, centred horizontally.
- The soles of the sneakers sit on the same invisible baseline as the reference, about 92% of the way down the canvas.
- The top of the hair sits about 7% from the top of the canvas.
- The figure is the same size as in the reference. Do not zoom in or out.
- Nothing is cropped at the edges.

DO NOT
- Do not change his face, hairstyle, glasses, clothes or proportions.
- Do not add text, logos, watermarks, signatures or a frame.
- Do not make it 3D, painterly, coloured or anime-styled.
```

## 2. Pose prompts (add one after the base prompt)

### wave.png: arrival greeting

```
POSE: Standing in the same spot and stance as the reference, feet unchanged. His right hand (on the viewer's left) is raised beside his head in a friendly open-palm wave, fingers relaxed and slightly spread, elbow bent at about 90 degrees. Left hand stays in his pocket as in the reference. Head tilted very slightly toward the raised hand, a slightly bigger smile. Everything below the chest matches the reference.
```

Optional second frame for a real wave, **wave-2.png**: the same prompt, but the hand is tilted about 20 degrees outward, as if mid-wave. Keep everything else identical.

### glance.png: looking at the work (the right side of the screen)

```
POSE: Standing in the same spot and stance as the reference, feet unchanged. Head and eyes turned to look toward the viewer's right, shoulders turned slightly the same way (about 20 degrees), as if looking at something interesting beside him. Curious, raised eyebrows. Left hand still in his pocket; right hand relaxed at his side. Everything below the hips matches the reference.
```

### working-1.png … working-4.png: working on a laptop (animated)

Make **working-1.png** first. Then make 2, 3 and 4 in the same chat, each time saying "identical to the previous image except…".

```
POSE: Seated on a simple modern wooden chair with a thin backrest, drawn in the same ink style, chair seen from the front at a slight three-quarter angle. He sits upright but relaxed, leaning slightly forward, both feet flat on the floor, sneakers resting on the SAME baseline as the reference. An open laptop rests on a small plain desk in front of him, its screen angled so the viewer can see it. Both hands rest on the keyboard, typing. He looks at the screen with a focused, content expression.

LAPTOP SCREEN: The screen shows a simplified, clearly recognisable Figma-style design tool, drawn in the same ink style: a thin toolbar across the top, a narrow layers panel on the left, a properties panel on the right, and in the centre a white canvas holding two simple app-screen frames with a few rectangles and lines. No real logos and no readable text, just shapes.

FRAMING: The chair, desk and laptop all fit inside the 1024 × 1536 canvas. The figure's head stays at about the same height as the reference's shoulders. The desk is not cropped.
```

Follow-up frames (same chat, one at a time):

- **working-2.png:** "Identical to the previous image in every way except: his left hand is lifted about 1 cm higher off the keys, fingers curled as if mid-keystroke. Nothing else moves. Same canvas, same position, same screen."
- **working-3.png:** "Identical to working-1 except: his right hand is lifted slightly, mid-keystroke, and his shoulders are 2 px higher (a breath in). Nothing else moves."
- **working-4.png:** "Identical to working-1 except: his right hand rests on the trackpad instead of the keys, and his head is tilted very slightly toward the screen. Nothing else moves."

The site loops these frames slowly and adds a gentle breathing motion on top, so the frames only need *small* differences. Big changes between frames will look jittery.

### reading.png: optional, for the side-quests or teaching sections

```
POSE: Standing in the same spot and stance as the reference, feet unchanged, holding an open notebook in both hands at chest height and looking down at it with a small smile. Everything below the hips matches the reference.
```

## 3. Check before using a pose

Open the new image and `assets/character/satyam.png` in Figma, one on top of the other at 50% opacity:

- [ ] Same canvas: 1024 × 1536.
- [ ] Sneaker soles land on the same line (±10 px).
- [ ] Head is the same size, and the glasses are the same shape.
- [ ] Line weight and hatching look the same at 100% zoom.
- [ ] Background is pure white or transparent, with no grey haze or shadow.
- [ ] For the working frames: the chair, desk, laptop and screen are pixel-identical between frames, and only the hands and shoulders move.

If a pose drifts, nudge it in Figma rather than regenerating. Move or scale the whole figure so the feet and head line up, then export at 1024 × 1536.

## 4. Where the files go

Save them in `assets/character/` with these exact names:

| File | Used when |
|---|---|
| `wave.png` (+ optional `wave-2.png`) | The page first loads, the contact section, and when someone clicks him |
| `glance.png` | Someone hovers or focuses a project |
| `working-1.png` … `working-4.png` | The work section is on screen |
| `reading.png` | Optional, for side quests or teaching |

Then publish. No code changes are needed. `content/character.json` already points at these names, and any pose that's missing quietly falls back to the standing illustration.
