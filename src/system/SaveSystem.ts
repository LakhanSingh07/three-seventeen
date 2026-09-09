import type { CaseSaveState, CaseData } from '../cases/types';

const STORAGE_PREFIX = '317_game_save_';

export class SaveSystem {
  public static getSaveKey(caseId: string): string {
    return `${STORAGE_PREFIX}${caseId}`;
  }

  public static loadState(caseId: string): CaseSaveState | null {
    try {
      const data = localStorage.getItem(this.getSaveKey(caseId));
      if (!data) return null;
      return JSON.parse(data) as CaseSaveState;
    } catch (e) {
      console.error('Error loading save state:', e);
      return null;
    }
  }

  public static saveState(state: CaseSaveState): void {
    try {
      localStorage.setItem(this.getSaveKey(state.caseId), JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  public static createInitialState(caseData: CaseData): CaseSaveState {
    const initialTimelineIds = caseData.timeline
      .filter((t) => !t.isLockedByDefault)
      .map((t) => t.id);

    return {
      caseId: caseData.id,
      caseStartedAt: Date.now(),
      elapsedSeconds: 0,
      isCaseUnlocked: true,
      isPhoneUnlocked: false,
      discoveredEvidenceIds: [],
      unlockedDeductionIds: [],
      unlockedTimelineEventIds: initialTimelineIds,
      viewedAppIds: ['messages'],
      usedHintIds: [],
      caseFinished: false,
    };
  }

  public static resetCase(_caseId: string, caseData: CaseData): CaseSaveState {
    const fresh = this.createInitialState(caseData);
    this.saveState(fresh);
    return fresh;
  }

  public static calculateScore(
    caseData: CaseData,
    state: CaseSaveState,
    isCorrectAccusation: boolean
  ) {
    const totalEvidence = caseData.evidenceList.length;
    const discoveredEvidenceCount = state.discoveredEvidenceIds.length;
    const evidencePercent = Math.round((discoveredEvidenceCount / Math.max(1, totalEvidence)) * 100);

    const totalDeductions = caseData.deductions.length;
    const unlockedDeductionsCount = state.unlockedDeductionIds.length;
    const deductionsPercent = Math.round((unlockedDeductionsCount / Math.max(1, totalDeductions)) * 100);

    const hintsPenalty = state.usedHintIds.length * 350;
    const timeInMinutes = state.elapsedSeconds / 60;
    const timePenalty = Math.min(2000, Math.round(timeInMinutes * 25));

    const baseScore = isCorrectAccusation ? 10000 : 2500;
    const accuracyBonus = isCorrectAccusation ? 2000 : 0;
    const evidenceBonus = discoveredEvidenceCount * 120;
    const deductionBonus = unlockedDeductionsCount * 450;

    let finalScore = baseScore + accuracyBonus + evidenceBonus + deductionBonus - hintsPenalty - timePenalty;
    finalScore = Math.max(500, finalScore);

    let rank: 'S' | 'A' | 'B' | 'C' | 'F' = 'C';
    if (!isCorrectAccusation) {
      rank = 'F';
    } else if (finalScore >= 11500 && state.usedHintIds.length === 0 && deductionsPercent >= 80) {
      rank = 'S';
    } else if (finalScore >= 9500) {
      rank = 'A';
    } else if (finalScore >= 7500) {
      rank = 'B';
    } else {
      rank = 'C';
    }

    return {
      evidencePercent,
      deductionsPercent,
      hintsPenalty,
      timePenalty,
      accuracyBonus,
      finalScore,
      rank,
    };
  }
}
