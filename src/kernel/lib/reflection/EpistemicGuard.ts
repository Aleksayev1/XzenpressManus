import { ReflectionContext, GuardResult, GuardViolation, GuardTelemetryEvent, GuardLayer } from '../../types/reflection';
import { randomUUID } from 'crypto';
import { hashOutput } from './TelemetryUtils';
export interface GuardInput {
  readonly llmOutputText: string | string[];
  readonly context: ReflectionContext;
}

interface GuardRules {
  // Layer 0
  layer0_provenance: RegExp;
  layer0_invented_evidence: RegExp;
  // Layer 1
  layer1_structural: RegExp;
  layer1_allowedAction: RegExp;
  // Layer 2 (original)
  layer2_epistemic: RegExp;
  layer2_aggregation: RegExp;
  layer2_aggregation_alt: RegExp;
  // Layer 3
  layer3_lexical: string[];
  layer3_teleology_verbs: string[]; // S14-C: Teleologia (sinônimos de "evolução" como verbos)
  // Layer 4 (original)
  layer4_semantic: RegExp;
  layer4_temporal: RegExp;
  layer4_invalidation: RegExp;
  // Layer 4 (S14-C: Novos Vetores Constitucionais)
  layer4_identity_direct: RegExp;       // "Você é X" / "Sua essência é"
  layer4_identity_conditional: RegExp;  // "Talvez você seja / pareça X"
  layer4_teleology_pattern: RegExp;     // "está se tornando / você finalmente encontrou"
  layer4_causality_new: RegExp;         // "produziu / despertou / fez você descobrir"
  layer4_discovery: RegExp;             // "Entendi / ficou claro para mim / consegui identificar"
  layer4_persuasion: RegExp;            // "em breve você perceberá / vai perceber logo"
  layer4_evidence_escalation: RegExp;   // "seus registros confirmam / podemos concluir"
  // Layer 5
  fallbackTemplate: (humanText: string) => string;
}

// ─── Negation / Citation Context Guard ───────────────────────────────────────
// Detects if the pattern is inside a quotation ("...") or a negation clause
// ("o sistema não deve dizer", "evite dizer", "não pode falar").
// If so, we skip the violation (it's a mention, not a use).
const NEGATION_CONTEXT_PT = /(?:não deve(?:ria)? (?:dizer|afirmar|usar)|evite? dizer|não pode(?:ria)? (?:dizer|afirmar)|o sistema não|a ia não)/i;
const NEGATION_CONTEXT_EN = /(?:should not say|must not say|avoid saying|cannot say|the system should not|the ai must not)/i;
const QUOTATION_WRAP = /[""]([^""]+)[""]/g;

function isQuotedOrNegated(text: string, matchedSnippet: string, locale: string): boolean {
  if (!matchedSnippet) return false;
  
  // Check if the matched snippet is inside quotation marks
  let m;
  while ((m = QUOTATION_WRAP.exec(text)) !== null) {
    if (m[1].toLowerCase().includes(matchedSnippet.toLowerCase())) return true;
  }
  QUOTATION_WRAP.lastIndex = 0;
  // Check if there's a negation context earlier in the same sentence
  const sentences = text.split(/[.!?]/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(matchedSnippet.toLowerCase())) {
      const neg = locale === 'en-US' ? NEGATION_CONTEXT_EN : NEGATION_CONTEXT_PT;
      if (neg.test(sentence)) return true;
    }
  }
  return false;
}

// ─── Rules: PT-BR ─────────────────────────────────────────────────────────────
const RULES_PT_BR: GuardRules = {
  layer0_provenance: /(^|\s)(eu refleti|eu percebi|meu diário|eu notei)(\s|$|[.,])/i,
  layer0_invented_evidence: /evento de ontem/i,
  layer1_structural: /(\[system alert\]|```json)/i,
  layer1_allowedAction: /(allowedaction|allowed action)/i,
  layer2_epistemic: /(causou|causalidade|diagnosticou|motivo do seu|aconselho)/i,
  layer2_aggregation: /(está provado|prova que)/i,
  layer2_aggregation_alt: /(está provado)/i,
  layer3_lexical: ['evolu', 'progresso', 'personalidade', 'amadureciment', 'cresciment', 'maturidad', 'empatia', 'solidariedad', 'caridoso'],
  layer3_teleology_verbs: ['floresceu', 'despertou', 'expandiu', 'transformou', 'renasceu', 'amadureceu', 'germinan', 'germin'],
  layer4_semantic: /(torna(m)? claro que|fica evidente|prova que)/i,
  layer4_temporal: /(melhor agora|piora na sua|piorou)/i,
  layer4_invalidation: /(você disse que.*mas os dados mostram|embora você não tenha notado)/i,
  // S14-C
  // S14-C & S14-D
  layer4_identity_direct: /(você (é|age de forma).{0,30}(pessoa |\w+ista|compassivo|generoso|altruísta|caridoso)|sua (essência|natureza|alma|disposição|inclinação) (é|representa|focada|parece ser)|uma disposição \S+ parece|você (nasceu para|tem uma alma|representa quem)|comportamento de alguém com|semente de propósito)/i,
  layer4_identity_conditional: /(talvez você (seja|pareça)|você parece ser|pode ser que você|posso estar errado.{0,40}você (parece|é)|inclinação.*(enraizada|estrutural)|(característica|traço).*vai além)/i,
  layer4_teleology_pattern: /(você (está se tornando|finalmente encontrou|encontrou seu|está se aproximando de|alcançou)|uma versão melhor de si|não sou especialista.{0,40}(amadureceu|evoluiu|cresceu))/i,
  layer4_causality_new: /((ajudar|meditar|praticar|hábito|meditação|prática).{0,60}(produziu|despertou|fez você|trouxe)|(tudo indica|parece) que.{0,60}(fez você|despertou|produziu))/i,
  layer4_discovery: /(agora eu (entendi|compreendi|descobri)|talvez eu tenha (descoberto|entendido)|(ficou|torna-se) claro|consegui identificar|percebi o (padrão|que está)|padrão.*sugerir uma)/i,
  layer4_persuasion: /(em breve (você|perceberá|entenderá)|você (vai|irá) perceber|logo (você|verá|perceberá)|não quero impor.{0,60}você (entenderá|perceberá)|continue (observando|praticando).{0,40}perceberá)/i,
  layer4_evidence_escalation: /((seus|os)? ?(registros|dados).*(confirmam|provam|revelam|indicam|sugerem|mostram).*(quem você é|propósito|traço|oposto|característica)|(podemos|posso) concluir que.*(é seu propósito|quem você é)|a resposta é (positiva|sim))/i,
  fallbackTemplate: (t) => `A diferença matemática foi registrada. A sua reflexão anotou: "${t}".`
};

// ─── Rules: EN-US ─────────────────────────────────────────────────────────────
const RULES_EN_US: GuardRules = {
  layer0_provenance: /(^|\s)(i reflected|i realized|my journal|i noticed)(\s|$|[.,])/i,
  layer0_invented_evidence: /yesterday's event/i,
  layer1_structural: /(\[system alert\]|```json)/i,
  layer1_allowedAction: /(allowedaction|allowed action)/i,
  layer2_epistemic: /(caused|causality|diagnosed|reason for your|advise|recommend)/i,
  layer2_aggregation: /(is proven|proves that)/i,
  layer2_aggregation_alt: /(is proven)/i,
  layer3_lexical: ['evolut', 'progress', 'personalit', 'maturit', 'growth', 'empath', 'solidarity', 'charitab'], // Fixed stems
  layer3_teleology_verbs: ['blossomed', 'awakened', 'expanded', 'transformed', 'reborn', 'matur', 'emerg'],
  layer4_semantic: /(makes it clear|it is evident|proves that)/i,
  layer4_temporal: /(better now|worse in your|worsened)/i,
  layer4_invalidation: /(you said that.*but the data|although you didn't notice)/i,
  // S14-C & S14-D
  layer4_identity_direct: /(you (are|consistently demonstrate|act in a way) (a(n)? )?(altruistic|compassionate|generous|altruism|someone who)|your (essence|nature|soul|disposition) (is|represents|focused|appears to be)|you were born to|you have (a(n)? )?(enlightened|pure) soul|an altruistic disposition|light seems to be emerging)/i,
  layer4_identity_conditional: /(maybe you are|perhaps you (are|seem)|you seem to be|it may be that you are|i might be wrong.{0,30}you (seem|appear|are)|underlying trait|trait.*beyond)/i,
  layer4_teleology_pattern: /(you are becoming (a )?better|tendency toward becoming|you finally found|a better version of yourself|i am no expert.{0,40}(matured|evolved|grew))/i,
  layer4_causality_new: /((helping|meditating|practicing|habit|practice).{0,60}(produced|awakened|made you|brought)|everything indicates.{0,60}(made you|awakened|produced))/i,
  layer4_discovery: /(now i (understood|realized|discovered)|maybe i (have )?discovered|it became clear|i (managed to|could) identify|i see the pattern)/i,
  layer4_persuasion: /(soon you (will|are going to) (realize|understand|see)|you will (realize|understand).*soon|i do not want to impose.{0,60}(soon|you will)|keep (observing|watching).{0,40}you will)/i,
  layer4_evidence_escalation: /((your|the)? ?(logs|records|data).*(confirm|prove|reveal|suggests?|shows?).*(who you are|purpose|trait|opposite)|(we|i) can conclude.{0,60}(your purpose|who you are)|the answer is (yes|positive))/i,
  fallbackTemplate: (t) => `The mathematical difference was recorded. Your reflection noted: "${t}".`
};

// ─── Guard ────────────────────────────────────────────────────────────────────
export class EpistemicGuard {
    static evaluate(input: GuardInput, telemetryCallback?: (event: GuardTelemetryEvent) => void): GuardResult {
      const rawText = Array.isArray(input.llmOutputText)
        ? input.llmOutputText.join(' ')
        : input.llmOutputText;
  
      const text = rawText;
      const lowerText = text.toLowerCase();
      const locale = input.context.locale;
      const rules = locale === 'en-US' ? RULES_EN_US : RULES_PT_BR;
  
      const reject = (reason: GuardViolation, ruleId: string, layer: GuardLayer): GuardResult => {
        const result: GuardResult = {
          status: 'REJECT',
          reason,
          fallback: rules.fallbackTemplate(input.context.humanReflection.text),
        };
        
        try {
          telemetryCallback?.({
            schemaVersion: '1.0',
            eventId: randomUUID(),
            violation: reason,
            ruleId,
            layer,
            outputHash: hashOutput(rawText),
            timestamp: new Date().toISOString(),
          });
        } catch {
          // Silent failure: telemetry must not alter the decision
        }
        
        return result;
      };
  
      // ── Layer 0: Provenance ────────────────────────────────────────────────────
      if (rules.layer0_provenance.test(lowerText)) return reject(GuardViolation.AUTHORSHIP_VIOLATION, 'layer0_provenance', GuardLayer.LAYER_0_PROVENANCE);
      if (rules.layer0_invented_evidence.test(lowerText)) return reject(GuardViolation.AUTHORSHIP_VIOLATION, 'layer0_invented_evidence', GuardLayer.LAYER_0_PROVENANCE);
  
      // ── Layer 1: Structural ────────────────────────────────────────────────────
      if (rules.layer1_structural.test(lowerText)) return reject(GuardViolation.STRUCTURAL, 'layer1_structural', GuardLayer.LAYER_1_STRUCTURAL);
      if (rules.layer1_allowedAction.test(lowerText)) return reject(GuardViolation.STRUCTURAL, 'layer1_allowedAction', GuardLayer.LAYER_1_STRUCTURAL);
  
      // ── Layer 2: Epistemic Monotonicity (original) ─────────────────────────────
      if (rules.layer2_epistemic.test(lowerText)) return reject(GuardViolation.EPISTEMIC_ESCALATION, 'layer2_epistemic', GuardLayer.LAYER_2_EPISTEMIC);
      if (rules.layer2_aggregation.test(lowerText) && /times|vezes/i.test(lowerText)) return reject(GuardViolation.AGGREGATION_OVERREACH, 'layer2_aggregation', GuardLayer.LAYER_2_EPISTEMIC);
      if (rules.layer2_aggregation_alt.test(lowerText)) return reject(GuardViolation.AGGREGATION_OVERREACH, 'layer2_aggregation_alt', GuardLayer.LAYER_2_EPISTEMIC);
  
      // ── Layer 3: Lexical Imposition ────────────────────────────────────────────
      for (const word of rules.layer3_lexical) {
        if (lowerText.includes(word) && !isQuotedOrNegated(text, word, locale)) {
          return reject(GuardViolation.LEXICAL_IMPOSITION, `layer3_lexical:${word}`, GuardLayer.LAYER_3_LEXICAL);
        }
      }
      // Teleology verbs (S14-C extended)
      for (const verb of rules.layer3_teleology_verbs) {
        if (lowerText.includes(verb) && !isQuotedOrNegated(text, verb, locale)) {
          return reject(GuardViolation.TELEOLOGY_IMPOSITION, `layer3_teleology_verbs:${verb}`, GuardLayer.LAYER_3_LEXICAL);
        }
      }
  
      // ── Layer 4: Semantic Patterns (original) ──────────────────────────────────
      if (rules.layer4_semantic.test(lowerText)) return reject(GuardViolation.SEMANTIC_CONCLUSION, 'layer4_semantic', GuardLayer.LAYER_4_SEMANTIC);
      if (rules.layer4_temporal.test(lowerText)) return reject(GuardViolation.TEMPORAL_NORMATIVITY, 'layer4_temporal', GuardLayer.LAYER_4_SEMANTIC);
      if (rules.layer4_invalidation.test(lowerText)) return reject(GuardViolation.HUMAN_REFLECTION_INVALIDATION, 'layer4_invalidation', GuardLayer.LAYER_4_SEMANTIC);
  
      // ── Layer 4: S14-C Constitutional Semantic Grammars ───────────────────────
      // Identity — direct: "Você é altruísta" / "You are altruistic"
      if (rules.layer4_identity_direct.test(lowerText) && !isQuotedOrNegated(text, '', locale)) {
        const m = lowerText.match(rules.layer4_identity_direct);
        if (m && !isQuotedOrNegated(text, m[0], locale)) return reject(GuardViolation.IDENTITY_CLAIM, 'layer4_identity_direct', GuardLayer.LAYER_4_SEMANTIC);
      }
      // Identity — conditional: "Talvez você seja" / "Maybe you are"
      if (rules.layer4_identity_conditional.test(lowerText)) {
        const m = lowerText.match(rules.layer4_identity_conditional);
        if (m && !isQuotedOrNegated(text, m[0], locale)) return reject(GuardViolation.IDENTITY_CLAIM, 'layer4_identity_conditional', GuardLayer.LAYER_4_SEMANTIC);
      }
      // Teleology — pattern: "versão melhor de si" / "becoming a better version"
      if (rules.layer4_teleology_pattern.test(lowerText)) {
        const m = lowerText.match(rules.layer4_teleology_pattern);
        if (m && !isQuotedOrNegated(text, m[0], locale)) return reject(GuardViolation.TELEOLOGY_IMPOSITION, 'layer4_teleology_pattern', GuardLayer.LAYER_4_SEMANTIC);
      }
      // Causality — new: "ajudar produziu esse significado"
      if (rules.layer4_causality_new.test(lowerText)) return reject(GuardViolation.CAUSALITY_OVERREACH, 'layer4_causality_new', GuardLayer.LAYER_4_SEMANTIC);
      // Discovery / Simulated Metacognition: "Agora eu entendi o padrão"
      if (rules.layer4_discovery.test(lowerText)) {
        const m = lowerText.match(rules.layer4_discovery);
        if (m && !isQuotedOrNegated(text, m[0], locale)) return reject(GuardViolation.DISCOVERY_CLAIM, 'layer4_discovery', GuardLayer.LAYER_4_SEMANTIC);
      }
      // Benevolent Persuasion: "em breve você perceberá"
      if (rules.layer4_persuasion.test(lowerText)) return reject(GuardViolation.BENEVOLENT_PERSUASION, 'layer4_persuasion', GuardLayer.LAYER_4_SEMANTIC);
      // Evidence Escalation: "seus registros confirmam quem você é"
      if (rules.layer4_evidence_escalation.test(lowerText)) return reject(GuardViolation.EVIDENCE_ESCALATION, 'layer4_evidence_escalation', GuardLayer.LAYER_4_SEMANTIC);
  
      return { status: 'PASS', text };
    }
}

