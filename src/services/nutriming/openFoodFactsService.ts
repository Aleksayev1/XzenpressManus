import { FoodProduct, DataOrigin } from '../../types/nutriming';
import { FoodNormalizer } from './foodNormalizer';

const CACHE_PREFIX = 'xzen_off_cache_';
const CUSTOM_BARCODES_KEY = 'xzen_custom_user_barcodes';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 dias de cache local persistente

// Catálogo de despensa nacional pré-semeado (EAN-13 comuns no Brasil)
const BRAZILIAN_PANTRY_PRESETS: Record<string, { name: string; brand: string; calories?: number; carbs?: number; protein?: number; fat?: number }> = {
  '7891000100103': { name: 'Leite em Pó Integral Ninho', brand: 'Nestlé', calories: 497, carbs: 38, protein: 26, fat: 27 },
  '7896005800107': { name: 'Café Torrado e Moído Tradicional', brand: 'Pilão', calories: 2, carbs: 0, protein: 0, fat: 0 },
  '7891000053508': { name: 'Achocolatado em Pó Nescau 2.0', brand: 'Nestlé', calories: 375, carbs: 85, protein: 3.5, fat: 2.7 },
  '7896006700017': { name: 'Arroz Branco Polido Tipo 1', brand: 'Tio João', calories: 358, carbs: 79, protein: 7.2, fat: 0.6 },
  '7896004000102': { name: 'Feijão Carioca Tipo 1', brand: 'Camil', calories: 337, carbs: 60, protein: 22, fat: 1.4 },
  '7891025101239': { name: 'Azeite de Oliva Extra Virgem', brand: 'Gallo', calories: 824, carbs: 0, protein: 0, fat: 92 },
  '7896005200013': { name: 'Farinha de Trigo Tradicional', brand: 'Dona Benta', calories: 360, carbs: 75, protein: 10, fat: 1.5 },
  '7891000315507': { name: 'Biscoito Recheado Passatempo Chocolate', brand: 'Nestlé', calories: 450, carbs: 71, protein: 6.8, fat: 15 },
  '7898024394181': { name: 'Goma de Mandioca Hidratada para Tapioca', brand: 'Da Terrinha', calories: 240, carbs: 60, protein: 0, fat: 0 },
  '7891079001028': { name: 'Iogurte Natural Integral', brand: 'Nestlé', calories: 62, carbs: 4.7, protein: 3.4, fat: 3.2 },
  '7896005801234': { name: 'Café Solúvel Tradicional', brand: 'Nescafé', calories: 2, carbs: 0.4, protein: 0.2, fat: 0 },
  '7891000244104': { name: 'Aveia em Flocos Finos', brand: 'Quaker', calories: 367, carbs: 57, protein: 14, fat: 8 }
};

export class OpenFoodFactsService {
  private static memoryCache = new Map<string, { product: FoodProduct; timestamp: number }>();

  /**
   * Registra manualmente um produto para um código de barras.
   * Fica salvo no cache local permanente e nunca mais solicita redigitação.
   */
  public static registerCustomBarcode(barcode: string, productName: string, extras?: Partial<FoodProduct>): FoodProduct {
    const cleanBarcode = barcode.trim();
    const cleanName = productName.trim();

    const normalizedProduct = FoodNormalizer.createCustomOrAiProduct(cleanBarcode, cleanName, extras);
    const cacheEntry = { product: normalizedProduct, timestamp: Date.now() };

    // 1. Grava em memória
    this.memoryCache.set(cleanBarcode, cacheEntry);

    // 2. Grava em localStorage persistente
    try {
      localStorage.setItem(`${CACHE_PREFIX}${cleanBarcode}`, JSON.stringify(cacheEntry));
      
      const customListRaw = localStorage.getItem(CUSTOM_BARCODES_KEY) || '{}';
      const customList = JSON.parse(customListRaw);
      customList[cleanBarcode] = cleanName;
      localStorage.setItem(CUSTOM_BARCODES_KEY, JSON.stringify(customList));
      console.log(`✅ [OpenFoodFactsService] Barcode ${cleanBarcode} registrado com sucesso como "${cleanName}".`);
    } catch (e) {
      console.warn('[OpenFoodFactsService] Erro ao persistir custom barcode:', e);
    }

    return normalizedProduct;
  }

  /**
   * Busca um produto por código de barras com cache determinístico e múltiplos fallbacks.
   */
  public static async getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return null;

    // 1. Checar cache em memória (0ms)
    const mem = this.memoryCache.get(cleanBarcode);
    if (mem && (Date.now() - mem.timestamp < CACHE_TTL_MS)) {
      return mem.product;
    }

    // 2. Checar cache em localStorage
    try {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${cleanBarcode}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          this.memoryCache.set(cleanBarcode, parsed);
          return parsed.product;
        }
      }
      // Checar também catálogo personalizado do usuário (xzen_custom_user_barcodes)
      const customListRaw = localStorage.getItem(CUSTOM_BARCODES_KEY);
      if (customListRaw) {
        const customList = JSON.parse(customListRaw);
        if (customList[cleanBarcode]) {
          const product = FoodNormalizer.createCustomOrAiProduct(cleanBarcode, customList[cleanBarcode]);
          return product;
        }
      }
    } catch {
      // Ignora falhas de localStorage
    }

    // 3. Checar presets da despensa brasileira nacional (resolução instantânea)
    const preset = BRAZILIAN_PANTRY_PRESETS[cleanBarcode];
    if (preset) {
      const product = FoodNormalizer.createCustomOrAiProduct(cleanBarcode, preset.name, {
        brand: preset.brand,
        labelFacts: {
          allergens: [],
          nutritionPer100g: {
            energyKcal: preset.calories,
            carbs: preset.carbs,
            protein: preset.protein,
            fat: preset.fat
          }
        }
      });
      const cacheEntry = { product, timestamp: Date.now() };
      this.memoryCache.set(cleanBarcode, cacheEntry);
      try {
        localStorage.setItem(`${CACHE_PREFIX}${cleanBarcode}`, JSON.stringify(cacheEntry));
      } catch {}
      return product;
    }

    // 4. Buscar nas APIs da Open Food Facts (primeiro portal brasileiro br., depois global world.)
    const urls = [
      `https://br.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`,
      `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout por rota

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'XZenPress-Wellness - Web/Mobile - v2.6.0 (contact@xzenpress.com)',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (json.status === 1 && json.product) {
            // Normalizar usando o normalizador do XZenPress
            const normalizedProduct = FoodNormalizer.normalizeOpenFoodFacts(json.product, cleanBarcode);

            // Salvar em cache
            const cacheEntry = { product: normalizedProduct, timestamp: Date.now() };
            this.memoryCache.set(cleanBarcode, cacheEntry);
            try {
              localStorage.setItem(`${CACHE_PREFIX}${cleanBarcode}`, JSON.stringify(cacheEntry));
            } catch {}

            return normalizedProduct;
          }
        }
      } catch (err) {
        // Continua para o próximo endpoint
      }
    }

    return null;
  }

  /**
   * Retorna lista de todos os códigos personalizados salvos pelo usuário neste dispositivo.
   */
  public static getCustomBarcodes(): Record<string, string> {
    try {
      const raw = localStorage.getItem(CUSTOM_BARCODES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
