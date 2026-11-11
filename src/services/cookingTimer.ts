/**
 * Global cooking timer with local notification (no backend needed).
 *
 * - Persisted in localStorage so the countdown survives closing the modal,
 *   reloading the page or reopening the app.
 * - Deadlines are stored as timestamps (`targetAt`), so a throttled/frozen tab
 *   still fires (possibly late) via `checkNow()` on resume.
 * - The alert is a LOCAL notification through the service worker when the app
 *   is hidden, and an in-app toast + beep when it is visible. No Web Push:
 *   the app is hosted on static hosting (GitHub Pages) with no push sender.
 */
import { useEffect, useMemo, useState } from 'react';
import { TRANSLATIONS } from '../i18n/translations';
import { SupportedLanguage } from '../types/i18n';

const STORAGE_KEY = 'ciboulette_timer_v1';
const LANGUAGE_KEY = 'ciboulette_language_v1';
const NOTIFICATION_TAG = 'ciboulette-cooking-timer';

/** Custom event dispatched on `window` when a timer finishes. */
export const TIMER_FINISHED_EVENT = 'ciboulette:timer-finished';

export interface CookingTimer {
  recipeId: string;
  recipeTitle: string;
  totalSeconds: number;
  /** Epoch ms when the timer ends; null while paused. */
  targetAt: number | null;
  /** Remaining seconds while paused. */
  remainingSeconds: number;
}

export interface TimerSnapshot {
  timer: CookingTimer | null;
  remainingSeconds: number;
  running: boolean;
}

let timer: CookingTimer | null = loadTimer();
let timeoutId: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<(snapshot: TimerSnapshot) => void>();

// ---------------------------------------------------------------------------
// Audio (short beeps; the AudioContext is unlocked on the start click)
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;

function unlockAudio(): void {
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    if (!audioCtx) audioCtx = new Ctor();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch {
    audioCtx = null;
  }
}

function playBeeps(): void {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const startAt = audioCtx.currentTime;
  for (let i = 0; i < 3; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = i % 2 === 0 ? 880 : 660;
    const t0 = startAt + i * 0.35;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.3);
    osc.start(t0);
    osc.stop(t0 + 0.32);
  }
}

// ---------------------------------------------------------------------------
// Persistence & snapshot
// ---------------------------------------------------------------------------
function loadTimer(): CookingTimer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookingTimer;
    if (parsed && typeof parsed.recipeId === 'string' && typeof parsed.totalSeconds === 'number') return parsed;
  } catch (err) {
    console.error('Error loading cooking timer:', err);
  }
  return null;
}

function persist(): void {
  try {
    if (timer) localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
    else localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error saving cooking timer:', err);
  }
}

function remainingSeconds(t: CookingTimer): number {
  if (t.targetAt === null) return Math.max(0, t.remainingSeconds);
  return Math.max(0, Math.ceil((t.targetAt - Date.now()) / 1000));
}

function snapshot(): TimerSnapshot {
  if (!timer) return { timer: null, remainingSeconds: 0, running: false };
  return {
    timer,
    remainingSeconds: remainingSeconds(timer),
    running: timer.targetAt !== null,
  };
}

function notify(): void {
  const snap = snapshot();
  listeners.forEach((listener) => listener(snap));
}

function clearSchedule(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function schedule(): void {
  clearSchedule();
  if (!timer || timer.targetAt === null) return;
  const delay = Math.max(0, timer.targetAt - Date.now());
  timeoutId = setTimeout(() => {
    timeoutId = null;
    finish();
  }, Math.min(delay, 2 ** 31 - 1));
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------
function currentLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored === 'fr' || stored === 'en' || stored === 'es') return stored;
  } catch {
    /* ignore */
  }
  return 'fr';
}

function textsFor(recipeTitle: string): { title: string; body: string } {
  const lang = currentLanguage();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const fill = (key: string) => (dict[key] || TRANSLATIONS.fr[key] || key).replace('{title}', recipeTitle);
  return { title: fill('timer.notifTitle'), body: fill('timer.notifBody') };
}

async function announce(t: CookingTimer): Promise<void> {
  const { title, body } = textsFor(t.recipeTitle);
  const visible = document.visibilityState === 'visible';

  // Always let the UI react (also the fallback when notifications are blocked).
  window.dispatchEvent(new CustomEvent(TIMER_FINISHED_EVENT, { detail: { title, body, recipeTitle: t.recipeTitle } }));

  if (visible) {
    playBeeps();
    return; // the user is looking at the app — toast + sound is enough
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const icon = new URL('icons/icon-192.png', document.baseURI).href;
    const options: NotificationOptions = {
      body,
      tag: NOTIFICATION_TAG,
      icon,
      badge: icon,
      requireInteraction: true,
    };
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, options);
    else new Notification(title, options);
  } catch (err) {
    console.warn('Notification could not be shown:', err);
  }
}

function finish(): void {
  const done = timer;
  timer = null;
  clearSchedule();
  persist();
  notify();
  if (done) void announce(done);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export function getTimerSnapshot(): TimerSnapshot {
  return snapshot();
}

export function subscribeTimer(listener: (snapshot: TimerSnapshot) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Must be called from a user gesture so the permission prompt is allowed. */
export function requestNotificationPermission(): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    void Notification.requestPermission().catch(() => {});
  }
}

export function startTimer(recipeId: string, recipeTitle: string, totalSeconds: number): void {
  unlockAudio();
  requestNotificationPermission();
  timer = {
    recipeId,
    recipeTitle,
    totalSeconds,
    targetAt: Date.now() + totalSeconds * 1000,
    remainingSeconds: totalSeconds,
  };
  persist();
  schedule();
  notify();
}

export function pauseTimer(): void {
  if (!timer || timer.targetAt === null) return;
  timer = { ...timer, remainingSeconds: remainingSeconds(timer), targetAt: null };
  clearSchedule();
  persist();
  notify();
}

export function resumeTimer(): void {
  if (!timer || timer.targetAt !== null) return;
  unlockAudio();
  timer = { ...timer, targetAt: Date.now() + timer.remainingSeconds * 1000 };
  persist();
  schedule();
  notify();
}

export function cancelTimer(): void {
  timer = null;
  clearSchedule();
  persist();
  notify();
}

/** Re-check a pending deadline (page reload, tab resumed from background). */
function checkNow(): void {
  if (timer && timer.targetAt !== null && Date.now() >= timer.targetAt) finish();
}

/**
 * Restores a pending timer and installs the resume listeners.
 * Call once, before the first render (see src/main.tsx).
 */
export function initCookingTimer(): void {
  if (timer && timer.targetAt !== null) {
    if (Date.now() >= timer.targetAt) finish();
    else schedule();
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkNow();
  });
  window.addEventListener('focus', checkNow);
}

/** React binding: ticking snapshot + timer actions. */
export function useCookingTimer(): TimerSnapshot & {
  start: (recipeId: string, recipeTitle: string, totalSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
} {
  const [snap, setSnap] = useState<TimerSnapshot>(getTimerSnapshot);
  useEffect(() => subscribeTimer(setSnap), []);
  return useMemo(
    () => ({
      ...snap,
      start: startTimer,
      pause: pauseTimer,
      resume: resumeTimer,
      cancel: cancelTimer,
    }),
    [snap]
  );
}
