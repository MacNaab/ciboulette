import React, { useEffect, useState } from 'react';
import { Timer, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TIMER_FINISHED_EVENT } from '../services/cookingTimer';

interface TimerMessage {
  title: string;
  body: string;
}

/**
 * In-app alert when a cooking timer finishes while the app is visible
 * (also the fallback when notification permission was denied).
 */
export const TimerToast: React.FC = () => {
  const { t } = useLanguage();
  const [message, setMessage] = useState<TimerMessage | null>(null);

  useEffect(() => {
    const onFinish = (event: Event) => {
      const detail = (event as CustomEvent<TimerMessage>).detail;
      setMessage({ title: detail.title, body: detail.body });
    };
    window.addEventListener(TIMER_FINISHED_EVENT, onFinish);
    return () => window.removeEventListener(TIMER_FINISHED_EVENT, onFinish);
  }, []);

  useEffect(() => {
    if (!message) return;
    const hide = window.setTimeout(() => setMessage(null), 10000);
    return () => window.clearTimeout(hide);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[min(24rem,calc(100vw-2rem))] p-4 rounded-2xl bg-stone-900 text-white border border-stone-700 shadow-xl flex items-start gap-3 animate-[fadeIn_0.25s_ease-out]"
    >
      <span className="w-9 h-9 shrink-0 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
        <Timer className="w-4.5 h-4.5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-emerald-400">{message.title}</span>
        <span className="block text-xs text-stone-300 leading-snug mt-0.5">{message.body}</span>
      </span>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label={t('timer.dismiss')}
        className="p-1 -m-1 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
