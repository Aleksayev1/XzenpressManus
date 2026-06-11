# INSTRUÇÕES CRÍTICAS DE PRESERVAÇÃO DA BASE DE CONHECIMENTO (SELF ORACLE)
========================================================================

ESTE DIRETÓRIO CONTÉM A PROPRIEDADE INTELECTUAL E O NÚCLEO DE CONHECIMENTO DO SELF ORACLE V3.0 (XZENPRESS).

## ⚠️ AVISO PARA DESENVOLVEDORES E ASSISTENTES DE IA
NUNCA simplifique, substitua ou delete os dados estruturados em `knowledge.js`. Esta base foi cuidadosamente construída e expandida a partir de metafísica avançada, psicodinâmica e ciência molecular.

Qualquer alteração neste diretório deve seguir rigorosamente as regras abaixo:

### 1. ESTRUTURA DO POOL DE CONHECIMENTO (knowledge.js)
Este arquivo exporta as seguintes variáveis estruturadas que alimentam o Self Oracle:
*   `VALCAPELLI_AXIOMS`: Atualmente com 17 condições de metafísica da saúde (incluindo pâncreas/diabetes, câncer geral, artrite/artrose, bexiga, e doenças autoimunes).
*   `KWITKO_PATTERNS`: Atualmente com 9 padrões cármicos e comportamentais de vida (incluindo Fugitivo, Perfeccionista, Ruminador e Doador Excessivo).
*   `REFORMA_VIRTUES`: 8 pares de vícios morais e virtudes correspondentes da Reforma Íntima.
*   `YNSA_POINTS_REFERENCE`: Referência de mapeamento de pontos de Yamamoto (YNSA) com indicações e regras de lateralidade.
*   `SPECIFIC_PROTOCOLS`: Protocolos clínicos específicos de override (como Neuropatia Diabética, Herpes Zoster, Ansiedade, Hipertensão, Depressão, Luto, etc.).
*   `LECTURE_KNOWLEDGE`: Conceitos extraídos de palestras do YouTube (Fluxo P.E.S.A.R., Perdão Antecipado, Lacunas na Aura, Masaru Emoto, Ordem Cósmica).
*   `EPIGENETICS_SCIENCE`: Base de dados científica sobre epigenética (Dogma central, biologia do estresse, neuropeptídeos, membrana celular, coerência cardíaca, telômeros).

### 2. COMPATIBILIDADE DO PROMPT (ai-chat.js)
A Netlify Function em `netlify/functions/ai-chat.js` DEVE sempre:
1.  Importar todas as variáveis acima desestruturadas do require:
    `const { VALCAPELLI_AXIOMS, KWITKO_PATTERNS, REFORMA_VIRTUES, YNSA_POINTS_REFERENCE, SPECIFIC_PROTOCOLS, LECTURE_KNOWLEDGE, EPIGENETICS_SCIENCE } = require('./lib/knowledge');`
2.  Injetar cada uma delas via `JSON.stringify(VARIÁVEL, null, 2)` dentro do `systemPrompt`.

### 3. PROCEDIMENTO PARA ATUALIZAÇÕES
Se precisar adicionar novas condições ou novos conhecimentos:
*   **Adicione**, nunca remova ou substitua dados existentes.
*   Faça backups frequentes deste diretório antes de rodar comandos de git merge agressivos.
*   Em caso de conflito de merge no Git, dê preferência para a preservação das expansões feitas em `knowledge.js` e a injeção em `ai-chat.js`.
