import { ShoppingItem } from '../types/recipe';

export interface ConsolidatedIngredient {
  key: string;
  name: string;
  totalQuantityDisplay: string;
  totalNumericQuantity: number | null;
  primaryUnit: string;
  items: ShoppingItem[];
  allChecked: boolean;
  someChecked: boolean;
  sourceRecipes: {
    title: string;
    quantity: number | null;
    unit: string;
    checked: boolean;
  }[];
}

/**
 * Normalizes an ingredient name in French to group plural/singular and case variants.
 */
export function normalizeIngredientName(rawName: string): { key: string; cleanName: string } {
  const trimmed = rawName.trim();
  let lower = trimmed.toLowerCase();

  // Normalize ligatures & accents for grouping key
  let normalizedKey = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae');

  // Strip common filler prefixes
  normalizedKey = normalizedKey
    .replace(/^(de la|du|des|de l'|de|le|la|les|un|une)\s+/i, '')
    .trim();

  // French plural normalization for common endings
  if (normalizedKey.endsWith('aux') && normalizedKey.length > 4) {
    normalizedKey = normalizedKey.slice(0, -3) + 'al';
  } else if (normalizedKey.endsWith('s') && normalizedKey.length > 3) {
    // e.g. carottes -> carotte, oignons -> oignon, pommes -> pomme, oeufs -> oeuf
    normalizedKey = normalizedKey.slice(0, -1);
  }

  // Capitalize clean display name
  const cleanName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  return { key: normalizedKey, cleanName };
}

/**
 * Normalizes units to canonical groups (mass, volume, count, etc.)
 */
function normalizeUnit(unit: string = ''): { canonical: string; factor: number; type: 'mass' | 'volume' | 'count' | 'other' } {
  const u = unit.trim().toLowerCase();

  // Mass in grams
  if (u === 'g' || u === 'gr' || u === 'gramme' || u === 'grammes') {
    return { canonical: 'g', factor: 1, type: 'mass' };
  }
  if (u === 'kg' || u === 'kilo' || u === 'kilos' || u === 'kilogramme' || u === 'kilogrammes') {
    return { canonical: 'g', factor: 1000, type: 'mass' };
  }

  // Volume in centiliters or milliliters
  if (u === 'ml' || u === 'millilitre' || u === 'millilitres') {
    return { canonical: 'ml', factor: 1, type: 'volume' };
  }
  if (u === 'cl' || u === 'centilitre' || u === 'centilitres') {
    return { canonical: 'ml', factor: 10, type: 'volume' };
  }
  if (u === 'l' || u === 'litre' || u === 'litres') {
    return { canonical: 'ml', factor: 1000, type: 'volume' };
  }

  // Spoons & pinches
  if (u === 'c. à soupe' || u === 'cas' || u === 'cuillère à soupe' || u === 'cuillères à soupe' || u === 'c. a soupe') {
    return { canonical: 'c. à soupe', factor: 1, type: 'count' };
  }
  if (u === 'c. à café' || u === 'cac' || u === 'cuillère à café' || u === 'cuillères à café' || u === 'c. a café') {
    return { canonical: 'c. à café', factor: 1, type: 'count' };
  }
  if (u === 'pincée' || u === 'pincee' || u === 'pincées') {
    return { canonical: 'pincée(s)', factor: 1, type: 'count' };
  }
  if (u === 'pièce' || u === 'piece' || u === 'pièces' || u === 'pieces' || u === 'pce' || u === '') {
    return { canonical: 'pièce(s)', factor: 1, type: 'count' };
  }
  if (u === 'botte' || u === 'bottes') {
    return { canonical: 'botte(s)', factor: 1, type: 'count' };
  }

  return { canonical: unit.trim(), factor: 1, type: 'other' };
}

/**
 * Groups and sums quantities for duplicate ingredients across all recipes.
 */
export function aggregateShoppingList(items: ShoppingItem[]): ConsolidatedIngredient[] {
  const groups: Record<string, {
    cleanName: string;
    items: ShoppingItem[];
  }> = {};

  items.forEach(item => {
    const { key, cleanName } = normalizeIngredientName(item.name);
    if (!groups[key]) {
      groups[key] = {
        cleanName,
        items: []
      };
    }
    groups[key].items.push(item);
  });

  return Object.entries(groups).map(([key, group]) => {
    const groupItems = group.items;
    const allChecked = groupItems.every(i => i.checked);
    const someChecked = groupItems.some(i => i.checked);

    // Sum quantities by unit type
    const massItems: { qtyGrams: number }[] = [];
    const volumeItems: { qtyMl: number }[] = [];
    const directUnitSums: Record<string, number> = {};
    const unquantifiedCount: number[] = [];

    groupItems.forEach(item => {
      if (item.quantity === null || item.quantity === undefined) {
        unquantifiedCount.push(1);
        return;
      }

      const { canonical, factor, type } = normalizeUnit(item.unit);

      if (type === 'mass') {
        massItems.push({ qtyGrams: item.quantity * factor });
      } else if (type === 'volume') {
        volumeItems.push({ qtyMl: item.quantity * factor });
      } else {
        const u = canonical || 'pièce(s)';
        directUnitSums[u] = (directUnitSums[u] || 0) + item.quantity;
      }
    });

    const displayParts: string[] = [];
    let primaryNumeric: number | null = null;
    let primaryUnit = '';

    // Format mass sum
    if (massItems.length > 0) {
      const totalGrams = massItems.reduce((acc, curr) => acc + curr.qtyGrams, 0);
      primaryNumeric = totalGrams;
      if (totalGrams >= 1000) {
        const kg = Math.round((totalGrams / 1000) * 10) / 10;
        displayParts.push(`${kg} kg`);
        primaryUnit = 'kg';
      } else {
        const g = Math.round(totalGrams * 10) / 10;
        displayParts.push(`${g} g`);
        primaryUnit = 'g';
      }
    }

    // Format volume sum
    if (volumeItems.length > 0) {
      const totalMl = volumeItems.reduce((acc, curr) => acc + curr.qtyMl, 0);
      if (totalMl >= 1000) {
        const l = Math.round((totalMl / 1000) * 100) / 100;
        displayParts.push(`${l} L`);
        if (!primaryUnit) primaryUnit = 'L';
      } else if (totalMl % 10 === 0 && totalMl >= 10) {
        const cl = totalMl / 10;
        displayParts.push(`${cl} cl`);
        if (!primaryUnit) primaryUnit = 'cl';
      } else {
        displayParts.push(`${totalMl} ml`);
        if (!primaryUnit) primaryUnit = 'ml';
      }
    }

    // Format other direct unit sums
    Object.entries(directUnitSums).forEach(([unitLabel, sum]) => {
      const cleanSum = Math.round(sum * 10) / 10;
      if (unitLabel === 'pièce(s)') {
        displayParts.push(`${cleanSum}`);
      } else {
        displayParts.push(`${cleanSum} ${unitLabel}`);
      }
      if (!primaryUnit) primaryUnit = unitLabel;
    });

    const totalQuantityDisplay = displayParts.join(' + ');

    // Source recipes details
    const sourceRecipes = groupItems.map(item => ({
      title: item.recipeTitle || 'Article manuel',
      quantity: item.quantity,
      unit: item.unit || '',
      checked: item.checked
    }));

    return {
      key,
      name: group.cleanName,
      totalQuantityDisplay,
      totalNumericQuantity: primaryNumeric,
      primaryUnit,
      items: groupItems,
      allChecked,
      someChecked,
      sourceRecipes
    };
  });
}
