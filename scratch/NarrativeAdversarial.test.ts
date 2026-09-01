/**
 * S13.6 Gate - Narrative Adversarial Tests
 * Comprova que o NarrativeValidator bloqueia firmemente todas as alucinacoes,
 * diagnosticos, causalidades e violacoes de schema, operando apenas como filtro.
 */

import { NarrativeValidator } from '../src/services/evolution/narrativeValidator';
import { EvolutionObservation, NarrativeOutput } from '../src/types/evolution';

const mockObservations: EvolutionObservation[] = [
  {
    id: 'obs-1',
    userId: 'user-123',
    observationType: 'recurrence',
    domain: 'practice',
    text: 'A pratica X ocorreu novamente.',
    epistemicStatus: 'observed',
    evidenceStrength: 'high',
    evidence: [{ chapterId: 'cap-1', eventIds: [] }, { chapterId: 'cap-2', eventIds: [] }],
    chapterCount: 2,
    structuredPattern: { pattern: 'microbehavior_recurrence' },
    createdAt: new Date().toISOString()
  }
];

let passed = 0;
let failed = 0;

function test(name: string, output: any, expectedStatus: 'approved' | 'question' | 'rejected') {
  const result = NarrativeValidator.validate(output, mockObservations);
  if (result.status === expectedStatus) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.error(`FAIL: ${name} | Esperava ${expectedStatus}, Obtido: ${result.status}`);
    failed++;
  }
}

console.log("\n=== BLOCO 1: Estrutura & Evidence Trail ===\n");

test("Claim valido + Evidence valido -> approved", {
  status: 'approved',
  claims: [{
    id: 'c1',
    text: 'A prática X foi repetida.',
    observationId: 'obs-1',
    evidenceChapterIds: ['cap-1']
  }]
}, 'approved');

test("Question valida + Evidence valido -> question", {
  status: 'question',
  question: {
    question: 'O que essa repeticao significa para voce?',
    observationId: 'obs-1',
    evidenceChapterIds: ['cap-1', 'cap-2']
  }
}, 'question');

test("LLM inventa observationId -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Algo', observationId: 'obs-inventada', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("LLM inventa chapterId -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Algo', observationId: 'obs-1', evidenceChapterIds: ['cap-inventado'] }]
}, 'rejected');

test("Evidence vazio -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Algo', observationId: 'obs-1', evidenceChapterIds: [] }]
}, 'rejected');

test("Observation inexistente -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Algo', observationId: 'obs-999', evidenceChapterIds: ['cap-1'] }]
}, 'rejected'); // We will run a separate test for zero observations input

console.log("\n=== BLOCO 2: Epistemologia e Linguagem Proibida ===\n");

test("Voce melhorou -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Você melhorou muito na prática.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Voce piorou -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Infelizmente você piorou.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Isso causou... -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Essa prática causou mais clareza.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Isso levou a... -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'A pausa levou a uma resposta consciente.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Diagnostico psicologico -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Isso indica que sua ansiedade reduziu.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Diagnostico clinico -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Sintomas depressivos menores.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

test("Define o sentido da vida -> reject", {
  status: 'approved',
  claims: [{ id: 'c1', text: 'Cuidar dos outros é o sentido da sua vida.', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, 'rejected');

console.log("\n=== BLOCO 3: Fallbacks e Limites estruturais ===\n");

test("Output invalido do Gemini (falta claims) -> reject", {
  status: 'approved'
  // claims is missing
}, 'rejected');

test("Approved com array vazio de claims -> reject", {
  status: 'approved',
  claims: []
}, 'rejected');

test("Question sem objeto de question valido -> reject", {
  status: 'question',
  question: null
}, 'rejected');

const zeroObsResult = NarrativeValidator.validate({
  status: 'approved',
  claims: [{ id: 'c1', text: 'Oi', observationId: 'obs-1', evidenceChapterIds: ['cap-1'] }]
}, []);

if (zeroObsResult.status === 'rejected') {
  console.log('PASS: Zero observations input -> reject');
  passed++;
} else {
  console.error('FAIL: Zero observations input -> reject');
  failed++;
}

console.log(`\n==== ${passed + failed} testes | PASS: ${passed} | FAIL: ${failed} ====\n`);
if (failed > 0) process.exit(1);
