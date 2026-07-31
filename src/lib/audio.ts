let successAudio: HTMLAudioElement | null = null;
let errorAudio: HTMLAudioElement | null = null;

let _readyPromise: Promise<void> | null = null;

export function audioReady(): Promise<void> {
  if (_readyPromise) return _readyPromise;
  _readyPromise = new Promise<void>((resolve) => {
    successAudio = new Audio(`${import.meta.env.BASE_URL}icons/success.mp3`);
    errorAudio = new Audio(`${import.meta.env.BASE_URL}icons/error.wav`);
    let loaded = 0;
    const onLoad = () => { loaded++; if (loaded >= 2) { (window as any).__audioReady = true; resolve(); } };
    successAudio.addEventListener("canplaythrough", onLoad, { once: true });
    errorAudio.addEventListener("canplaythrough", onLoad, { once: true });
    successAudio.load();
    errorAudio.load();
    setTimeout(() => { (window as any).__audioReady = true; resolve(); }, 3000);
  });
  return _readyPromise;
}

export function playSuccess() {
  try {
    const a = successAudio;
    if (!a) return;
    // Clone to avoid playback conflicts on rapid fire
    const clone = a.cloneNode() as HTMLAudioElement;
    clone.volume = 0.6;
    clone.play().catch(() => {});
  } catch {}
}

export function playError() {
  try {
    const a = errorAudio;
    if (!a) return;
    // Clone to avoid playback conflicts on rapid fire
    const clone = a.cloneNode() as HTMLAudioElement;
    clone.volume = 0.5;
    clone.play().catch(() => {});
  } catch {}
}
