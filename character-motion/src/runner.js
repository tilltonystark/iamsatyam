import { resolveLanding } from './landing.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const mix = (from, to, progress) => from + (to - from) * progress;
const ease = (progress) => progress * progress * (3 - 2 * progress);
const walkKeys = ['walk0', 'walk1', 'walk2', 'walk3'];
const seatKeys = ['settled', 'reach', 'snack'];
const poseKeys = ['glance', ...walkKeys, 'jump', ...seatKeys];

// Coordinates are relative to each source illustration. A ground pose locks a
// sole to the ground, while seated poses independently lock the hip to the title.
const anchors = {
  glance: { x: 0.5, y: 0.985 },
  walk0: { x: 0.5, y: 0.994 },
  walk1: { x: 0.5, y: 0.994 },
  walk2: { x: 0.5, y: 0.994 },
  walk3: { x: 0.5, y: 0.994 },
  jump: { x: 0.35, y: 0.67 },
  settled: { x: 0.5, y: 0.5984 },
  reach: { x: 0.5, y: 0.5984 },
  snack: { x: 0.5, y: 0.5984 },
};

const GLANCE_DURATION = 0.58;
const ANTICIPATION_DURATION = 0.22;
const JUMP_DURATION = 0.65;
const POCKET_DURATION = 0.58;

/**
 * Mount a decorative character over a page. Props can be changed with configure().
 * target accepts a heading element or selector. Null selects the largest visible title.
 */
export function mountRunner({
  target = null,
  speed = 1,
  height = 90,
  startScale = 0.95,
  landingOffset = 0.13,
  idleSeconds = 6,
  snackDelay = 3,
  wind = true,
  sound = false,
  onPhase = () => {},
  enabled = true,
} = {}) {
  const options = { target, speed, height, startScale, landingOffset, idleSeconds, snackDelay, wind, sound, enabled };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const poses = {};
  const buffer = document.createElement('canvas');
  const rig = buffer.getContext('2d');

  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  document.body.append(canvas);

  let frame = 0;
  let timer = 0;
  let phase = '';
  let disposed = false;
  let loaded = false;
  let audio;

  function setPhase(next) {
    if (next !== phase) {
      phase = next;
      onPhase(next);
    }
  }

  function reset() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    canvas.hidden = true;
    setPhase('At rest');
    if (loaded && options.enabled && !reduceMotion.matches && !document.hidden && finePointer.matches) {
      timer = setTimeout(play, Math.max(0.5, options.idleSeconds) * 1000);
    }
  }

  function unlockAudio() {
    if (!options.sound) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    audio ??= new Audio();
    audio.resume().catch(() => {});
  }

  function cue(freq, duration, volume) {
    if (!options.sound || audio?.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);
    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.53, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  const ready = Promise.all(poseKeys.map(async (key) => {
    const image = new Image();
    image.src = new URL('../assets/' + key + '.webp', import.meta.url).href;
    await image.decode();
    poses[key] = image;
  })).then(() => {
    if (!disposed) {
      loaded = true;
      reset();
    }
  });
  ready.catch(() => {
    if (!disposed) setPhase('Character art unavailable');
  });

  function drawPose(key, x, y, characterHeight, direction = 1, legSwing = 0, nibble = 0) {
    const image = poses[key];
    const anchor = anchors[key];
    const scale = characterHeight / image.height;

    context.save();
    context.translate(x, y);
    context.scale(direction * scale, scale);
    context.translate(-anchor.x * image.width, -anchor.y * image.height);
    if (legSwing || nibble) {
      if (buffer.width !== image.width || buffer.height !== image.height) {
        buffer.width = image.width;
        buffer.height = image.height;
      }
      rig.clearRect(0, 0, image.width, image.height);
      // Keep the torso and hips still. Each lower leg drifts in the opposite
      // direction, with the swing reaching its full amplitude at the shoes.
      const knee = Math.round(image.height * 0.627);
      const middle = Math.round(image.width / 2);
      if (nibble) {
        // A short lean toward the chocolate moves the head, and tapers out
        // through the shoulders so the seated contact never shifts.
        for (let row = 0; row < knee; row += 2) {
          const height = Math.min(2, knee - row);
          const headLean = clamp(1 - row / (0.33 * image.height), 0, 1) ** 2;
          rig.drawImage(image, 0, row, image.width, height, headLean * nibble * image.width, row, image.width, height);
        }
      } else {
        rig.drawImage(image, 0, 0, image.width, knee, 0, 0, image.width, knee);
      }
      for (let row = knee; row < image.height; row += 2) {
        const height = Math.min(2, image.height - row);
        const offset = ((row - knee) / (image.height - knee)) ** 2 * legSwing * image.width;
        rig.drawImage(image, 0, row, middle, height, offset, row, middle, height);
        rig.drawImage(image, middle, row, image.width - middle, height, middle - offset, row, image.width - middle, height);
      }
      context.drawImage(buffer, 0, 0);
    } else {
      context.drawImage(image, 0, 0);
    }
    context.restore();
  }

  function play() {
    if (!loaded || disposed || !options.enabled || reduceMotion.matches || document.hidden) return;
    const landing = resolveLanding(options.target, options.landingOffset);
    if (!landing) return;

    cancelAnimationFrame(frame);
    clearTimeout(timer);
    const { x: seatX, y: seatY, fontSize } = landing;
    const baseHeight = clamp(options.height, 34, Math.min(160, innerWidth * 0.3));
    const walkingHeight = baseHeight * clamp(options.startScale, 0.45, 1);
    const seatedRoom = Math.min(...seatKeys.map((key) => {
      const { x, y } = anchors[key];
      const aspect = poses[key].width / poses[key].height;
      return Math.min(
        (seatX - 3) / (x * aspect),
        (innerWidth - seatX - 3) / ((1 - x) * aspect),
        (seatY - 3) / y,
        (innerHeight - seatY - 3) / (1 - y),
      );
    }));
    const seatedHeight = Math.min(baseHeight, fontSize * 2.05, seatedRoom);
    if (seatedHeight < 16) return;
    const direction = seatX >= innerWidth * 0.36 ? 1 : -1;
    const distance = Math.min(150, innerWidth * 0.24, baseHeight * 1.6);
    const takeoffX = seatX - direction * Math.min(19, seatedHeight * 0.19);
    const startX = clamp(takeoffX - direction * distance, walkingHeight * 0.28, innerWidth - walkingHeight * 0.28);
    const floorY = Math.min(innerHeight - 10, seatY + Math.max(baseHeight * 0.52, seatedHeight * 0.62));
    const walkDuration = clamp(Math.abs(takeoffX - startX) / 90, 0.85, 1.8);
    const walkEnd = GLANCE_DURATION + walkDuration;
    const jumpStart = walkEnd + ANTICIPATION_DURATION;
    const sitsAt = jumpStart + JUMP_DURATION;
    const playbackSpeed = clamp(options.speed, 0.25, 3);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);

    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.hidden = false;

    let previousStep = -1;
    const startedAt = performance.now();

    function animate(now) {
      const seconds = (now - startedAt) / 1000;
      const elapsed = seconds * playbackSpeed;
      context.clearRect(0, 0, innerWidth, innerHeight);

      if (elapsed < GLANCE_DURATION) {
        setPhase('Notices the title');
        const nod = Math.sin(Math.PI * elapsed / GLANCE_DURATION);
        drawPose('glance', startX, floorY, walkingHeight, direction);
        if (nod > 0.65) {
          // A tiny hand-drawn accent makes the glance legible at small scale.
          context.strokeStyle = '#292722b8';
          context.lineWidth = 1;
          context.lineCap = 'round';
          context.beginPath();
          const accentX = startX + direction * walkingHeight * 0.24;
          const accentY = floorY - walkingHeight * 0.94;
          context.moveTo(accentX, accentY);
          context.lineTo(accentX + direction * 3, accentY - 3);
          context.stroke();
        }
      } else if (elapsed < walkEnd) {
        setPhase('Walking');
        const progress = (elapsed - GLANCE_DURATION) / walkDuration;
        const step = Math.floor((elapsed - GLANCE_DURATION) * 5.4);
        const x = mix(startX, takeoffX, progress);
        if (step !== previousStep && step % 2 === 0) cue(101, 0.055, 0.024);
        previousStep = step;
        drawPose(walkKeys[step % walkKeys.length], x, floorY, walkingHeight, direction);
      } else if (elapsed < jumpStart) {
        setPhase('Prepares to jump');
        const dip = Math.sin(Math.PI * (elapsed - walkEnd) / ANTICIPATION_DURATION) * 2;
        drawPose(walkKeys[1], takeoffX, floorY + dip, walkingHeight, direction);
      } else if (elapsed < sitsAt) {
        if (phase !== 'Jumping') cue(360, 0.14, 0.018);
        setPhase('Jumping');
        const progress = (elapsed - jumpStart) / JUMP_DURATION;
        const x = mix(takeoffX, seatX, ease(progress));
        const lift = 4 * progress * (1 - progress) * Math.min(32, baseHeight * 0.31);
        const y = mix(floorY - walkingHeight * 0.37, seatY, progress) - lift;
        const jumpHeight = mix(walkingHeight * 0.88, seatedHeight, ease(progress));
        if (options.wind && progress < 0.62) {
          context.strokeStyle = '#403c3360';
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x - direction * jumpHeight * 0.2, y + jumpHeight * 0.3);
          context.lineTo(x - direction * jumpHeight * 0.24, y + jumpHeight * 0.42);
          context.stroke();
        }
        drawPose('jump', x, y, jumpHeight, direction);
      } else {
        if (phase === 'Jumping') cue(150, 0.08, 0.032);
        const seatedFor = Math.max(0, seconds - sitsAt / playbackSpeed);
        const snackAt = Math.max(0, options.snackDelay);
        const settling = 1 - Math.exp(-seatedFor * 5);
        const swing = (Math.sin(seatedFor * 4.27) * 0.037 + Math.sin(seatedFor * 2.31) * 0.011) * settling;
        if (seatedFor < snackAt) {
          setPhase('Seated');
          drawPose('settled', seatX, seatY, seatedHeight, 1, swing);
        } else if (seatedFor < snackAt + POCKET_DURATION) {
          setPhase('Reaches into pocket');
          drawPose('reach', seatX, seatY, seatedHeight, 1, swing * 0.67);
        } else {
          if (phase !== 'Chocolate break') cue(210, 0.035, 0.013);
          setPhase('Chocolate break');
          const snackTime = seatedFor - snackAt - POCKET_DURATION;
          const bite = Math.sin(Math.PI * clamp((snackTime % 2.6) / 0.55, 0, 1));
          drawPose('snack', seatX, seatY, seatedHeight, 1, swing, bite * 0.036);
        }
      }
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
  }

  function activity() {
    if (phase === 'At rest') reset();
  }

  const listeners = [
    [window, 'scroll', reset], [window, 'resize', reset],
    [document, 'visibilitychange', reset], [window, 'pointerdown', unlockAudio],
    [window, 'pointermove', activity], [window, 'keydown', activity],
    [reduceMotion, 'change', reset],
  ];
  listeners.forEach(([element, event, handler]) => element.addEventListener(event, handler));
  reset();

  return {
    ready,
    play,
    configure(patch) {
      Object.assign(options, patch);
      if (patch.sound) unlockAudio();
      reset();
    },
    destroy() {
      disposed = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      listeners.forEach(([element, event, handler]) => element.removeEventListener(event, handler));
      audio?.close().catch(() => {});
      canvas.remove();
    },
  };
}
