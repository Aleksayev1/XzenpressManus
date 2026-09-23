import { FoodProduct, DataOrigin } from '../../types/nutriming';
import { FoodNormalizer } from './foodNormalizer';

const CACHE_PREFIX = 'xzen_off_cache_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias de cache local

export class OpenFoodFactsService {
  private static memoryCache = new Map<string, { product: FoodProduct; timestamp: number }>();

  /**
   * Busca um produto por código de barras com cache determinístico.
   */
  public static async getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return null;

    // 1. Checar cache em memória
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
    } catch {
      // Ignora falhas de localStorage (ex: modo anônimo estrito)
    }

    // 3. Buscar na API oficial da Open Food Facts
    try {
      const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'XZenPress-Wellness - Web/Mobile - v2.6.0 (contact@xzenpress.com)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      if (json.status !== 1 || !json.product) {
        return null;
      }

      // 4. Normalizar usando o normalizador do XZenPress
      const normalizedProduct = FoodNormalizer.normalizeOpenFoodFacts(json.product, cleanBarcode);

      // Salvar em cache
      const cacheEntry = { product: normalizedProduct, timestamp: Date.now() };
      this.memoryCache.set(cleanBarcode, cacheEntry);
      try {
        localStorage.setItem(`${CACHE_PREFIX}${cleanBarcode}`, JSON.stringify(cacheEntry));
      } catch {
        // Fallback silencioso se cota de storage exceder
      }

      return normalizedProduct;
    } catch (err) {
      console.warn('[OpenFoodFactsService] Erro ao buscar produto:', err);
      return null;
    }
  }
}
