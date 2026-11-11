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
    <div className="sec-pane space-y-6">
      {/* Header — the privacy line lives here, so the ground stays quiet;
          parted from the cards by air alone (SR-3: no rules between parts) */}
      <div className="pb-4">
        {/* the icon sits inline so the words start on the container's left line */}
        <h2 id="sauvegarde-h" className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          <FileJson className="w-7 h-7 mr-2.5 inline-block align-middle text-emerald-800 dark:text-emerald-400" aria-hidden="true" />
          <span>{t('backup.title')}</span>
        </h2>
        <p className="text-xs sm:text-sm muted mt-1">
          {t('backup.subtitle')}
        </p>
        <p className="text-xs muted mt-1.5 flex items-center gap-1.5">
          <span>{t('app.privacy')}</span>
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </p>
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

      {/* Four cards on the grid's 12: two a row over 768 (export / import, paste / reset) */}
      <div className="grid backup-grid gap-6">
        
        {/* Export Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Download className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('backup.exportTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {t('backup.exportDesc')} ({recipes.length} {t('nav.recipes').toLowerCase()})
            </p>
          </div>

          <button onClick={exportData} className="btn btn--primary w-full">
            <Download aria-hidden="true" />
            <span>{t('backup.exportButton')}</span>
          </button>
        </div>

        {/* Import via File Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('backup.importTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {t('backup.importDesc')}
            </p>
          </div>

          <label className="btn btn--primary w-full cursor-pointer">
            <Upload aria-hidden="true" />
            <span>{t('backup.importButton')}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Manual Paste — the third card of the grid: at half width its words stay on one card's lines */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3 shadow-2xs">
        <label htmlFor="sauv-paste" className="flex items-center gap-2 cursor-pointer">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          <span className="font-serif-display text-base font-bold text-stone-900 dark:text-stone-100">
            {t('form.tabSmart')}
          </span>
        </label>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t('form.smartPlaceholder').split('\n')[0]}
        </p>
        <textarea
          id="sauv-paste"
          rows={2}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={t('form.smartPlaceholder')}
          className="w-full font-mono text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100  focus:ring-1 focus:ring-emerald-700"
        />
        <div className="flex justify-end">
          <button onClick={handleTextImport} disabled={!jsonText.trim()} className="btn btn--secondary">
            {t('form.analyzeButton')}
          </button>
        </div>
      </div>

      {/* Reset catalogue section */}
      <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 flex items-center justify-between gap-4">
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
    </div>
  );
};
