# ZenMemory Governance Model

> **Status:** Aprovado | **Data:** Julho 2026 | **Escopo:** XZenPress Memory Layer

Este documento é a "Constituição" da ZenMemory. Ele define os princípios éticos, clínicos e computacionais que regem como o XZenPress aprende sobre um usuário, como ele lembra, e mais importante, como ele esquece.

## 1. Princípios Fundamentais
1. **O XZenPress não é um prontuário médico:** A IA não emite laudos definitivos, mas atua como um *Espelho Cognitivo*, ajudando o usuário a perceber padrões que ele mesmo construiu.
2. **Autonomia sobre a Própria História:** O usuário sempre tem a última palavra sobre as deduções da IA.
3. **Economia Cognitiva:** A memória não é um arquivo morto (histórico), é uma "consciência ativa". Dados sem relevância sofrem despriorização.

---

## 2. Regras de Captação e Estado da Memória

### 2.1. O Ciclo de Maturação (Personalização Progressiva)
A memória evolui rigorosamente por este caminho:
`candidate` → `hypothesis` → `evidence` → `confirmed` → `consolidated` → `archived`

### 2.2. O Que É PERMITIDO Salvar Automaticamente
*(Sem confirmação obrigatória, entra como hipótese ou evidência)*
- Preferências gerais (ex: música, horários).
- Hábitos declarados ativamente pelo usuário.
- Resultados numéricos de sessões (ex: "Avaliação 8/10").
- Percepções que o próprio usuário já confirmou.

### 2.3. O Que NECESSITA Confirmação do Usuário
*(Fica retido no estado `candidate` até que o usuário valide via UI)*
- Padrões emocionais ou comportamentais.
- Relações de causa e efeito ("A ansiedade piora seu sono").
- Interpretações psicológicas geradas pelo Mentor.

### 2.4. O Que NUNCA Deve Ser Inferido Automaticamente
*(Bloqueado no sistema de extração)*
- Diagnósticos médicos ou psiquiátricos.
- Identificação de doenças clínicas.
- Sugestão de alteração medicamentosa.
- Condições clínicas definitivas baseadas em relatos vagos.

---

## 3. O Contrato de Memória do ZenMentor

Antes do Gemini receber qualquer contexto da ZenMemory, as seguintes regras são injetadas no seu *System Prompt* para garantir a conformidade clínica:

```json
{
  "memory_usage_rules": {
    "sensitive_memory": "use_only_if_relevant_and_user_confirmed",
    "medical_claims": "never_infer_or_diagnose",
    "user_correction": "always_prioritize_and_apologize",
    "causality": "present_as_hypothesis_not_fact"
  }
}
```

---

## 4. Regras de Esquecimento e Despriorização

O "esquecimento" ocorre pela queda natural da relevância (`activation_score`), e não por exclusão.

- **Falta de Uso:** Memórias sem ativação recente caem no ranking de contexto.
- **Transição de Fase:** Se um padrão deixa de ocorrer, a memória transita para `archived`.
- **Exclusão Ativa:** O usuário pode clicar em "Isso não representa minha experiência", forçando a exclusão lógica da memória.

---

## 5. Explicabilidade (Memory Health Score)

Para evitar a degradação da IA (lembrar coisas erradas), o sistema mede a Saúde da Memória (MHS) do usuário:
- **Qualidade:** % de memórias que saíram de `candidate` para `confirmed`.
- **Atualidade:** Punição para memórias antigas que ainda tentam dominar o contexto.
- **Precisão:** Taxa de correções manuais feitas pelo usuário.
- **Utilidade:** Impacto da memória na avaliação final da Sessão Mestra.
