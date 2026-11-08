import React, { useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertCircle,
  FileJson,
  Sparkles
} from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { parseRecipeText } from '../utils/recipeTextParser';

export const BackupImportModal: React.FC = () => {
  const { exportData, importRecipes, resetToDefault, recipes } = useRecipes();
  const { t, language } = useLanguage();
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const recipeArray = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.recipes)
          ? parsed.recipes
          : null;

        if (!recipeArray) {
          setImportStatus({
            success: false,
            message: t('backup.importError')
          });
          return;
        }

        const res = importRecipes(recipeArray);
        if (res.error) {
          setImportStatus({ success: false, message: res.error });
        } else {
          setImportStatus({
            success: true,
            message: t('backup.importSuccess', { count: res.count })
          });
        }
      } catch (err) {
        setImportStatus({
          success: false,
          message: `${t('backup.importError')} (${(err as Error).message})`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText.trim());
      const recipeArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.recipes)
        ? parsed.recipes
        : [parsed];

      const res = importRecipes(recipeArray);
      if (res.error) {
        setImportStatus({ success: false, message: res.error });
      } else {
        setImportStatus({
          success: true,
          message: t('backup.importSuccess', { count: res.count })
        });
        setJsonText('');
      }
    } catch {
      // Intelligent fallback: try parsing unstructured recipe text (Instagram, TikTok, notes)
      const draft = parseRecipeText(jsonText.trim(), language);
      const validIngredients = draft.ingredients
        .filter((i) => i.name.trim() !== '')
        .map((i) => ({
          id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: i.name.trim(),
          quantity: i.quantity ? parseFloat(i.quantity) : null,
          unit: i.unit.trim()
        }));

      if (draft.title && validIngredients.length > 0) {
        const newRecipe = {
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          title: draft.title,
          category: draft.category,
          description: draft.description,
          prepTime: draft.prepTime,
          cookTime: draft.cookTime,
          servings: draft.servings,
          difficulty: draft.difficulty,
          calories: draft.calories,
          image: '',
          ingredients: validIngredients,
          instructions: draft.instructions,
          chefTip: draft.chefTip,
          userRating: 5,
          isFavorite: false,
          isCustom: true,
          createdAt: new Date().toISOString()
        };

        importRecipes([newRecipe]);
        setImportStatus({
          success: true,
          message: `« ${draft.title} » : ${t('backup.importSuccess', { count: 1 })}`
        });
        setJsonText('');
      } else {
        setImportStatus({
          success: false,
          message: t('backup.importError')
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <FileJson className="w-7 h-7 text-emerald-800 dark:text-emerald-400" />
          <span>{t('backup.title')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          {t('backup.subtitle')}
        </p>
      </div>

      {/* Offline Assurance Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
        <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-emerald-950 dark:text-emerald-300 block">
            {t('app.privacy')}
          </span>
          <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-xs">
            {t('hero.desc')}
          </p>
        </div>
      </div>

      {/* Status banner */}
      {importStatus && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
            importStatus.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
          }`}
        >
          {importStatus.success ? (
            <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* 2-Column Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('backup.exportTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {t('backup.exportDesc')} ({recipes.length} {t('nav.recipes').toLowerCase()})
            </p>
          </div>

          <button
            onClick={exportData}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{t('backup.exportButton')}</span>
          </button>
        </div>

        {/* Import via File Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('backup.importTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {t('backup.importDesc')}
            </p>
          </div>

          <label className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 text-white transition-colors shadow-2xs">
            <Upload className="w-4 h-4" />
            <span>{t('backup.importButton')}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Manual Paste JSON or Plain Text Area */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-serif-display text-base font-bold text-stone-900 dark:text-stone-100">
            {t('form.tabSmart')}
          </h3>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t('form.smartPlaceholder').split('\n')[0]}
        </p>
        <textarea
          rows={3}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={t('form.smartPlaceholder')}
          className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-700"
        />
        <div className="flex justify-end">
          <button
            onClick={handleTextImport}
            disabled={!jsonText.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            {t('form.analyzeButton')}
          </button>
        </div>
      </div>

      {/* Reset catalogue section */}
      <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
            {t('backup.resetTitle')}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {t('backup.resetDesc')}
          </span>
        </div>

        {confirmReset ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetToDefault();
                setConfirmReset(false);
                setImportStatus({ success: true, message: t('backup.resetTitle') });
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
            >
              {t('card.confirmYes').split(',')[0]}
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-2.5 py-1.5 text-xs rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
            >
              {t('card.confirmNo')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('backup.resetButton')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
