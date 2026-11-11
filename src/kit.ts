/*
 * Loads the design kit's scripts (public/assets) once React has committed its first tree.
 * system.js / motion.js / layout.js / moments.js all self-init on import when the document
 * is already parsed, so a dynamic import after mount is enough. The URLs are resolved against
 * document.baseURI so the app works under a sub-path (GitHub Pages); @vite-ignore keeps the
 * bundler from touching files that stay in public/.
 */

type KitModule = { init?: () => void; refresh?: () => void; mountAll?: (root: Document) => void };

let kitPromise: Promise<void> | null = null;

const load = (path: string): Promise<KitModule> =>
  import(/* @vite-ignore */ new URL(`assets/${path}`, document.baseURI).href) as Promise<KitModule>;

/** Import the kit once, after the first render. Safe to call on every mount. */
export function initKit(): Promise<void> {
  if (!kitPromise) {
    kitPromise = (async () => {
      try {
        await load('system.js');
        await load('motion/motion.js');
        await load('layout/layout.js');
      } catch (err) {
        console.warn('Design kit scripts unavailable:', err);
      }
    })();
  }
  return kitPromise;
}

/**
 * Re-run the kit's scans after the DOM changed shape (tab change): the hero entrance, the
 * section measurements and any [data-moment] section that just mounted.
 */
export async function refreshKit(): Promise<void> {
  if (!kitPromise) return;
  await kitPromise;
  try {
    const motion = await load('motion/motion.js');
    motion.refresh?.();
    const layout = await load('layout/layout.js');
    layout.init?.();
    const moments = await load('moments/moments.js');
    moments.mountAll?.(document);
  } catch (err) {
    console.warn('Design kit refresh failed:', err);
  }
}
