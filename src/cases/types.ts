export type SuspectId = 'alex' | 'maya' | 'ryan' | 'daniel' | 'unknown' | 'corporate_handler';

export type EvidenceCategory =
  | 'Timeline'
  | 'Message'
  | 'Location'
  | 'Photo'
  | 'Call'
  | 'Document'
  | 'Contradiction'
  | 'Relationship';

export type EvidenceImportance = 'critical' | 'supporting' | 'red_herring';

export interface Character {
  id: string;
  name: string;
  age: number;
  role: string;
  personality: string;
  avatar: string;
  phone: string;
  relationship: string;
  bio: string;
  isSuspect: boolean;
  statusTag?: string;
}

export interface MessageItem {
  id: string;
  senderId: string; // 'sarah' or character id
  text?: string;
  timestamp: string; // e.g. "01:42 AM"
  timestampRaw?: string; // ISO or sortable
  status: 'sent' | 'delivered' | 'read';
  attachment?: {
    type: 'image' | 'audio' | 'location' | 'file';
    url?: string;
    caption?: string;
    duration?: string;
    fileMeta?: string;
  };
  isDeletedPlaceholder?: boolean;
  clueEvidenceId?: string; // when clicked/inspected, unlocks this evidence ID
  clueTooltip?: string;
}

export interface ConversationThread {
  id: string;
  participantId: string;
  unreadCount: number;
  pinned?: boolean;
  draftText?: string;
  messages: MessageItem[];
}

export interface PhotoExif {
  capturedAt: string;
  time: string;
  location: string;
  coordinates?: string;
  camera: string;
  aperture?: string;
  iso?: string;
  fileSize?: string;
  clueNotes?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  thumbnail: string;
  fullImage: string;
  category: 'selfie' | 'location' | 'screenshot' | 'suspicious' | 'daily';
  caption: string;
  exif: PhotoExif;
  hasHiddenClue?: boolean;
  clueEvidenceId?: string;
  clueRegion?: { x: number; y: number; width: number; height: number; description: string };
}

export interface CallLogItem {
  id: string;
  contactId: string;
  phoneNumber: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
  hasAudioVoicemail?: boolean;
  voicemailDuration?: string;
  voicemailTranscript?: string;
  voicemailAudioSrc?: string;
  hasRecoveredAudio?: boolean;
  recoveredAudioSrc?: string;
  recoveredAudioDurationSec?: number;
  clueEvidenceId?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  category: 'residence' | 'transit' | 'commercial' | 'danger' | 'work';
  coordinates: { x: number; y: number }; // Percentage 0-100 on fictional city map
  description: string;
  address: string;
  pings: {
    time: string;
    trackedPerson: string;
    details: string;
    clueEvidenceId?: string;
  }[];
}

export interface NoteItem {
  id: string;
  title: string;
  date: string;
  content: string;
  isPinned?: boolean;
  isLocked?: boolean;
  clueEvidenceId?: string;
}

export interface BrowserHistoryItem {
  id: string;
  title: string;
  url: string;
  time: string;
  snippet?: string;
  isBookmark?: boolean;
  clueEvidenceId?: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'text' | 'archive' | 'audio' | 'image' | 'video';
  modified: string;
  contentPreview?: string;
  isEncrypted?: boolean;
  decryptionHint?: string;
  downloadUrl?: string;
  clueEvidenceId?: string;
  isRecovered?: boolean;
  audioSrc?: string;
  audioDurationSec?: number;
  videoSrc?: string;
  videoDurationSec?: number;
  isCctvArchive?: boolean;
  unlockPrerequisites?: string[];
  isSecurityArchive?: boolean;
  isLocker28Archive?: boolean;
  isV17Archive?: boolean;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  category: EvidenceCategory;
  importance: EvidenceImportance;
  sourceApp: 'Messages' | 'Photos' | 'Phone' | 'Maps' | 'Notes' | 'Browser' | 'Files' | 'Contacts' | 'VoiceMemos' | 'System';
  timestamp: string;
  description: string;
  relatedCharacterId?: string;
  thumbnailIcon?: string;
  sourceDetail: string;
  isDiscovered?: boolean;
  tag?: string;
}

export interface Deduction {
  id: string;
  title: string;
  requiredEvidenceIds: string[]; // 2 or 3 evidence IDs
  contradictionType?: string; // e.g. "Alex's Alibi Contradiction"
  unlockedQuestion?: string; // "Why was Alex at the station?"
  insight: string;
  impactScore: number;
  revealsCharacterId?: string;
  isUnlocked?: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string; // e.g. "02:47 AM"
  order: number;
  title: string;
  description: string;
  source: string;
  associatedEvidenceId?: string;
  isKey317Event?: boolean;
  isLockedByDefault: boolean;
  unlockedByEvidenceId?: string;
}

export interface HintItem {
  id: string;
  tier: 1 | 2 | 3;
  costPoints: number;
  title: string;
  text: string;
  targetedEvidenceId?: string;
  targetedApp?: string;
}

export interface EndingData {
  id: 'true_ending' | 'wrong_suspect_alex' | 'wrong_suspect_ryan' | 'wrong_suspect_daniel' | 'incomplete_theory';
  type: 'solved' | 'failed' | 'incomplete';
  title: string;
  subtitle: string;
  narrative: string[];
  rebuttalPoints?: string[];
  scoreMultiplier: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'F';
}

export interface AccusationTheory {
  suspectId: string;
  locationId: string;
  criticalTime: string;
  keyActionMotive: string;
  supportingEvidenceIds: string[];
}

export interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Master';
  estimatedTime: string;
  victimName: string;
  victimAge: number;
  victimPhone: string;
  briefing: {
    synopsis: string;
    initialStatus: string;
    directives: string[];
  };
  characters: Character[];
  messages: ConversationThread[];
  photos: PhotoItem[];
  calls: CallLogItem[];
  locations: MapLocation[];
  notes: NoteItem[];
  browserHistory: BrowserHistoryItem[];
  files: FileItem[];
  evidenceList: EvidenceItem[];
  deductions: Deduction[];
  timeline: TimelineEvent[];
  hints: HintItem[];
  endings: Record<string, EndingData>;
  solution: {
    correctSuspectId: string;
    correctLocationId: string;
    correctCriticalTime: string;
    correctKeyActionMotive: string;
    mandatoryEvidenceIds: string[];
    mandatoryDeductionIds: string[];
  };
}

export interface CaseSaveState {
  caseId: string;
  caseStartedAt: number;
  elapsedSeconds: number;
  isCaseUnlocked: boolean;
  isPhoneUnlocked: boolean;
  discoveredEvidenceIds: string[];
  unlockedDeductionIds: string[];
  unlockedTimelineEventIds: string[];
  viewedAppIds: string[];
  usedHintIds: string[];
  submittedTheory?: AccusationTheory;
  caseFinished: boolean;
  activeEndingId?: string;
  calculatedScore?: {
    evidencePercent: number;
    deductionsPercent: number;
    hintsPenalty: number;
    timePenalty: number;
    accuracyBonus: number;
    finalScore: number;
    rank: 'S' | 'A' | 'B' | 'C' | 'F';
  };
}
