// Shared audio effects — preloaded once, reusable everywhere

let successAudio: HTMLAudioElement | null = null;
let errorAudio: HTMLAudioElement | null = null;

// Eagerly create and start loading
const _init = () => {
  successAudio = new Audio("/icons/success.mp3");
  errorAudio = new Audio("/icons/error.wav");
  successAudio.load();
  errorAudio.load();
};
_init();

function getSuccess(): HTMLAudioElement | null { return successAudio; }
function getError(): HTMLAudioElement | null { return errorAudio; }

export function playSuccess() {
  try {
    const a = getSuccess();
    if (a) { a.currentTime = 0; a.volume = 0.6; a.play().catch(() => {}); }
  } catch {}
}

export function playError() {
  try {
    const a = getError();
    if (a) { a.currentTime = 0; a.volume = 0.5; a.play().catch(() => {}); }
  } catch {}
}
