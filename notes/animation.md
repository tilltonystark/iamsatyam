# Animation rules for this site

Satyam's feedback on motion, collected while building the character and page effects. Follow these for any new animation.

## Changing between drawings
- **Never let the figure dim mid-change.** Fade the new drawing in on top while the old one stays fully visible underneath, then hide the old one. A plain cross-fade, where both are half see-through halfway, reads as blinking. (`show()` in `assets/character.js`.)
- **Match the duration to the size of the change.** Small changes in the same stance (standing ↔ glance, standing ↔ wave) take about 0.18 s with only a hint of blur. Big changes (standing ↔ sitting at the laptop) take about 0.45 s. Frame swaps inside a loop take about 0.06 s with no blur.
- **No double features.** Overlays such as the drawn-on eyes hide as soon as a change starts and come back only once the drawing they belong to has fully arrived.

## Loops and gestures
- **Gestures play a few times, then settle.** The wave plays three times and then he stands normally. Nothing loops forever unless it's an activity (typing).
- **Loops are subtle.** Only small parts move between frames, such as the hands or a breath. Leave out any frame that redraws the face or head, because it twitches. (`working-4.png` is excluded for this reason.)
- **Breathing moves the whole figure, never each frame on its own,** so overlapping frames don't drift apart.

## Reacting to the visitor
- **He faces the visitor by default.** He looks toward the page only while the page is scrolling, then faces the visitor again.
- **Hover reactions happen once,** not on every card. Leaning in toward the work happens once, then he straightens up. Moving from card to card doesn't repeat it, so there's no back-and-forth.
- **Only real pointer movement counts as hovering.** Cards sliding under a still mouse while scrolling don't.
- **No stream of chatter.** Section lines wait until scrolling settles. A fast scroll gets one "Whoa, in a hurry?", at most once every 8 seconds. Nav link jumps don't count as fast scrolling.
- **The speech bubble is small and light grey.** No black bubbles.

## Page motion
- **Reveal:** text and images arrive from a soft blur as they scroll into view, staggered slightly.
- **Image loading:** each image shows a wireframe sketch first, then the real image resolves over it.
- **Walker:** on case studies, the walker runs from 16 px from the left edge of the screen to 16 px from the right, in step with the scroll, and sits down exactly when the case study ends.
- **Reduced motion:** honour it everywhere. Show still poses and no blur.

## Checking motion
Measure in a real browser (Chrome), not only in screenshots. Sample every animation frame, and confirm the top drawing never drops below full opacity during a swap.
