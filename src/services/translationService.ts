import { SupportedLanguage } from '../types/i18n';
import { Recipe, Ingredient } from '../types/recipe';
import { saveCachedRecipeTranslation } from './recipeCacheService';

export interface TranslationResult {
  translatedText: string;
  detectedSourceLang: string;
}

const LANGUAGE_NAMES: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    en: 'Anglais',
    es: 'Espagnol',
    fr: 'Français',
    de: 'Allemand',
    it: 'Italien',
    pt: 'Portugais'
  },
  en: {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese'
  },
  es: {
    en: 'Inglés',
    es: 'Español',
    fr: 'Francés',
    de: 'Alemán',
    it: 'Italiano',
    pt: 'Portugués'
  }
};

/**
 * Returns the human-readable display name of a language code.
 */
export function getLanguageName(langCode: string, inLang: SupportedLanguage): string {
  const norm = langCode.toLowerCase().slice(0, 2);
  return LANGUAGE_NAMES[inLang]?.[norm] || langCode.toUpperCase();
}

/**
 * Quick heuristic to estimate if a text is likely English, Spanish or French
 * Useful for offline or immediate UI detection.
 */
export function guessLanguage(text: string): 'en' | 'es' | 'fr' | null {
  const lower = text.toLowerCase();
  
  // English markers
  const enMatches = (lower.match(/\b(the|and|ingredients|preparation|directions|instructions|servings|tablespoon|teaspoon|corn|cheese|chicken|skillet|bake|cook|prep|min|minutes|calories|protein|wrap)\b/g) || []).length;
  
  // Spanish markers
  const esMatches = (lower.match(/\b(el|la|los|las|ingredientes|preparación|instrucciones|pasos|porciones|cucharada|cucharadita|maíz|queso|pollo|sartén|cocinar|calorías|proteínas)\b/g) || []).length;

  // French markers
  const frMatches = (lower.match(/\b(le|la|les|ingrédients|préparation|étapes|portions|cuillère|maïs|fromage|poulet|poêle|cuisson|calories|protéines|morceaux|tranches)\b/g) || []).length;

  if (enMatches > esMatches && enMatches > frMatches && enMatches >= 2) return 'en';
  if (esMatches > enMatches && esMatches > frMatches && esMatches >= 2) return 'es';
  if (frMatches > enMatches && frMatches > esMatches && frMatches >= 2) return 'fr';
  return null;
}

/**
 * Core text translation via free Google Translate GTX API.
 * Uses public endpoint that supports CORS and automatic source language detection.
 */
async function translateViaGoogleGTX(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: string = 'auto'
): Promise<TranslationResult> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate API HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('Format de réponse de traduction inattendu');
  }

  const translatedSegments = data[0].map((item: any) => (item && item[0] ? item[0] : '')).join('');
  const detectedLang = typeof data[2] === 'string' ? data[2].toLowerCase() : sourceLang;

  return {
    translatedText: translatedSegments || text,
    detectedSourceLang: detectedLang
  };
}

/**
 * Secondary fallback using MyMemory public translation API.
 */
async function translateViaMyMemory(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: string = 'auto'
): Promise<TranslationResult> {
  const from = sourceLang === 'auto' ? (guessLanguage(text) || 'en') : sourceLang;
  const langpair = `${from}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory API HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (data?.responseData?.translatedText) {
    return {
      translatedText: data.responseData.translatedText,
      detectedSourceLang: from
    };
  }

  throw new Error('Réponse MyMemory vide');
}

/**
 * Translates arbitrary text into the target language.
 * Safely handles chunking for very long recipe text.
 */
export async function translateText(
  text: string,
  targetLang: SupportedLanguage,
  sourceLang: string = 'auto'
): Promise<TranslationResult> {
  if (!text || !text.trim()) {
    return { translatedText: text, detectedSourceLang: sourceLang };
  }

  // If text is short or moderate (< 1500 chars), translate in single call
  if (text.length < 1500) {
    try {
      return await translateViaGoogleGTX(text, targetLang, sourceLang);
    } catch (err) {
      console.warn('Google Translate GTX failed, trying MyMemory fallback...', err);
      try {
        return await translateViaMyMemory(text, targetLang, sourceLang);
      } catch (fallbackErr) {
        console.error('All translation APIs failed:', fallbackErr);
        return { translatedText: text, detectedSourceLang: sourceLang };
      }
    }
  }

  // For long recipe texts, split by paragraphs/sections to respect URL limits
  const paragraphs = text.split(/\n\s*\n/);
  const translatedParagraphs: string[] = [];
  let detectedLang = sourceLang;

  for (const para of paragraphs) {
    if (!para.trim()) {
      translatedParagraphs.push('');
      continue;
    }
    try {
      const res = await translateViaGoogleGTX(para, targetLang, sourceLang);
      translatedParagraphs.push(res.translatedText);
      if (res.detectedSourceLang && detectedLang === 'auto') {
        detectedLang = res.detectedSourceLang;
      }
    } catch {
      try {
        const fallbackRes = await translateViaMyMemory(para, targetLang, sourceLang);
        translatedParagraphs.push(fallbackRes.translatedText);
      } catch {
        translatedParagraphs.push(para);
      }
    }
  }

  return {
    translatedText: translatedParagraphs.join('\n\n'),
    detectedSourceLang: detectedLang
  };
}

/**
 * Translates a complete Recipe object into the target language.
 * Translates title, description, ingredient names and units, instructions, and chef tip.
 */
export async function translateRecipe(
  recipe: Recipe,
  targetLang: SupportedLanguage
): Promise<Recipe> {
  // 1. Gather all texts to translate into a single batch query for fast speed
  // Format with clear separators
  const textsToTranslate: string[] = [
    recipe.title || '',
    recipe.description || '',
    recipe.chefTip || '',
    ...recipe.ingredients.map(ing => `${ing.name}${ing.unit ? ` [UNIT] ${ing.unit}` : ''}`),
    ...recipe.instructions
  ];

  const joinedText = textsToTranslate.join('\n###\n');

  try {
    const { translatedText } = await translateText(joinedText, targetLang);
    const translatedParts = translatedText.split(/\n?###\n?/).map(p => p.trim());

    const title = translatedParts[0] || recipe.title;
    const description = translatedParts[1] || recipe.description;
    const chefTip = translatedParts[2] || recipe.chefTip;

    let partCursor = 3;

    const translatedIngredients: Ingredient[] = recipe.ingredients.map((ing) => {
      const rawTranslated = translatedParts[partCursor++] || ing.name;
      if (rawTranslated.includes('[UNIT]')) {
        const [namePart, unitPart] = rawTranslated.split('[UNIT]').map(s => s.trim());
        return {
          ...ing,
          name: namePart || ing.name,
          unit: unitPart || ing.unit
        };
      }
      return {
        ...ing,
        name: rawTranslated || ing.name
      };
    });

    const translatedInstructions: string[] = recipe.instructions.map(() => {
      return translatedParts[partCursor++] || '';
    });

    // Save to persistent cache so subsequent visits require 0 API calls
    saveCachedRecipeTranslation(recipe.id, targetLang, {
      title,
      description,
      chefTip,
      ingredients: translatedIngredients.map(i => ({ id: i.id, name: i.name, unit: i.unit })),
      instructions: translatedInstructions.filter(Boolean)
    });

    return {
      ...recipe,
      title,
      description,
      chefTip,
      ingredients: translatedIngredients,
      instructions: translatedInstructions.filter(Boolean)
    };
  } catch (err) {
    console.error('Failed to translate full recipe:', err);
    return recipe;
  }
}
