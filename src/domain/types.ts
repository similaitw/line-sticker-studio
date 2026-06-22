export type StickerType = 'static' | 'animated' | 'custom' | 'message' | 'big' | 'popup' | 'effect';
export type StickerCount = 8 | 16 | 24 | 32 | 40;
export type GenerationProvider = 'chatgpt' | 'gemini';
export type TaskKind = 'project-generation' | 'character-reference' | 'sticker-sheet' | 'animation-frames' | 'popup-frames' | 'effect-frames';
export type ProvenanceMark = 'none' | 'visible' | 'unknown';

export interface StickerSpec {
  type: StickerType; label: string; shortLabel: string; description: string;
  counts: readonly StickerCount[]; width: number; height: number;
  minWidth?: number; minHeight?: number; animated: boolean; secondaryAnimation: boolean;
  maxDurationMs?: number; minFrames?: number; maxFrames?: number; minLoops?: number; maxLoops?: number;
  accent: string;
}

export interface StickerAsset {
  id: string; name: string; dataUrl: string; width: number; height: number; bytes: number;
  hasTransparency: boolean; provenanceMark: ProvenanceMark; sourceProvider?: GenerationProvider; visualHash?: string;
  gridIndex: number; included: boolean; selectedAt?: number;
}

export interface AnimationFrame { id: string; dataUrl: string; delayMs: number }

export interface PhraseEntry {
  id: string; category: string; text: string; intent: string; tone: 'casual' | 'polite' | 'business' | 'cute';
}

export interface CaptionSlot {
  id: string; phraseId: string; text: string; category: string; intent: string; visible: boolean;
}

export interface StyleRecipe {
  primary: string; palette: string; outline: string; rendering: string; shape: string;
}

export interface ReferencePhoto {
  id: string; name: string; type: 'image/png' | 'image/jpeg' | 'image/webp';
  width: number; height: number; bytes: number; hash: string; order: number; primary: boolean;
}

export interface GenerationTask {
  id: string; kind: TaskKind; provider: GenerationProvider; stickerId?: string;
  status: 'ready' | 'exported' | 'imported'; createdAt: number;
}

export interface GenerationAttempt {
  id: string; taskId: string; provider: GenerationProvider; sourceHash: string;
  importedAt: number; provenanceMark: ProvenanceMark;
}

export interface ComplianceReport {
  checkedAt: number; blockingCount: number; warningCount: number;
}

export interface ProjectSettings {
  character: string; count: StickerCount; rows: number; columns: number; padding: number; fontSize: number; loops: number;
}

export interface StickerProject {
  version: 4; name: string; type: StickerType; generationProvider: GenerationProvider;
  settings: ProjectSettings; captionSlots: CaptionSlot[]; styleRecipe: StyleRecipe;
  referencePhotos: ReferencePhoto[]; photoRightsConfirmed: boolean;
  sourceDataUrl: string; stickers: StickerAsset[]; animationSets: Record<string, AnimationFrame[]>;
  generationTasks: GenerationTask[]; generationAttempts: GenerationAttempt[];
  rightsConfirmed: boolean; complianceReport: ComplianceReport; updatedAt: number;
}

export interface ValidationIssue {
  level: 'error' | 'warning' | 'success'; code: string; message: string; assetName?: string;
}
