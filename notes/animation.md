# Animation rules for this site

Satyam's feedback on motion, turned into hard rules. Any new animation must follow them. If a change would break a rule, ask first.

## 1. One pose per section
| Section | Pose | Line |
|---|---|---|
| Arrival (top of the page) | wave, 3 times, then standing | "Howdy!" |
| Work | working (typing loop) | "Here's what I've been working on." |
| About | standing | "This is how I usually work." |
| Side quests | reading | "Off the clock." |
| Kind words | standing | (none) |
| Teaching | standing | "I love this part." |
| Contact | wave, then standing | "Say hi!" |

- **The pose changes only when the section changes,** and only after scrolling has settled (260 ms without movement). Nothing changes mid-scroll.
- **The active section is the one filling most of the screen.** A new section only takes over when it fills at least 15% more of the screen than the current one and at least 30% overall. This stops him flipping between poses at section edges.
- **In the gaps between sections, he keeps his current pose.**

## 2. Changing drawings
| Change | How | Duration |
|---|---|---|
| Frame inside a loop (typing, waving) | new drawing fades in on top | 60 ms, no blur |
| Same stance (standing ↔ wave, glance or reading) | new drawing fades in on top; the old one stays fully visible underneath | 180 ms, 2 px blur |
| Stance change (standing ↔ sitting) | the old drawing fades out first, then the new one fades in. **Never overlap.** | 170 ms out + 260 ms in, 4 px blur |

- **Never show two figures at once.** Overlapping is allowed only when both drawings share the same outline.
- **Never let the figure dim mid-change.** For same-outline changes, one layer stays at full opacity the whole time.
- **Each change waits for the previous one to finish.** A newer request replaces older queued ones.

## 3. Movement on top of a pose
- **Breathing:** moves the whole figure, very subtly (7.4 s cycle). Used for standing, reading and working.
- **Lean toward the work:** standing poses only, once per visit to the work list, then he settles. **Never tilt, lean or wiggle the seated (working) pose.** He's at a desk.
- **Eyes:** standing only. He faces the visitor; a short pupil shift acknowledges manual scrolling, at most every 4.5 s.
- **Gestures settle:** the wave plays three times and then stops. Only activities (typing) loop.
- **No gestures at the desk:** clicking him while he works only shows the bubble. He never stands up and sits back down just to wave.
- **Loops are subtle:** only hands or a breath change between frames. Any frame that redraws the face or head is left out.

## 4. Speech bubble
- **It shows in every pose,** standing, waving, reading or working, in the same small light-grey style.
- **One line per section change,** shown for 3 s.
- **Skimming:** scrolling fast or jumping past at least one whole section gets one gentle "No rush, take your time.", anywhere on the page and at most every 8 s. The new section's own line follows it, so nothing is lost. Nav link jumps don't count.
- **Never mocking or rude.** Keep lines warm and short.

## 5. Page motion
- **Reveal:** text and images arrive from a soft blur as they scroll into view, slightly staggered.
- **Image loading:** each image shows a wireframe sketch first, then the real image resolves over it.
- **Walker:** on case studies it runs from 16 px from the left edge of the screen to 16 px from the right, in step with the scroll, and sits down exactly when the case study ends.
- **Reduced motion:** honour it everywhere. Show still poses, with no blur and no loops.

## 6. Checking motion
Measure in Chrome. Sample every animation frame during each change and confirm:
- at most one figure is visible during a stance change
- one layer stays fully opaque during same-outline changes
- the seated pose never rotates
