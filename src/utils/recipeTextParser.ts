import { RecipeCategory, Difficulty, NutritionMacros } from '../types/recipe';
import { SupportedLanguage } from '../types/i18n';

export interface ParsedRecipeDraft {
  title: string;
  category: RecipeCategory;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  calories?: number;
  macros?: NutritionMacros;
  imageUrl?: string;
  ingredients: { id: string; name: string; quantity: string; unit: string }[];
  instructions: string[];
  chefTip?: string;
  sourceUrl?: string;
}

export const SAMPLE_RECIPES_TEXT: Record<SupportedLanguage, string> = {
  fr: `🌽 WRAP PROTÉINÉ MAÏS 🌯

INGRÉDIENTS

- 🌽 285g de maïs
- 🍖 140g de jambon
- 🧀 100g de mozzarella
- 🥚 2 œufs
- 🧀 50g de Carré Frais 0%
- 🥬 Salade
- 🍅 Tomate
- 🌶️ Paprika
- 🧅 Oignon en poudre

📊 Macros totales estimées (recette entière) 

→ 880 kcal / 79g de prot / 39g de glucides / 35g de lipides

📊 Macros pour 1 portion (2 au total) :

→ 440 kcal / 39,5 g de prot / 19,5 g de glucides / 17,5 g de lipides 

#nutrition #protein #mangersain #recettesimple #wrap

https://www.instagram.com/reel/De4sVktxqbW/?obrf=MXB1bWczbnY0bzZkdA==`,

  en: `🌽 PROTEIN SWEET CORN WRAP 🌯

INGREDIENTS

- 🌽 285g sweet corn
- 🍖 140g lean ham
- 🧀 100g shredded mozzarella
- 🥚 2 eggs
- 🧀 50g light cream cheese
- 🥬 Crisp lettuce
- 🍅 Fresh tomato
- 🌶️ Smoked paprika
- 🧅 Onion powder

📊 Total estimated macros (whole recipe)

→ 880 kcal / 79g protein / 39g carbs / 35g fat

📊 Macros per 1 serving (2 total servings):

→ 440 kcal / 39.5g protein / 19.5g carbs / 17.5g fat

#nutrition #protein #healthyfood #easyrecipe #wrap

https://www.instagram.com/reel/De4sVktxqbW/?obrf=MXB1bWczbnY0bzZkdA==`,

  es: `🌽 WRAP PROTEICO DE MAÍZ 🌯

INGREDIENTES

- 🌽 285g de maíz dulce
- 🍖 140g de jamón cocido
- 🧀 100g de mozzarella rallada
- 🥚 2 huevos
- 🧀 50g de queso crema ligero
- 🥬 Lechuga crujiente
- 🍅 Tomate en rodajas
- 🌶️ Pimentón dulce
- 🧅 Cebolla en polvo

📊 Macros totales estimados (receta completa)

→ 880 kcal / 79g proteínas / 39g carbohidratos / 35g grasas

📊 Macros por 1 ración (2 raciones en total):

→ 440 kcal / 39,5 g de proteínas / 19,5 g de carbohidratos / 17,5 g de grasas

#nutricion #proteina #comidasana #recetafacil #wrap

https://www.instagram.com/reel/De4sVktxqbW/?obrf=MXB1bWczbnY0bzZkdA==`
};

/**
 * Clean emojis, leading symbols and bullets from a string.
 */
export function stripEmojisAndBullets(str: string): string {
  return str
    .replace(/^[\s\-•*+→>▶️🔹🔸▪️▫️]+\s*/, '')
    .replace(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[\s\-•*+→>]+$/, '')
    .trim();
}

/**
 * Convert ALL CAPS string to elegant Title Case.
 */
export function toTitleCase(str: string): string {
  const words = str.toLowerCase().split(' ');
  return words
    .map((w, index) => {
      const minorWords = ['de', 'du', 'des', 'le', 'la', 'les', 'au', 'aux', 'et', 'à', 'en', 'pour', 'd’', "d'", 'of', 'and', 'the', 'in', 'for', 'con', 'del', 'para'];
      if (index > 0 && minorWords.includes(w)) {
        return w;
      }
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ');
}

/**
 * Parses a single ingredient text line into { name, quantity, unit }.
 * Handles French, English, and Spanish units and expressions.
 */
export function parseIngredientLine(line: string): { name: string; quantity: string; unit: string } {
  let cleaned = line.trim();

  // Strip leading bullet or arrow
  cleaned = cleaned.replace(/^[\s\-•*+→>▶️]+\s*/, '');

  // Regex matching: (number) (unit?) (prep preposition?) (name)
  // Supports FR (g, ml, c. à soupe...), EN (tbsp, tsp, cups, oz, lbs...), ES (cucharadas, tazas, pizca...)
  const unitPatterns = [
    'g', 'gr', 'gramos', 'grams', 'kg', 'kilos',
    'ml', 'cl', 'dl', 'l', 'litres', 'liters', 'litros',
    'c\\.\\s*à\\s*(?:soupe|café)', 'cas', 'cac', 'cuillères?\\s*à\\s*(?:soupe|café)', 'cuillères?',
    'tbsp', 'tablespoons?', 'tsp', 'teaspoons?',
    'cucharadas?', 'cucharaditas?', 'cda', 'cdta',
    'cups?', 'tasses?', 'tazas?',
    'ounces?', 'oz', 'pounds?', 'lbs?',
    'tranches?', 'slices?', 'rebanadas?',
    'pincées?', 'pinch(?:es)?', 'pizcas?',
    'pots?', 'pavés?', 'filets?', 'feuilles?', 'leaves?', 'hojas?',
    'gousses?', 'cloves?', 'dientes?',
    'sachets?', 'packets?', 'morceaux?', 'pieces?', 'pièces?', 'piezas?',
    'boîtes?', 'cans?', 'tins?', 'latas?'
  ].join('|');

  const prepPrepositions = '(?:de\\s+la|du|des|de\\s+l\'|d\'|de|of\\s+the|of|del?|para)?';

  const regex = new RegExp(`^(\\d+[\\d.,]*)\\s*(${unitPatterns})?\\s*${prepPrepositions}\\s*(.+)$`, 'i');

  const match = cleaned.match(regex);

  if (match) {
    const rawQty = match[1].replace(',', '.');
    const rawUnit = match[2] ? match[2].trim() : '';
    let rawName = match[3] ? match[3].trim() : '';

    rawName = rawName.replace(/^(?:de\s+la|du|des|de\s+l'|d'|de|of\s+the|of|del?|para)\s+/i, '').trim();

    // Special unit normalization for eggs when unit is empty: e.g. "2 œufs" / "2 eggs" / "2 huevos"
    if (!rawUnit && /^œufs?|^oeufs?|^eggs?|^huevos?/i.test(rawName)) {
      return {
        quantity: rawQty,
        unit: 'pièces',
        name: rawName.charAt(0).toUpperCase() + rawName.slice(1)
      };
    }

    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    return {
      quantity: rawQty,
      unit: rawUnit,
      name: formattedName
    };
  }

  // Count match: e.g. "2 œufs", "3 bananas", "2 huevos"
  const countMatch = cleaned.match(/^(\d+[\d.,]*)\s+([a-zA-ZÀ-ÿ\s0-9%]+)$/);
  if (countMatch) {
    const rawQty = countMatch[1].replace(',', '.');
    const rawName = countMatch[2].trim();
    if (/^œufs?|^oeufs?|^eggs?|^huevos?/i.test(rawName)) {
      return {
        quantity: rawQty,
        unit: 'pièces',
        name: rawName.charAt(0).toUpperCase() + rawName.slice(1)
      };
    }
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    return {
      quantity: rawQty,
      unit: '',
      name: formattedName
    };
  }

  // No number detected: e.g. "Salade", "Lettuce", "Tomate"
  let nameWithoutPrefix = cleaned.replace(/^(?:de\s+la|du|des|de\s+l'|d'|de|of\s+the|of|del?|un\s+peu\s+de|some)\s+/i, '').trim();
  const formattedName = nameWithoutPrefix.charAt(0).toUpperCase() + nameWithoutPrefix.slice(1);

  return {
    quantity: '',
    unit: '',
    name: formattedName
  };
}

/**
 * Intelligent parser for unstructured recipe text from Instagram, TikTok, websites, or notes.
 * Multilingual support: French, English, Spanish.
 */
export function parseRecipeText(rawText: string, targetLanguage: SupportedLanguage = 'fr'): ParsedRecipeDraft {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      title: targetLanguage === 'en' ? 'New Recipe' : targetLanguage === 'es' ? 'Nueva Receta' : 'Nouvelle recette',
      category: 'plats',
      description: '',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      difficulty: 'Facile',
      ingredients: [{ id: '1', name: '', quantity: '', unit: '' }],
      instructions: ['']
    };
  }

  // 1. Detect Source URL and Image URL
  let sourceUrl: string | undefined;
  let imageUrl: string | undefined;

  const urlMatches = rawText.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches) {
    for (const url of urlMatches) {
      if (/\.(jpg|jpeg|png|webp|avif)(\?.*)?$/i.test(url)) {
        if (!imageUrl) imageUrl = url;
      } else {
        if (!sourceUrl) sourceUrl = url;
      }
    }
  }

  // 2. Detect Title
  let title = '';
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    if (/^(ingrédient|ingredients|ingredientes|preparation|préparation|preparación|instructions|directions|etapes|étapes|pasos|macros|http)/i.test(line)) {
      continue;
    }
    const cleaned = stripEmojisAndBullets(line);
    if (cleaned.length >= 3) {
      if (cleaned === cleaned.toUpperCase() && cleaned.length > 4) {
        title = toTitleCase(cleaned);
      } else {
        title = cleaned;
      }
      break;
    }
  }
  if (!title) {
    title = targetLanguage === 'en' ? 'Delicious Recipe' : targetLanguage === 'es' ? 'Receta Sabrosa' : 'Recette Gourmande';
  }

  // 3. Detect Servings (portions, persons, servings, raciones)
  let servings = 2; // sensible default
  const servingsTotalMatch = rawText.match(/\((\d+)\s*(?:au total|portions?|pers|servings?|raciones|total)\)/i);
  if (servingsTotalMatch) {
    servings = parseInt(servingsTotalMatch[1], 10);
  } else {
    const servingsAltMatch = rawText.match(/(?:pour|donne|donnent|recette pour|serves|servings|yields|para|porciones|raciones)\s*(\d+)\s*(?:personnes?|portions?|pers|people|raciones)?/i)
      || rawText.match(/(\d+)\s*(?:personnes?|portions?|pers\.?|servings?|raciones)\b/i);
    if (servingsAltMatch) {
      servings = parseInt(servingsAltMatch[1], 10);
    }
  }

  // 4. Detect Calories & Macronutrients (per portion)
  let calories: number | undefined;
  let proteins: number | undefined;
  let carbs: number | undefined;
  let fats: number | undefined;

  // Search in "Macros pour 1 portion" / "per serving" / "por ración"
  const portionSectionMatch = rawText.match(/(?:pour 1 portion|par portion|par part|pour une portion|per serving|for 1 serving|por ración|por porción)[^]*?(?:\n\n|\n[#A-Z]|$)/i);
  const portionContext = portionSectionMatch ? portionSectionMatch[0] : rawText;

  // Calories
  const calMatch = portionContext.match(/(\d+[\d\s,.]*)\s*(?:kcal|calories|calorías)/i)
    || rawText.match(/(\d+[\d\s,.]*)\s*(?:kcal|calories|calorías)/i);
  if (calMatch) {
    const val = parseFloat(calMatch[1].replace(/\s/g, '').replace(',', '.'));
    if (portionSectionMatch) {
      calories = Math.round(val);
    } else if (rawText.toLowerCase().match(/(totale?|total)/) && servings > 1) {
      calories = Math.round(val / servings);
    } else {
      calories = Math.round(val);
    }
  }

  // Proteins
  const protMatch = portionContext.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:protéines?|proteines?|protein|proteínas?|prot)\b/i)
    || rawText.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:protéines?|proteines?|protein|proteínas?|prot)\b/i);
  if (protMatch) {
    const val = parseFloat(protMatch[1].replace(/\s/g, '').replace(',', '.'));
    proteins = portionSectionMatch ? val : (rawText.toLowerCase().match(/(totale?|total)/) && servings > 1 ? Math.round((val / servings) * 10) / 10 : val);
  }

  // Carbs / Glucides
  const carbMatch = portionContext.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:glucides?|carbs?|carbohydrates?|hidratos|carbohidratos)\b/i)
    || rawText.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:glucides?|carbs?|carbohydrates?|hidratos|carbohidratos)\b/i);
  if (carbMatch) {
    const val = parseFloat(carbMatch[1].replace(/\s/g, '').replace(',', '.'));
    carbs = portionSectionMatch ? val : (rawText.toLowerCase().match(/(totale?|total)/) && servings > 1 ? Math.round((val / servings) * 10) / 10 : val);
  }

  // Fats / Lipides
  const fatMatch = portionContext.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:lipides?|fat|fats|grasas?)\b/i)
    || rawText.match(/(\d+[\d\s,.]*)\s*(?:g\s*(?:de\s*)?)?(?:lipides?|fat|fats|grasas?)\b/i);
  if (fatMatch) {
    const val = parseFloat(fatMatch[1].replace(/\s/g, '').replace(',', '.'));
    fats = portionSectionMatch ? val : (rawText.toLowerCase().match(/(totale?|total)/) && servings > 1 ? Math.round((val / servings) * 10) / 10 : val);
  }

  // 5. Detect Prep & Cook Times
  let prepTime = 15;
  let cookTime = 10;
  const prepMatch = rawText.match(/(?:prép|préparation|prep|preparación)\s*[:\-]?\s*(\d+)\s*(?:min|minutes|minutos)/i);
  if (prepMatch) prepTime = parseInt(prepMatch[1], 10);
  const cookMatch = rawText.match(/(?:cuisson|cook|cooking|cocción)\s*[:\-]?\s*(\d+)\s*(?:min|minutes|minutos)/i);
  if (cookMatch) cookTime = parseInt(cookMatch[1], 10);

  // 6. Detect Category
  let category: RecipeCategory = 'plats';
  const lowerAll = rawText.toLowerCase();
  if (lowerAll.includes('wrap') || lowerAll.includes('express') || lowerAll.includes('rapide') || lowerAll.includes('quick') || lowerAll.includes('rápido') || (prepTime + cookTime <= 25)) {
    category = 'rapide';
  } else if (lowerAll.includes('dessert') || lowerAll.includes('gâteau') || lowerAll.includes('chocolat') || lowerAll.includes('tarte') || lowerAll.includes('cake') || lowerAll.includes('cookie') || lowerAll.includes('postre')) {
    category = 'desserts';
  } else if (lowerAll.includes('entrée') || lowerAll.includes('entree') || lowerAll.includes('soupe') || lowerAll.includes('velouté') || lowerAll.includes('salade') || lowerAll.includes('salad') || lowerAll.includes('starter') || lowerAll.includes('ensalada')) {
    category = 'entrees';
  } else if (lowerAll.includes('apéro') || lowerAll.includes('apéritif') || lowerAll.includes('tartinade') || lowerAll.includes('dip') || lowerAll.includes('appetizer') || lowerAll.includes('tapa')) {
    category = 'aperitifs';
  } else if (lowerAll.includes('végétarien') || lowerAll.includes('veggie') || lowerAll.includes('sans viande') || lowerAll.includes('vegetarian') || lowerAll.includes('vegetariano')) {
    category = 'vegetarien';
  }

  // 7. Parse Ingredients & Instructions
  const parsedIngredients: { id: string; name: string; quantity: string; unit: string }[] = [];
  let inIngredientsSection = false;
  let inInstructionsSection = false;

  const rawInstructions: string[] = [];
  const macrosLines: string[] = [];

  for (const line of lines) {
    const cleanLine = line.trim();

    if (/^#*(?:ingrédient|ingredients|ingredientes|pour la recette|for the recipe|para la receta)/i.test(cleanLine)) {
      inIngredientsSection = true;
      inInstructionsSection = false;
      continue;
    }
    if (/^#*(?:préparation|preparation|instructions|étapes|etapes|recette|comment faire|directions|method|pasos|elaboración)/i.test(cleanLine)) {
      inIngredientsSection = false;
      inInstructionsSection = true;
      continue;
    }
    if (/^#*(?:macros|valeurs nutritionnelles|calories|nutrition|nutrition facts|datos nutricionales)/i.test(cleanLine)) {
      inIngredientsSection = false;
      inInstructionsSection = false;
      macrosLines.push(cleanLine);
      continue;
    }

    if (cleanLine.startsWith('#')) {
      continue;
    }

    if (cleanLine.toLowerCase().includes('kcal') || cleanLine.toLowerCase().includes('prot') || cleanLine.toLowerCase().includes('glucides') || cleanLine.toLowerCase().includes('carbs')) {
      const strippedMacro = stripEmojisAndBullets(cleanLine);
      if (strippedMacro) macrosLines.push(strippedMacro);
      continue;
    }

    if (cleanLine.startsWith('http')) {
      continue;
    }

    const hasBullet = /^[\-•*+→>▶️]/.test(cleanLine) || /[\p{Extended_Pictographic}]/u.test(cleanLine);

    if (inInstructionsSection) {
      const stepText = stripEmojisAndBullets(cleanLine).replace(/^\d+[\.\)]\s*/, '');
      if (stepText.length > 4) {
        rawInstructions.push(stepText);
      }
    } else if (inIngredientsSection || hasBullet) {
      const stripped = stripEmojisAndBullets(cleanLine);
      if (stripped.length > 1 && !stripped.toLowerCase().startsWith('macro') && !stripped.toLowerCase().startsWith('portion') && !stripped.toLowerCase().startsWith('serving')) {
        const parsedIng = parseIngredientLine(stripped);
        if (parsedIng && parsedIng.name) {
          parsedIngredients.push({
            id: `ing_auto_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...parsedIng
          });
        }
      }
    }
  }

  const uniqueIngredients: typeof parsedIngredients = [];
  const seenNames = new Set<string>();
  parsedIngredients.forEach((ing) => {
    const norm = ing.name.toLowerCase();
    if (!seenNames.has(norm)) {
      seenNames.add(norm);
      uniqueIngredients.push(ing);
    }
  });

  let finalInstructions = rawInstructions;
  if (finalInstructions.length === 0) {
    if (targetLanguage === 'en') {
      finalInstructions = [
        'Weigh and prepare all required ingredients.',
        'Cook and assemble the dish according to steps.',
        'Season to taste and serve warm.'
      ];
    } else if (targetLanguage === 'es') {
      finalInstructions = [
        'Pesar y preparar todos los ingredientes necesarios.',
        'Cocinar y montar el plato siguiendo los pasos.',
        'Sazonar al gusto y servir recién hecho.'
      ];
    } else {
      finalInstructions = [
        'Peser et rassembler l’ensemble des ingrédients nécessaires.',
        'Procéder à la découpe et à la cuisson des ingrédients selon la recette.',
        'Assaisonner, dresser joliment et déguster chaud ou tiède.'
      ];
    }
  }

  let chefTip = '';
  if (macrosLines.length > 0) {
    chefTip = macrosLines.filter(Boolean).join(' · ');
  }

  const description = sourceUrl
    ? (targetLanguage === 'en'
        ? `Imported recipe from web (${sourceUrl.replace(/^https?:\/\/(?:www\.)?/, '').slice(0, 35)}...).`
        : targetLanguage === 'es'
        ? `Receta importada de la web (${sourceUrl.replace(/^https?:\/\/(?:www\.)?/, '').slice(0, 35)}...).`
        : `Recette importée depuis le web (${sourceUrl.replace(/^https?:\/\/(?:www\.)?/, '').slice(0, 35)}...).`)
    : (targetLanguage === 'en'
        ? `A tasty, healthy and quick recipe (${calories ? calories + ' kcal/serving' : 'balanced'}).`
        : targetLanguage === 'es'
        ? `Una receta deliciosa, sana y rápida (${calories ? calories + ' kcal/ración' : 'equilibrada'}).`
        : `Une savoureuse recette saine et rapide (${calories ? calories + ' kcal/portion' : 'équilibrée'}).`);

  const macros: NutritionMacros = {
    calories,
    proteins,
    carbs,
    fats
  };

  return {
    title,
    category,
    description,
    prepTime,
    cookTime,
    servings,
    difficulty: 'Facile',
    calories,
    macros,
    imageUrl,
    ingredients: uniqueIngredients.length > 0
      ? uniqueIngredients
      : [{ id: '1', name: '', quantity: '', unit: '' }],
    instructions: finalInstructions,
    chefTip: chefTip || undefined,
    sourceUrl
  };
}
