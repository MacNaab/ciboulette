/**
 * Service worker registration (production only).
 *
 * The SW is deliberately skipped in dev: it would serve stale files and mask
 * HMR. Verify PWA behaviour with `npm run build && npm run preview`.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
