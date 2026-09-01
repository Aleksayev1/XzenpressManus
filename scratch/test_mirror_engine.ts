import { EvolutionMirrorEngine } from '../src/services/evolution/evolutionMirrorEngine';
import { ChapterWithLogs, Chapter, PracticeLog, ChoiceRecord } from '../src/types/evolution';

const userId = "test-user-123";

function mkChapter(id: string, status: Chapter['status'] = 'completed', mbId: string = "MB-1", startedAt?: string): Chapter {
  return { id, title: 'Mock', primaryVirtueId: "V-1", microBehaviorId: mbId, status,
    startedAt: startedAt || '2024-01-01T00:00:00Z', createdAt: new Date().toISOString() };
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

function runTest(name: string, dataset: ChapterWithLogs[], expectedCount: number, expectedPatterns: string[] = []) {
  const obs = EvolutionMirrorEngine.analyzeLongitudinal(userId, dataset);
  const ok = obs.length === expectedCount && expectedPatterns.every(p => obs.find(o => o.structuredPattern.pattern === p));
  if (ok) {
    console.log("PASS: " + name);
    obs.forEach(o => console.log("  -> " + o.text));
    passed++;
  } else {
    console.error("FAIL: " + name + " -- got " + obs.length + " (" + obs.map(o => o.structuredPattern.pattern).join(',') + "), expected " + expectedCount + " " + JSON.stringify(expectedPatterns));
    failed++;
  }
}

// 1: 0 capitulos -> silencio
runTest("0 capitulos", [], 0);

// 2: 1 capitulo -> silencio
runTest("1 capitulo", [cwl(mkChapter('A'), [mkLog('l1','A')])], 0);

// 3: mesmo MB + logs -> recorrencia
runTest("Recorrencia MB com logs", [
  cwl(mkChapter('A','completed','MB1','2024-01-01T00:00:00Z'), [mkLog('l1','A'), mkLog('l2','A')]),
  cwl(mkChapter('B','completed','MB1','2024-02-01T00:00:00Z'), [mkLog('l3','B'), mkLog('l4','B')]),
], 1, ['microbehavior_recurrence']);

// 3b: mesmo MB SEM logs -> sem recorrencia
runTest("Sem logs = sem recorrencia MB", [
  cwl(mkChapter('A','completed','MB1','2024-01-01T00:00:00Z')),
  cwl(mkChapter('B','completed','MB1','2024-02-01T00:00:00Z')),
], 0);

// 4: MBs diferentes -> sem outcome_change mesmo delta=100%
const d4a = cwl(mkChapter('A','completed','MBA','2024-01-01T00:00:00Z'), ['l1','l2','l3','l4'].map(id => mkLog(id,'A','skipped')));
const d4b = cwl(mkChapter('B','completed','MBB','2024-02-01T00:00:00Z'), ['l5','l6','l7','l8'].map(id => mkLog(id,'B','completed')));
runTest("MBs diferentes -> sem outcome_change", [d4a, d4b], 0);

// 5: mesmo MB + delta 50% -> recorrencia + outcome_change
// d5a: 1/4 = 25% completed
const d5a = cwl(mkChapter('A','completed','MB1','2024-01-01T00:00:00Z'), [
  mkLog('l1','A','skipped'), mkLog('l2','A','skipped'),
  mkLog('l3','A','completed'), mkLog('l4','A','skipped'),
]);
// d5b: 3/4 = 75% completed -> delta = 50% -> outcome_change
const d5b = cwl(mkChapter('B','completed','MB1','2024-02-01T00:00:00Z'), [
  mkLog('l5','B','completed'), mkLog('l6','B','completed'),
  mkLog('l7','B','completed'), mkLog('l8','B','skipped'),
]);
runTest("Mesmo MB + delta 50% -> recorrencia + outcome_change", [d5a, d5b], 2, ['microbehavior_recurrence','outcome_change']);

// 5b: delta < 20% -> sem outcome_change (so recorrencia)
// d5c: 2/5 = 40% completed -> delta vs d5a(25%) = 15% < 20% -> NO outcome_change
const d5c = cwl(mkChapter('C','completed','MB1','2024-03-01T00:00:00Z'), [
  mkLog('l9','C','completed'), mkLog('l10','C','skipped'),
  mkLog('l11','C','skipped'), mkLog('l12','C','skipped'),
  mkLog('l13','C','completed'),
]);
runTest("Delta < 20% -> so recorrencia, sem outcome_change", [d5a, d5c], 1, ['microbehavior_recurrence']);

// 6: choices n=1 (insuficiente) -> sem choice_pattern
const d6a = cwl(mkChapter('A','completed','MB1','2024-01-01T00:00:00Z'), [], [mkChoice('c1','A','continued_automatic')]);
const d6b = cwl(mkChapter('B','completed','MB1','2024-02-01T00:00:00Z'), [], [mkChoice('c2','B','acted_consciously')]);
runTest("Choices n=1 -> sem choice_pattern", [d6a, d6b], 0);

// 7: choices n>=2 -> choice_pattern_change
const d7a = cwl(mkChapter('A','completed','MB1','2024-01-01T00:00:00Z'), [], [
  mkChoice('c1','A','continued_automatic'), mkChoice('c2','A','continued_automatic')
]);
const d7b = cwl(mkChapter('B','completed','MB1','2024-02-01T00:00:00Z'), [], [
  mkChoice('c3','B','acted_consciously'), mkChoice('c4','B','paused')
]);
runTest("Choices n>=2 -> choice_pattern_change", [d7a, d7b], 1, ['choice_pattern_change']);

// 8: draft ignorado
runTest("Draft ignorado", [
  cwl(mkChapter('A','draft'), [mkLog('l1','A'), mkLog('l2','A')]),
  cwl(mkChapter('B','draft'), [mkLog('l3','B'), mkLog('l4','B')]),
], 0);

// 9: trigger case-insensitive entre MBs diferentes -> trigger_recurrence
const d9a = cwl(mkChapter('A','completed','MBA','2024-01-01T00:00:00Z'), [],
  [mkChoice('c1','A','continued_automatic','Cansaco'), mkChoice('c2','A','paused')]);
const d9b = cwl(mkChapter('B','completed','MBB','2024-02-01T00:00:00Z'), [],
  [mkChoice('c3','B','acted_consciously','cansaco'), mkChoice('c4','B','paused')]);
runTest("Trigger case-insensitive entre MBs -> trigger_recurrence", [d9a, d9b], 1, ['trigger_recurrence']);

console.log("\n==== " + (passed+failed) + " testes | PASS: " + passed + " | FAIL: " + failed + " ====");
if (failed > 0) process.exit(1);
