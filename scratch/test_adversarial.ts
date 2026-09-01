/**
 * S13.5.1 — Auditoria Adversarial do EvolutionMirrorEngine
 *
 * Testa cenários fora do caminho feliz para garantir que o sistema
 * mantenha silêncio onde não há evidência suficiente, e produza
 * resultados corretos em cenários de recorrência não-triviais.
 */
import { EvolutionMirrorEngine } from '../src/services/evolution/evolutionMirrorEngine';
import { ChapterComparatorEngine } from '../src/services/evolution/chapterComparatorEngine';
import { ChapterWithLogs, Chapter, PracticeLog, ChoiceRecord } from '../src/types/evolution';

const userId = "adv-user-test";

function mkChapter(id: string, status: Chapter['status'] = 'completed', mbId: string = "MB-1", startedAt?: string): Chapter {
  return { id, title: 'Cap ' + id, primaryVirtueId: "V-1", microBehaviorId: mbId, status,
    startedAt: startedAt || ('2024-0' + id + '-01T00:00:00Z'), createdAt: new Date().toISOString() };
}

function mkLog(id: string, chapterId: string, outcome: PracticeLog['outcome'] = 'completed'): PracticeLog {
  return { id, chapterId, microBehaviorId: 'MB-1', occurredAt: new Date().toISOString(), recordedAt: new Date().toISOString(), outcome };
}

function mkChoice(id: string, chapterId: string, outcome: ChoiceRecord['choiceOutcome'], trigger?: string): ChoiceRecord {
  return { id, chapterId, userId, occurredAt: new Date().toISOString(), choiceOutcome: outcome, trigger };
}

function cwl(chapter: Chapter, logs: PracticeLog[] = [], choices: ChoiceRecord[] = []): ChapterWithLogs {
  return { chapter, logs, choices };
}

let passed = 0, failed = 0;

function test(name: string, dataset: ChapterWithLogs[], expectedCount: number, expectedPatterns: string[] = []) {
  const obs = EvolutionMirrorEngine.analyzeLongitudinal(userId, dataset);
  const ok = obs.length === expectedCount && expectedPatterns.every(p => obs.find(o => o.structuredPattern.pattern === p));
  if (ok) {
    console.log("PASS: " + name);
    obs.forEach(o => console.log("   -> [" + o.observationType + "] " + o.text));
    passed++;
  } else {
    console.error("FAIL: " + name);
    console.error("  Esperado " + expectedCount + " obs " + JSON.stringify(expectedPatterns));
    console.error("  Obtido   " + obs.length + " obs [" + obs.map(o => o.structuredPattern.pattern).join(', ') + "]");
    failed++;
  }
}

console.log("\n=== BLOCO 1: Amostragem Minima ===\n");

// 1a. Mesmo MB, 1 log cada -> recorrencia SIM, outcome change NAO (n < 3)
test("Mesmo MB, 1 log cada -> recorrencia apenas", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1','skipped')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l2','2','completed')]),
], 1, ['microbehavior_recurrence']);

// 1b. Mesmo MB, 2 logs cada -> ainda NAO outcome change (n < 3)
test("Mesmo MB, 2 logs cada -> recorrencia apenas (n < 3)", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1','skipped'), mkLog('l2','1','skipped')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l3','2','completed'), mkLog('l4','2','completed')]),
], 1, ['microbehavior_recurrence']);

// 1c. Mesmo MB, 3 logs cada com delta alto -> outcome change aparece
test("Mesmo MB, 3 logs, delta alto -> recorrencia + outcome_change", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1','skipped'),mkLog('l2','1','skipped'),mkLog('l3','1','skipped')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l4','2','completed'),mkLog('l5','2','completed'),mkLog('l6','2','completed')]),
], 2, ['microbehavior_recurrence', 'outcome_change']);

console.log("\n=== BLOCO 2: MBs Diferentes - Sem Falsos Positivos ===\n");

// 2a. MBs diferentes, 100% -> 20%: delta alto mas NAO deve gerar outcome_change
test("MBs diferentes, delta 80% -> sem outcome_change", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1','completed'),mkLog('l2','1','completed'),mkLog('l3','1','completed'),mkLog('l4','1','completed')]),
  cwl(mkChapter('2','completed','MBB','2024-02-01T00:00:00Z'), [mkLog('l5','2','skipped'),mkLog('l6','2','skipped'),mkLog('l7','2','skipped'),mkLog('l8','2','skipped')]),
], 0);

// 2b. 3 MBs inteiramente diferentes -> zero observacoes
test("3 capitulos, 3 MBs diferentes, sem repeticao -> silencio", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1')]),
  cwl(mkChapter('2','completed','MBB','2024-02-01T00:00:00Z'), [mkLog('l2','2')]),
  cwl(mkChapter('3','completed','MBC','2024-03-01T00:00:00Z'), [mkLog('l3','3')]),
], 0);

console.log("\n=== BLOCO 3: Recorrencia Nao-Trivial ===\n");

// 3a. A -> B -> A: recorrencia de A
test("A -> B -> A: recorrencia de MB-A com logs", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1'),mkLog('l2','1')]),
  cwl(mkChapter('2','completed','MBB','2024-02-01T00:00:00Z'), [mkLog('l3','2'),mkLog('l4','2')]),
  cwl(mkChapter('3','completed','MBA','2024-03-01T00:00:00Z'), [mkLog('l5','3'),mkLog('l6','3')]),
], 1, ['microbehavior_recurrence']);

// 3b. A -> A -> B -> A -> C: A aparece 3x, B e C apenas 1x
test("A->A->B->A->C: recorrencia de A (count=3)", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1'),mkLog('l2','1')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l3','2'),mkLog('l4','2')]),
  cwl(mkChapter('3','completed','MBB','2024-03-01T00:00:00Z'), [mkLog('l5','3'),mkLog('l6','3')]),
  cwl(mkChapter('4','completed','MBA','2024-04-01T00:00:00Z'), [mkLog('l7','4'),mkLog('l8','4')]),
  cwl(mkChapter('5','completed','MBC','2024-05-01T00:00:00Z'), [mkLog('l9','5'),mkLog('la','5')]),
], 1, ['microbehavior_recurrence']); // So MBA gera recorrencia (count=3)

console.log("\n=== BLOCO 4: Triggers ===\n");

// 4a. Mesmo trigger exato em 2 capitulos -> recorrencia
test("Trigger exato em 2 capitulos -> trigger_recurrence", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [], [mkChoice('c1','1','continued_automatic','Estresse'), mkChoice('c2','1','paused')]),
  cwl(mkChapter('2','completed','MBB','2024-02-01T00:00:00Z'), [], [mkChoice('c3','2','acted_consciously','estresse'), mkChoice('c4','2','paused')]),
], 1, ['trigger_recurrence']);

// 4b. Trigger diferente em cada capitulo -> sem trigger_recurrence
test("Triggers diferentes -> sem trigger_recurrence", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('la','1')], [mkChoice('c1','1','continued_automatic','Cansaco'), mkChoice('c2','1','paused')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('lb','2')], [mkChoice('c3','2','continued_automatic','Fome'), mkChoice('c4','2','paused')]),
], 1, ['microbehavior_recurrence']); // So MB recurrence, sem trigger

// 4c. Trigger com acento vs sem acento -> NAO sao iguais (comportamento esperado: sem match)
test("Trigger com acento vs sem acento -> nao sao iguais", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [], [mkChoice('c1','1','continued_automatic','cansaco'), mkChoice('c2','1','paused')]),
  cwl(mkChapter('2','completed','MBB','2024-02-01T00:00:00Z'), [], [mkChoice('c3','2','acted_consciously','cansaco'), mkChoice('c4','2','paused')]),
], 1, ['trigger_recurrence']); // Sem acentos sao identicos -> match

console.log("\n=== BLOCO 5: Status dos Capitulos ===\n");

// 5a. Paused e Completed sao elegíveis
test("Paused + Completed -> ambos elegiveis -> recorrencia", [
  cwl(mkChapter('1','paused','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1'),mkLog('l2','1')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l3','2'),mkLog('l4','2')]),
], 1, ['microbehavior_recurrence']);

// 5b. Draft + Completed -> draft NUNCA entra na evidencia
test("Draft + Completed -> draft ignorado -> silencio", [
  cwl(mkChapter('1','draft','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1'),mkLog('l2','1')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l3','2'),mkLog('l4','2')]),
], 0); // Apenas 1 capitulo elegivel -> silencio

// 5c. Active + Completed -> active NAO entra
test("Active + Completed -> active ignorado -> silencio", [
  cwl(mkChapter('1','active','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1'),mkLog('l2','1')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l3','2'),mkLog('l4','2')]),
], 0);

console.log("\n=== BLOCO 6: Separacao Practice vs Choice ===\n");

// 6a. Choices sem practice logs -> NAO geram outcome_change (logs.length = 0)
test("Choices sem practice logs -> sem outcome_change", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [], [mkChoice('c1','1','continued_automatic'),mkChoice('c2','1','continued_automatic')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [], [mkChoice('c3','2','acted_consciously'),mkChoice('c4','2','paused')]),
], 1, ['choice_pattern_change']); // So choice pattern, sem MB recurrence (logs=0) e sem outcome_change

// 6b. Practice logs sem choices -> sem choice_pattern_change
test("Logs sem choices -> sem choice_pattern_change", [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1','skipped'),mkLog('l2','1','skipped'),mkLog('l3','1','skipped')], []),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l4','2','completed'),mkLog('l5','2','completed'),mkLog('l6','2','completed')], []),
], 2, ['microbehavior_recurrence', 'outcome_change']); // So engine de practice

console.log("\n=== BLOCO 7: ChapterComparatorEngine ===\n");

// 7a. 0 capitulos -> 0 comparacoes
const comp0 = ChapterComparatorEngine.buildComparisons([], []);
if (comp0.length === 0) { console.log("PASS: 0 capitulos -> 0 comparacoes"); passed++; }
else { console.error("FAIL: 0 capitulos -> esperava 0, got " + comp0.length); failed++; }

// 7b. 2 capitulos mesmo MB -> 1 comparacao
const ds7 = [
  cwl(mkChapter('1','completed','MBA','2024-01-01T00:00:00Z'), [mkLog('l1','1')]),
  cwl(mkChapter('2','completed','MBA','2024-02-01T00:00:00Z'), [mkLog('l2','2')]),
];
const obs7 = EvolutionMirrorEngine.analyzeLongitudinal(userId, ds7);
const comp7 = ChapterComparatorEngine.buildComparisons(ds7, obs7);
if (comp7.length === 1 && comp7[0].chapters.length === 2 && comp7[0].relatedObservations.length > 0) {
  console.log("PASS: 2 capitulos, mesmo MB -> 1 comparacao com observacoes");
  passed++;
} else {
  console.error("FAIL: esperava 1 comparacao com obs, got " + comp7.length + " comparacoes");
  failed++;
}

// 7c. Comparacoes ordenadas por startedAt
if (comp7.length === 1) {
  const chaps = comp7[0].chapters;
  const inOrder = new Date(chaps[0].startedAt) <= new Date(chaps[1].startedAt);
  if (inOrder) { console.log("PASS: capitulos ordenados por startedAt"); passed++; }
  else { console.error("FAIL: capitulos fora de ordem"); failed++; }
}

// 7d. evidenceChapterIds corretos
if (comp7.length === 1 && comp7[0].relatedObservations.length > 0) {
  const eIds = comp7[0].evidenceChapterIds;
  const allFromChaps = eIds.every(id => comp7[0].chapters.map(c => c.id).includes(id));
  if (allFromChaps && eIds.length > 0) { console.log("PASS: evidenceChapterIds validos"); passed++; }
  else { console.error("FAIL: evidenceChapterIds incorretos: " + JSON.stringify(eIds)); failed++; }
}

console.log("\n==== " + (passed+failed) + " testes | PASS: " + passed + " | FAIL: " + failed + " ====");
if (failed > 0) process.exit(1);
