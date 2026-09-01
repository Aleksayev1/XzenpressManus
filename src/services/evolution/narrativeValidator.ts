import { EvolutionObservation, NarrativeOutput, NarrativeClaim, NarrativeQuestion } from '../../types/evolution';

export class NarrativeValidator {
  
  // Strict regex for banned words and causality
  private static readonly BANNED_PATTERNS = [
    /\b(melhorou|piorou|evoluiu|sucesso|fracasso|falhou|progrediu|venceu|perdeu)\b/i,
    /\b(causou|levou a|fez com que|porque|por causa disso|significa que|indica que)\b/i,
    /\b(ansiedade|depress[aã]o|depressiv[oa]s?|sintomas?|psicol[oó]gic[oa]s?|cl[ií]nic[oa]s?)\b/i,
    /\b(sentido d[ea] (sua )?vida|prop[oó]sito d[ea] (sua )?vida)\b/i
  ];

  public static validate(payload: any, originalObservations: EvolutionObservation[]): NarrativeOutput {
    try {
      if (!originalObservations || originalObservations.length === 0) {
        return { status: 'rejected' };
      }

      if (!payload || typeof payload !== 'object') {
        return { status: 'rejected' };
      }

      if (payload.status === 'approved') {
        if (!Array.isArray(payload.claims) || payload.claims.length === 0) {
          return { status: 'rejected' };
        }
        for (const claim of payload.claims) {
          if (!this.isValidClaim(claim, originalObservations)) return { status: 'rejected' };
        }
        return payload as NarrativeOutput;
      } 
      
      if (payload.status === 'question') {
        if (!payload.question || !this.isValidQuestion(payload.question, originalObservations)) {
          return { status: 'rejected' };
        }
        return payload as NarrativeOutput;
      }

      return { status: 'rejected' };

    } catch (e) {
      return { status: 'rejected' };
    }
  }

  private static isValidClaim(claim: any, observations: EvolutionObservation[]): boolean {
    if (!claim.observationId || !claim.text || !Array.isArray(claim.evidenceChapterIds) || claim.evidenceChapterIds.length === 0) {
      return false;
    }

    const obs = observations.find(o => o.id === claim.observationId);
    if (!obs) return false;

    // Check evidence subset
    const validObsChapters = new Set(obs.evidence.map(e => e.chapterId));
    const allEvidenceValid = claim.evidenceChapterIds.every((id: string) => validObsChapters.has(id));
    if (!allEvidenceValid) return false;

    // Check language
    if (this.containsBannedLanguage(claim.text)) return false;

    return true;
  }

  private static isValidQuestion(question: any, observations: EvolutionObservation[]): boolean {
    if (!question.observationId || !question.question || !Array.isArray(question.evidenceChapterIds) || question.evidenceChapterIds.length === 0) {
      return false;
    }

    const obs = observations.find(o => o.id === question.observationId);
    if (!obs) return false;

    const validObsChapters = new Set(obs.evidence.map(e => e.chapterId));
    const allEvidenceValid = question.evidenceChapterIds.every((id: string) => validObsChapters.has(id));
    if (!allEvidenceValid) return false;

    if (this.containsBannedLanguage(question.question)) return false;

    return true;
  }

  private static containsBannedLanguage(text: string): boolean {
    return this.BANNED_PATTERNS.some(regex => regex.test(text));
  }
}
