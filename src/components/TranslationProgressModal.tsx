import React from 'react';
import { ChefHat, Sparkles, Check, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TranslationProgressState {
  isOpen: boolean;
  targetLangName: string;
  targetLangFlag: string;
  current: number;
  total: number;
  currentRecipeName?: string;
  percent: number;
  isComplete: boolean;
}

interface TranslationProgressModalProps {
  progress: TranslationProgressState | null;
}

export const TranslationProgressModal: React.FC<TranslationProgressModalProps> = ({ progress }) => {
  const { t } = useLanguage();

  if (!progress || !progress.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-center">
        
        {/* Animated Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-xs relative">
          {progress.isComplete ? (
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-300" />
          ) : (
            <>
              <ChefHat className="w-8 h-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 text-sm">
                {progress.targetLangFlag}
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          {progress.isComplete
            ? 'Traduction terminée avec succès !'
            : `Traduction de votre carnet (${progress.targetLangName})`}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-5 leading-relaxed">
          {progress.isComplete
            ? 'Toutes vos recettes sont désormais prêtes et sauvegardées dans votre mémoire locale.'
            : 'Adaptation automatique de vos recettes dans la langue choisie. Cette opération n’est effectuée qu’une seule fois.'}
        </p>

        {/* Progress bar container */}
        <div className="space-y-2 mb-4">
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden p-0.5 border border-stone-200/70 dark:border-stone-700/70">
            <div
              className="bg-gradient-to-r from-emerald-700 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(5, progress.percent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400 px-1">
            <span className="truncate max-w-[240px] text-left">
              {progress.currentRecipeName ? `« ${progress.currentRecipeName} »` : 'Initialisation...'}
            </span>
            <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {progress.current} / {progress.total} ({progress.percent}%)
            </span>
          </div>
        </div>

        {/* Explanatory note */}
        <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 text-[11px] text-stone-600 dark:text-stone-400 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Mémorisation en cache local pour 0 futur appel réseau.</span>
        </div>
      </div>
    </div>
  );
};
