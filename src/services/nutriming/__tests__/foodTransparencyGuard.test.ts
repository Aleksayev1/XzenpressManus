import { describe, it, expect } from 'vitest';
import { AuthenticityGuard } from '../authenticityGuard';

describe('FoodTransparencyGuard - Casos de Borda do GPT 6', () => {

  it('Caso 1: Zero lactose com alérgeno presente - Não cancelar alerta de leite nem acusar fraude', () => {
    const nome = 'Leite UHT integral zero lactose';
    const ingredientes = 'Leite integral e enzima lactase';
    
    const result = AuthenticityGuard.evaluate(nome, ingredientes);
    
    expect(result.category).toBe('dairy_milk');
    expect(result.status).toBe('standard_composition');
    expect(result.level).toBe('genuine');
    expect(result.fraudTermsFound).toHaveLength(0);
  });

  it('Caso 2: Cacau em pó 100% alcalinizado - Não tratar alcalinização como adulteração de chocolate', () => {
    const nome = 'Cacau em pó 100% alcalinizado';
    const ingredientes = 'Cacau em pó alcalinizado';
    
    const result = AuthenticityGuard.evaluate(nome, ingredientes);
    
    expect(result.category).toBe('chocolate');
    expect(result.fraudTermsFound).toHaveLength(0);
    expect(result.status).toBe('standard_composition');
  });

  it('Caso 3: Substrings e ingredientes compostos - Registrar amido modificado apenas UMA vez', () => {
    const nome = 'Mistura alimentícia sabor queijo';
    const ingredientes = 'Água, amido modificado, gordura vegetal (palma), sal e aromatizantes';
    
    const result = AuthenticityGuard.evaluate(nome, ingredientes);
    
    expect(result.category).toBe('dairy_cheese');
    expect(result.status).toBe('divergent_category');
    // Não deve contar "amido" e "amido modificado" como 2 itens duplicados
    const amidoMatches = result.fraudTermsFound.filter(t => t.includes('amido'));
    expect(amidoMatches).toHaveLength(1);
    expect(amidoMatches[0]).toBe('amido modificado');
  });

  it('Caso 4: Alegação de açúcar em néctar - Identificar categoria néctar sem acusar fraude em ácido cítrico', () => {
    const nome = 'Néctar de pêssego sem adição de açúcares';
    const ingredientes = 'Água, polpa de pêssego, acidulante ácido cítrico e edulcorante sucralose';
    
    const result = AuthenticityGuard.evaluate(nome, ingredientes);
    
    expect(result.category).toBe('juice');
    expect(result.status).toBe('divergent_category');
    expect(result.findings.some(f => f.ruleId === 'DIVERGENT_SALES_NAME')).toBe(true);
    // Ácido cítrico não deve constar como fraude
    expect(result.fraudTermsFound.includes('ácido cítrico')).toBe(false);
  });

  it('Caso 5: Blend de variedades de azeitona - Não confundir com mistura de óleos vegetais de soja', () => {
    const nome = 'Azeite de oliva extra virgem — blend Arbequina e Koroneiki';
    const ingredientes = 'Azeite de oliva extra virgem';
    
    const result = AuthenticityGuard.evaluate(nome, ingredientes);
    
    expect(result.category).toBe('olive_oil');
    expect(result.status).toBe('standard_composition');
    expect(result.fraudTermsFound).toHaveLength(0);
  });

});
