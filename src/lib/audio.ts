let successAudio: HTMLAudioElement | null = null;
let errorAudio: HTMLAudioElement | null = null;

let _readyPromise: Promise<void> | null = null;

export function audioReady(): Promise<void> {
  if (_readyPromise) return _readyPromise;
  _readyPromise = new Promise<void>((resolve) => {
    successAudio = new Audio("/icons/success.mp3");
    errorAudio = new Audio("/icons/error.wav");
    let loaded = 0;
    const onLoad = () => { loaded++; if (loaded >= 2) resolve(); };
    successAudio.addEventListener("canplaythrough", onLoad, { once: true });
    errorAudio.addEventListener("canplaythrough", onLoad, { once: true });
    successAudio.load();
    errorAudio.load();
    setTimeout(() => resolve(), 3000);
  });
  return _readyPromise;
}

export function playSuccess() {
  try {
    const a = successAudio;
    if (a) { a.currentTime = 0; a.volume = 0.6; a.play().catch(() => {}); }
  } catch {}
}

export function playError() {
  try {
    const a = errorAudio;
    if (a) { a.currentTime = 0; a.volume = 0.5; a.play().catch(() => {}); }
  } catch {}
}
