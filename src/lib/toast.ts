// Global toast — call showToast() from anywhere
let _setToast: ((msg: string | null) => void) | null = null;

export function showToast(msg: string) {
  if (_setToast) {
    _setToast(msg);
    setTimeout(() => _setToast?.(null), 1500);
  }
}

export function setToastHandler(fn: (msg: string | null) => void) {
  _setToast = fn;
}
