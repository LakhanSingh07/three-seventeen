import type { CaseData, CaseSaveState, Deduction, AccusationTheory, EndingData } from './types';
import { CASE_001_DATA } from './case-001/case-data';

export interface CaseMeta {
  id: string;
  caseNumber: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  estimatedTime: string;
  isLocked: boolean;
  coverImage: string;
  badge?: string;
}

export const ALL_CASES_META: CaseMeta[] = [
  {
    id: 'case-001',
    caseNumber: 'CASE 001',
    title: 'The Missing Girl',
    tagline: 'Every phone has a story.',
    difficulty: 'Intermediate',
    estimatedTime: '20-30 min',
    isLocked: false,
    coverImage: '/assets/case001/case-art/case001_cover.webp',
    badge: 'PLAYABLE NOW',
  },
  {
    id: 'case-002',
    caseNumber: 'CASE 002',
    title: 'Ghost Train 3:17',
    tagline: 'The midnight express never stopped.',
    difficulty: 'Intermediate',
    estimatedTime: '30-40 min',
    isLocked: true,
    coverImage: '/assets/case001/environments/central_station_night.webp',
    badge: 'COMING SOON',
  },
  {
    id: 'case-003',
    caseNumber: 'CASE 003',
    title: 'The Fake Friend',
    tagline: 'Someone in this group chat is not who they say they are.',
    difficulty: 'Master',
    estimatedTime: '40-50 min',
    isLocked: true,
    coverImage: '/assets/case001/environments/rainy_city_night.webp',
    badge: 'COMING SOON',
  },
  {
    id: 'case-004',
    caseNumber: 'CASE 004',
    title: 'Apartment 404',
    tagline: 'The tenant vanished. The smart home kept recording.',
    difficulty: 'Master',
    estimatedTime: '45-60 min',
    isLocked: true,
    coverImage: '/assets/case001/environments/apartment_hallway.webp',
    badge: 'IN PRODUCTION',
  },
];

export class CaseEngine {
  private static cases: Record<string, CaseData> = {
    'case-001': CASE_001_DATA,
  };

  public static getCase(caseId: string): CaseData | null {
    return this.cases[caseId] || null;
  }

  public static validateCase(caseData: CaseData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const evidenceIds = new Set(caseData.evidenceList.map((e) => e.id));
    const characterIds = new Set(caseData.characters.map((c) => c.id));
    characterIds.add('sarah'); // Victim / phone owner

    // Check unique evidence IDs
    if (evidenceIds.size !== caseData.evidenceList.length) {
      errors.push('Duplicate evidence IDs detected.');
    }

    // Check deductions reference valid evidence or parent deductions
    caseData.deductions.forEach((d) => {
      d.requiredEvidenceIds.forEach((reqId) => {
        if (!evidenceIds.has(reqId) && !caseData.deductions.some((other) => other.id === reqId)) {
          errors.push(`Deduction "${d.id}" references missing evidence ID "${reqId}"`);
        }
      });
      if (d.revealsCharacterId && !characterIds.has(d.revealsCharacterId)) {
        errors.push(`Deduction "${d.id}" references unknown character "${d.revealsCharacterId}"`);
      }
    });

    // Check message participants
    caseData.messages.forEach((thread) => {
      if (!characterIds.has(thread.participantId)) {
        errors.push(`Message thread "${thread.id}" has unknown participant "${thread.participantId}"`);
      }
      thread.messages.forEach((msg) => {
        if (msg.clueEvidenceId && !evidenceIds.has(msg.clueEvidenceId)) {
          errors.push(`Message "${msg.id}" references missing clue evidence ID "${msg.clueEvidenceId}"`);
        }
      });
    });

    // Check photos
    caseData.photos.forEach((photo) => {
      if (photo.clueEvidenceId && !evidenceIds.has(photo.clueEvidenceId)) {
        errors.push(`Photo "${photo.id}" references missing clue evidence ID "${photo.clueEvidenceId}"`);
      }
    });

    // Check calls
    caseData.calls.forEach((call) => {
      if (call.clueEvidenceId && !evidenceIds.has(call.clueEvidenceId)) {
        errors.push(`Call "${call.id}" references missing clue evidence ID "${call.clueEvidenceId}"`);
      }
    });

    // Check solution criteria
    caseData.solution.mandatoryEvidenceIds.forEach((eId) => {
      if (!evidenceIds.has(eId)) {
        errors.push(`Solution references missing mandatory evidence ID "${eId}"`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static tryConnectEvidence(
    caseData: CaseData,
    evidenceAId: string,
    evidenceBId: string,
    currentDeductions: string[]
  ): { success: boolean; deduction?: Deduction; isContradiction?: boolean; message: string } {
    // Check if any deduction requires these two evidence IDs
    const matchedDeduction = caseData.deductions.find((d) => {
      const ids = d.requiredEvidenceIds;
      return (
        ids.includes(evidenceAId) &&
        ids.includes(evidenceBId) &&
        !currentDeductions.includes(d.id)
      );
    });

    if (matchedDeduction) {
      return {
        success: true,
        deduction: matchedDeduction,
        isContradiction: !!matchedDeduction.contradictionType,
        message: `Deduction Formed: ${matchedDeduction.title}`,
      };
    }

    return {
      success: false,
      message: "These clues don't appear connected yet.",
    };
  }

  public static evaluateAccusation(
    caseData: CaseData,
    theory: AccusationTheory,
    state: CaseSaveState
  ): EndingData {
    const { solution, endings } = caseData;

    // Check if critical deductions and evidence are discovered
    const hasCriticalDeductions = solution.mandatoryDeductionIds.every((id) =>
      state.unlockedDeductionIds.includes(id)
    );

    // If accusing Alex
    if (theory.suspectId === 'alex') {
      return endings['wrong_suspect_alex'];
    }

    // If accusing Ryan
    if (theory.suspectId === 'ryan') {
      return endings['wrong_suspect_ryan'];
    }

    // If accusing Daniel
    if (theory.suspectId === 'daniel') {
      return endings['wrong_suspect_daniel'];
    }

    // If accusing the Unknown Handler
    if (theory.suspectId === 'unknown') {
      if (
        hasCriticalDeductions &&
        (theory.locationId === solution.correctLocationId || theory.locationId === 'loc-central-station') &&
        theory.criticalTime === '03:17 AM'
      ) {
        return endings['true_ending'];
      }
      return endings['incomplete_theory'];
    }

    return endings['incomplete_theory'];
  }
}
