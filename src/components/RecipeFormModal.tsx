import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ChefHat,
  Sparkles,
  FileText,
  Check,
  Edit3,
  RotateCcw,
  Image as ImageIcon,
  ExternalLink,
  Flame,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Languages,
  Loader2
} from 'lucide-react';
import { Recipe, RecipeCategory, Difficulty, Ingredient, NutritionMacros } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { parseRecipeText, SAMPLE_RECIPES_TEXT } from '../utils/recipeTextParser';
import { translateText, guessLanguage, getLanguageName } from '../services/translationService';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

export const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRecipe = null,
}) => {
  const { addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { t, language, currentLanguageOption, getCategoryText, getDifficultyText } = useLanguage();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Mode: 'smart' (textarea intelligence) or 'manual' (champs manuels)
  const [activeTab, setActiveTab] = useState<'smart' | 'manual'>('smart');

  // Raw text area state
  const [rawText, setRawText] = useState<string>('');
  const [originalPastedText, setOriginalPastedText] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);

  const [parseNotice, setParseNotice] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('plats');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState<number>(15);
  const [cookTime, setCookTime] = useState<number>(10);
  const [servings, setServings] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('Facile');
  
  // Macros per person
  const [calories, setCalories] = useState<string>('');
  const [proteins, setProteins] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fats, setFats] = useState<string>('');

  // Photo & Source Link
  const [image, setImage] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [chefTip, setChefTip] = useState('');

  // Dynamic ingredients
  const [ingredients, setIngredients] = useState<
    { id: string; name: string; quantity: string; unit: string }[]
  >([
    { id: '1', name: '', quantity: '', unit: 'g' },
    { id: '2', name: '', quantity: '', unit: '' }
  ]);

  // Dynamic steps with stable IDs for drag-and-drop reordering
  const [instructions, setInstructions] = useState<{ id: string; text: string }[]>([
    { id: 'step_1', text: '' },
    { id: 'step_2', text: '' }
  ]);

  // Drag and drop reordering state
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [dragOverStepIndex, setDragOverStepIndex] = useState<number | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState<boolean>(false);

  // Sync state whenever initialRecipe changes (for editing) or modal opens
  useEffect(() => {
    if (!isOpen) return;

    setShowUnsavedConfirm(false);

    if (initialRecipe) {
      setTitle(initialRecipe.title);
      setCategory(initialRecipe.category);
      setDescription(initialRecipe.description);
      setPrepTime(initialRecipe.prepTime);
      setCookTime(initialRecipe.cookTime);
      setServings(initialRecipe.servings);
      setDifficulty(initialRecipe.difficulty);

      // Populate macros
      const cal = initialRecipe.macros?.calories ?? initialRecipe.calories;
      setCalories(cal ? cal.toString() : '');
      setProteins(initialRecipe.macros?.proteins !== undefined ? initialRecipe.macros.proteins.toString() : '');
      setCarbs(initialRecipe.macros?.carbs !== undefined ? initialRecipe.macros.carbs.toString() : '');
      setFats(initialRecipe.macros?.fats !== undefined ? initialRecipe.macros.fats.toString() : '');

      setImage(initialRecipe.image || '');
      setSourceUrl(initialRecipe.sourceUrl || '');
      setChefTip(initialRecipe.chefTip || '');

      setIngredients(
        initialRecipe.ingredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity !== null && ing.quantity !== undefined ? ing.quantity.toString() : '',
          unit: ing.unit || '',
        }))
      );
      setInstructions(
        initialRecipe.instructions && initialRecipe.instructions.length > 0
          ? initialRecipe.instructions.map((text, idx) => ({
              id: `step_${idx}_${Date.now()}`,
              text
            }))
          : [
              { id: 'step_1', text: '' },
              { id: 'step_2', text: '' }
            ]
      );
      setActiveTab('manual');
      setParseNotice(null);
      setErrorMsg(null);
      setTranslationNotice(null);
    } else {
      // Clean slate for new recipe
      setTitle('');
      setCategory('plats');
      setDescription('');
      setPrepTime(15);
      setCookTime(10);
      setServings(2);
      setDifficulty('Facile');
      setCalories('');
      setProteins('');
      setCarbs('');
      setFats('');
      setImage('');
      setSourceUrl('');
      setChefTip('');
      setIngredients([
        { id: '1', name: '', quantity: '', unit: 'g' },
        { id: '2', name: '', quantity: '', unit: '' }
      ]);
      setInstructions([
        { id: 'step_1', text: '' },
        { id: 'step_2', text: '' }
      ]);
      setActiveTab('smart');
      setRawText('');
      setOriginalPastedText('');
      setShowOriginal(false);
      setParseNotice(null);
      setErrorMsg(null);
      setTranslationNotice(null);
    }
  }, [initialRecipe, isOpen]);

  // Check if form contains unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!initialRecipe) {
      // New recipe
      return Boolean(
        title.trim() ||
        description.trim() ||
        rawText.trim() ||
        chefTip.trim() ||
        image.trim() ||
        sourceUrl.trim() ||
        calories.trim() ||
        proteins.trim() ||
        carbs.trim() ||
        fats.trim() ||
        ingredients.some((i) => i.name.trim().length > 0) ||
        instructions.some((i) => i.text.trim().length > 0)
      );
    } else {
      // Editing existing recipe
      const origCalories = initialRecipe.macros?.calories ?? initialRecipe.calories;
      const caloriesDiff = (calories || '') !== (origCalories ? origCalories.toString() : '');
      const proteinsDiff = (proteins || '') !== (initialRecipe.macros?.proteins !== undefined ? initialRecipe.macros.proteins.toString() : '');
      const carbsDiff = (carbs || '') !== (initialRecipe.macros?.carbs !== undefined ? initialRecipe.macros.carbs.toString() : '');
      const fatsDiff = (fats || '') !== (initialRecipe.macros?.fats !== undefined ? initialRecipe.macros.fats.toString() : '');

      const titleDiff = title.trim() !== initialRecipe.title;
      const categoryDiff = category !== initialRecipe.category;
      const descDiff = description.trim() !== (initialRecipe.description || '');
      const prepDiff = Number(prepTime) !== initialRecipe.prepTime;
      const cookDiff = Number(cookTime) !== initialRecipe.cookTime;
      const servDiff = Number(servings) !== initialRecipe.servings;
      const diffDiff = difficulty !== initialRecipe.difficulty;
      const imageDiff = image.trim() !== (initialRecipe.image || '');
      const sourceDiff = sourceUrl.trim() !== (initialRecipe.sourceUrl || '');
      const chefTipDiff = chefTip.trim() !== (initialRecipe.chefTip || '');

      const origIngsStr = initialRecipe.ingredients.map((i) => `${i.name}|${i.quantity}|${i.unit}`).join(';');
      const currentIngsStr = ingredients.map((i) => `${i.name.trim()}|${i.quantity}|${i.unit.trim()}`).join(';');
      const ingsDiff = origIngsStr !== currentIngsStr;

      const origStepsStr = (initialRecipe.instructions || []).join(';');
      const currentStepsStr = instructions.map((i) => i.text.trim()).filter(Boolean).join(';');
      const stepsDiff = origStepsStr !== currentStepsStr;

      return (
        titleDiff ||
        categoryDiff ||
        descDiff ||
        prepDiff ||
        cookDiff ||
        servDiff ||
        diffDiff ||
        caloriesDiff ||
        proteinsDiff ||
        carbsDiff ||
        fatsDiff ||
        imageDiff ||
        sourceDiff ||
        chefTipDiff ||
        ingsDiff ||
        stepsDiff
      );
    }
  };

  const handleAttemptClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedConfirm(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  /**
   * Applies parsed data to form inputs
   */
  const applyParsedData = (parsed: ReturnType<typeof parseRecipeText>) => {
    setTitle(parsed.title);
    setCategory(parsed.category);
    setDescription(parsed.description);
    setPrepTime(parsed.prepTime);
    setCookTime(parsed.cookTime);
    setServings(parsed.servings);
    setDifficulty(parsed.difficulty);

    setCalories(parsed.calories ? parsed.calories.toString() : '');
    setProteins(parsed.macros?.proteins ? parsed.macros.proteins.toString() : '');
    setCarbs(parsed.macros?.carbs ? parsed.macros.carbs.toString() : '');
    setFats(parsed.macros?.fats ? parsed.macros.fats.toString() : '');

    if (parsed.imageUrl) setImage(parsed.imageUrl);
    if (parsed.sourceUrl) setSourceUrl(parsed.sourceUrl);

    setChefTip(parsed.chefTip || '');
    setIngredients(parsed.ingredients);
    setInstructions(
      parsed.instructions.map((text, idx) => ({
        id: `step_parsed_${idx}_${Date.now()}`,
        text
      }))
    );

    const macroDetails: string[] = [];
    if (parsed.calories) macroDetails.push(`${parsed.calories} kcal`);
    if (parsed.macros?.proteins) macroDetails.push(`${parsed.macros.proteins}g prot`);
    if (parsed.macros?.carbs) macroDetails.push(`${parsed.macros.carbs}g gluc`);
    if (parsed.macros?.fats) macroDetails.push(`${parsed.macros.fats}g lip`);

    setParseNotice({
      success: true,
      message: `« ${parsed.title} » : ${parsed.ingredients.length} ${t('detail.ingredients').toLowerCase()}, ${parsed.servings} ${t('detail.servings').toLowerCase()} ${macroDetails.length > 0 ? `(${macroDetails.join(' · ')})` : ''}.`
    });

    setActiveTab('manual');
  };

  /**
   * Handle smart text parsing with automatic translation
   */
  const handleParseText = async (textToParse: string) => {
    if (!textToParse.trim()) {
      setErrorMsg(t('form.requiredError'));
      return;
    }
    setErrorMsg(null);

    let textForParsing = textToParse;

    // Check if auto-translation is active and text is foreign
    if (autoTranslate) {
      const guessed = guessLanguage(textToParse);
      // If guessed language is clearly different from active language or contains non-target language patterns
      if (guessed && guessed !== language) {
        setIsTranslating(true);
        try {
          const { translatedText, detectedSourceLang } = await translateText(textToParse, language);
          if (translatedText && translatedText !== textToParse) {
            setOriginalPastedText(textToParse);
            setRawText(translatedText);
            textForParsing = translatedText;
            const fromName = getLanguageName(detectedSourceLang || guessed, language);
            const toName = currentLanguageOption.name;
            setTranslationNotice(t('form.translatedBadge', { from: fromName, to: toName }));
          }
        } catch (err) {
          console.warn('Auto translation failed, proceeding with original text:', err);
        } finally {
          setIsTranslating(false);
        }
      }
    }

    const parsed = parseRecipeText(textForParsing, language);
    applyParsedData(parsed);
  };

  /**
   * Manual translate action on raw text
   */
  const handleManualTranslate = async () => {
    if (!rawText.trim()) return;
    setIsTranslating(true);
    setErrorMsg(null);
    try {
      const { translatedText, detectedSourceLang } = await translateText(rawText, language);
      setOriginalPastedText(rawText);
      setRawText(translatedText);
      const fromName = getLanguageName(detectedSourceLang, language);
      const toName = currentLanguageOption.name;
      setTranslationNotice(t('form.translatedBadge', { from: fromName, to: toName }));
    } catch (err) {
      console.error('Translation error:', err);
      setErrorMsg('Erreur lors de la traduction automatique.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleToggleOriginalTranslated = () => {
    if (!originalPastedText) return;
    if (showOriginal) {
      // Switch back to translated
      setShowOriginal(false);
    } else {
      // Switch to original
      setShowOriginal(true);
    }
  };

  const handleLoadSample = (sampleLang: 'current' | 'en') => {
    const textToLoad = sampleLang === 'en'
      ? SAMPLE_RECIPES_TEXT.en
      : (SAMPLE_RECIPES_TEXT[language] || SAMPLE_RECIPES_TEXT.fr);
    
    setRawText(textToLoad);
    setOriginalPastedText('');
    setTranslationNotice(null);
    handleParseText(textToLoad);
  };

  const handleAddIngredient = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', quantity: '', unit: 'g' }
    ]);
  };

  const handleRemoveIngredient = (id: string) => {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleIngredientChange = (
    id: string,
    field: 'name' | 'quantity' | 'unit',
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddStep = () => {
    setInstructions((prev) => [
      ...prev,
      { id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, text: '' }
    ]);
  };

  const handleRemoveStep = (id: string) => {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStepChange = (id: string, value: string) => {
    setInstructions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text: value } : item))
    );
  };

  // Reorder steps up or down
  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= instructions.length) return;
    setInstructions((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStepIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStepIndex !== index) {
      setDragOverStepIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedStepIndex(null);
    setDragOverStepIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedStepIndex !== null && draggedStepIndex !== targetIndex) {
      handleMoveStep(draggedStepIndex, targetIndex);
    }
    setDraggedStepIndex(null);
    setDragOverStepIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If currently on smart tab and title is empty, parse raw text first
    if (activeTab === 'smart' && !title.trim() && rawText.trim()) {
      const parsed = parseRecipeText(rawText, language);
      setTitle(parsed.title);
      setCategory(parsed.category);
      setDescription(parsed.description);
      setPrepTime(parsed.prepTime);
      setCookTime(parsed.cookTime);
      setServings(parsed.servings);
      setDifficulty(parsed.difficulty);
      setIngredients(parsed.ingredients);
      setInstructions(parsed.instructions.map((t, i) => ({ id: `step_${i}`, text: t })));
      setActiveTab('manual');
      return;
    }

    if (!title.trim()) {
      setErrorMsg(t('form.requiredError'));
      return;
    }

    const validIngredients: Ingredient[] = ingredients
      .filter((ing) => ing.name.trim().length > 0)
      .map((ing) => ({
        id: ing.id,
        name: ing.name.trim(),
        quantity: ing.quantity ? parseFloat(ing.quantity) || null : null,
        unit: ing.unit.trim(),
      }));

    if (validIngredients.length === 0) {
      setErrorMsg(t('form.requiredError'));
      return;
    }

    const validInstructions = instructions
      .map((i) => i.text.trim())
      .filter((t) => t.length > 0);

    const parsedCalories = calories ? parseInt(calories, 10) || undefined : undefined;
    const parsedProteins = proteins ? parseFloat(proteins.replace(',', '.')) || undefined : undefined;
    const parsedCarbs = carbs ? parseFloat(carbs.replace(',', '.')) || undefined : undefined;
    const parsedFats = fats ? parseFloat(fats.replace(',', '.')) || undefined : undefined;

    const macros: NutritionMacros = {
      calories: parsedCalories,
      proteins: parsedProteins,
      carbs: parsedCarbs,
      fats: parsedFats
    };

    if (initialRecipe) {
      // Updating an existing recipe
      const updated: Recipe = {
        ...initialRecipe,
        title: title.trim(),
        category,
        description: description.trim() || t('hero.desc'),
        prepTime: Number(prepTime) || 15,
        cookTime: Number(cookTime) || 0,
        servings: Number(servings) || 2,
        difficulty,
        calories: parsedCalories,
        macros,
        image: image.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        chefTip: chefTip.trim() || undefined,
        ingredients: validIngredients,
        instructions: validInstructions
      };

      updateRecipe(updated);
      onSuccess(updated);
    } else {
      // Creating a new recipe
      const created = addRecipe({
        title: title.trim(),
        category,
        description: description.trim() || 'Une délicieuse recette maison préparée avec soin.',
        prepTime: Number(prepTime) || 15,
        cookTime: Number(cookTime) || 0,
        servings: Number(servings) || 2,
        difficulty,
        calories: parsedCalories,
        macros,
        image: image.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        chefTip: chefTip.trim() || undefined,
        isFavorite: false,
        ingredients: validIngredients,
        instructions: validInstructions
      });

      onSuccess(created);
    }

    onClose();
  };

  const isEditing = Boolean(initialRecipe);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Unsaved Changes Confirmation Modal Overlay */}
        {showUnsavedConfirm && (
          <div className="absolute inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 max-w-md w-full shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
                  {t('form.unsavedTitle')}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('form.unsavedConfirm')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedConfirm(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  {t('form.unsavedYes')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUnsavedConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t('form.unsavedNo')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${isEditing ? 'bg-amber-600' : 'bg-emerald-800'} text-white flex items-center justify-center shadow-xs`}>
              {isEditing ? <Edit3 className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100">
                {isEditing ? t('form.modalTitleEdit') : t('form.modalTitleNew')}
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {isEditing
                  ? `Mise à jour de « ${initialRecipe?.title} »`
                  : t('app.privacy')}
              </span>
            </div>
          </div>
          <button
            onClick={handleAttemptClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-2 bg-stone-50/60 dark:bg-stone-950/40 border-b border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('smart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'smart'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t('form.tabSmart')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>{t('form.tabManual')}</span>
            </button>
          </div>

          {activeTab === 'smart' && !isEditing && (
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => handleLoadSample('current')}
                className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('form.loadSample')} ({currentLanguageOption.name})</span>
              </button>

              {language !== 'en' && (
                <button
                  type="button"
                  onClick={() => handleLoadSample('en')}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  title="Colle une recette en anglais pour tester la traduction automatique"
                >
                  <span>🇬🇧 Test recette en anglais</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Translation Banner if triggered */}
        {translationNotice && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{translationNotice}</span>
            </div>
            {originalPastedText && (
              <button
                type="button"
                onClick={handleToggleOriginalTranslated}
                className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:underline ml-3 cursor-pointer shrink-0"
              >
                {showOriginal ? t('form.showTranslatedText') : t('form.showOriginalText')}
              </button>
            )}
          </div>
        )}

        {/* Success Notice if parsed */}
        {parseNotice && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{parseNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setParseNotice(null)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 flex-1 text-xs sm:text-sm">
          
          {/* TAB 1: SMART TEXTAREA IMPORT */}
          {activeTab === 'smart' ? (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="font-serif-display text-base font-bold text-stone-900 dark:text-stone-100 block">
                    {t('form.smartPlaceholder').split('\n')[0]}
                  </label>

                  {/* Auto-Translate Toggle Switch */}
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                    <input
                      type="checkbox"
                      checked={autoTranslate}
                      onChange={(e) => setAutoTranslate(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-700 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="font-medium text-stone-700 dark:text-stone-200 flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>{t('form.autoTranslate', { lang: currentLanguageOption.name })}</span>
                    </span>
                  </label>
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                  {t('form.autoTranslateDesc')}
                </p>

                <div className="relative">
                  <textarea
                    rows={11}
                    value={showOriginal ? originalPastedText : rawText}
                    onChange={(e) => {
                      if (!showOriginal) {
                        setRawText(e.target.value);
                      }
                    }}
                    readOnly={showOriginal}
                    placeholder={t('form.smartPlaceholder')}
                    className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 font-mono leading-relaxed focus:ring-2 focus:ring-emerald-700/30"
                  />
                  {isTranslating && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center gap-2 text-stone-700 dark:text-stone-200">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-700 dark:text-emerald-400" />
                      <span className="text-xs font-semibold">{t('form.translating')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {rawText.trim() ? `${rawText.split('\n').length} lignes` : ''}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {rawText && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawText('');
                        setOriginalPastedText('');
                        setTranslationNotice(null);
                      }}
                      className="px-3 py-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      {t('search.clear')}
                    </button>
                  )}

                  {rawText && (
                    <button
                      type="button"
                      onClick={handleManualTranslate}
                      disabled={isTranslating}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 transition-colors text-xs font-medium cursor-pointer"
                    >
                      <Languages className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('form.translateButton')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleParseText(rawText)}
                    disabled={!rawText.trim() || isTranslating}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 text-white font-semibold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('form.analyzeButton')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: DETAILED MANUAL / REVIEW FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title & Category */}
              <div className="grid modal-grid modal-grid--3 grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-medium text-stone-700 dark:text-stone-300">
                    {t('form.title')}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('form.titlePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-stone-700 dark:text-stone-300">
                    {t('form.category')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RecipeCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700/30 cursor-pointer"
                  >
                    <option value="plats">{getCategoryText('plats')}</option>
                    <option value="entrees">{getCategoryText('entrees')}</option>
                    <option value="desserts">{getCategoryText('desserts')}</option>
                    <option value="vegetarien">{getCategoryText('vegetarien')}</option>
                    <option value="rapide">{getCategoryText('rapide')}</option>
                    <option value="aperitifs">{getCategoryText('aperitifs')}</option>
                  </select>
                </div>
              </div>

              {/* Photo & Source Link Section */}
              <div className="grid modal-grid modal-grid--2 grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('form.imageUrl')}</span>
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder={t('form.imageUrlPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                    <span>{t('form.sourceUrl')}</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder={t('form.sourceUrlPlaceholder')}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-emerald-700/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-medium text-stone-700 dark:text-stone-300">
                  {t('form.description')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('form.descriptionPlaceholder')}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              {/* Prep time, Cook time, Servings & Difficulty */}
              <div className="grid modal-grid modal-grid--24 grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-stone-600 dark:text-stone-300">
                    {t('form.prepTime')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={prepTime}
                    onChange={(e) => setPrepTime(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-600 dark:text-stone-300">
                    {t('form.cookTime')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cookTime}
                    onChange={(e) => setCookTime(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-600 dark:text-stone-300">
                    {t('form.servings')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={servings}
                    onChange={(e) => setServings(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-600 dark:text-stone-300">
                    {t('form.difficulty')}
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                  >
                    <option value="Facile">{getDifficultyText('Facile')}</option>
                    <option value="Moyen">{getDifficultyText('Moyen')}</option>
                    <option value="Avancé">{getDifficultyText('Avancé')}</option>
                  </select>
                </div>
              </div>

              {/* Macronutriments par personne */}
              <div className="space-y-2 bg-stone-50/80 dark:bg-stone-800/40 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-serif-display text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{t('form.macrosHeader')}</span>
                  </span>
                </div>

                <div className="grid modal-grid modal-grid--24 grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 dark:text-stone-300">{t('form.calories')}</label>
                    <input
                      type="number"
                      min={0}
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      placeholder="Ex: 440"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 dark:text-stone-300">{t('form.proteins')}</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={proteins}
                      onChange={(e) => setProteins(e.target.value)}
                      placeholder="Ex: 39.5"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 dark:text-stone-300">{t('form.carbs')}</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      placeholder="Ex: 19.5"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-stone-600 dark:text-stone-300">{t('form.fats')}</label>
                    <input
                      type="number"
                      step="any"
                      min={0}
                      value={fats}
                      onChange={(e) => setFats(e.target.value)}
                      placeholder="Ex: 17.5"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Ingredients Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-serif-display text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>{t('form.ingredientsHeader')} ({ingredients.filter(i => i.name.trim()).length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('form.addIngredient')}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ingredients.map((ing, index) => (
                    <div key={ing.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                          placeholder={t('form.ingNamePlaceholder')}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>

                      <div className="w-20">
                        <input
                          type="text"
                          value={ing.quantity}
                          onChange={(e) => handleIngredientChange(ing.id, 'quantity', e.target.value)}
                          placeholder={t('form.ingQtyPlaceholder')}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-700 font-mono"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="text"
                          value={ing.unit}
                          onChange={(e) => handleIngredientChange(ing.id, 'unit', e.target.value)}
                          placeholder={t('form.ingUnitPlaceholder')}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-700"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing.id)}
                        disabled={ingredients.length <= 1}
                        className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title={t('card.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Instructions Section with Drag and Drop Reordering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-serif-display text-base font-bold text-stone-900 dark:text-stone-100 block">
                      {t('form.instructionsHeader')}
                    </label>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                      <GripVertical className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{t('form.dragNotice')}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('form.addStep')}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {instructions.map((step, index) => {
                    const isDragging = draggedStepIndex === index;
                    const isDragOver = dragOverStepIndex === index && !isDragging;

                    return (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative flex items-start gap-2.5 p-2 rounded-xl border transition-all duration-150 ${
                          isDragging
                            ? 'opacity-40 border-dashed border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 scale-[0.99]'
                            : isDragOver
                            ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-stone-200/80 dark:border-stone-700/80 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div
                          className="pt-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-grab active:cursor-grabbing select-none shrink-0"
                          title="Glisser-déposer pour déplacer cette étape"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Dynamic Step Number */}
                        <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                          {index + 1}
                        </span>

                        {/* Step Description Textarea */}
                        <textarea
                          rows={2}
                          value={step.text}
                          onChange={(e) => handleStepChange(step.id, e.target.value)}
                          placeholder={`${t('detail.step', { step: index + 1 })}...`}
                          className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-700 resize-none"
                        />

                        {/* Quick Up/Down arrow buttons for accessibility */}
                        <div className="flex flex-col gap-0.5 pt-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveStep(index, index - 1)}
                            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Monter cette étape"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === instructions.length - 1}
                            onClick={() => handleMoveStep(index, index + 1)}
                            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Descendre cette étape"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Delete Step Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          disabled={instructions.length <= 1}
                          className="pt-2 p-1 text-stone-400 hover:text-rose-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                          title="Supprimer cette étape"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chef Tip */}
              <div className="space-y-1.5">
                <label className="font-medium text-stone-700 dark:text-stone-300">
                  {t('form.chefTip')}
                </label>
                <input
                  type="text"
                  value={chefTip}
                  onChange={(e) => setChefTip(e.target.value)}
                  placeholder={t('form.chefTipPlaceholder')}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700/30"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                {isEditing && (
                  <div>
                    {confirmDelete ? (
                      <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-3 py-1.5 rounded-xl">
                        <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                          {t('card.deleteConfirm')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (initialRecipe) {
                              deleteRecipe(initialRecipe.id);
                              onClose();
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-2xs"
                        >
                          {t('card.confirmYes')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                        >
                          {t('card.confirmNo')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('card.delete')}</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={handleAttemptClose}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    {t('form.cancel')}
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    {isEditing ? t('form.submitSave') : t('form.submitCreate')}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
