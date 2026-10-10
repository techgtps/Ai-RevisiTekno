export type VideoFormat =
  | 'YouTube Shorts'
  | 'Long-form YouTube'
  | 'Review & Hands-on'
  | 'Tutorial & How-to'
  | 'Perbandingan (VS)'
  | 'Explainer & Analisis'
  | 'Storytelling & Tech History';

export type PlanStatus =
  | 'Idea'
  | 'Planning'
  | 'In Production'
  | 'Editing'
  | 'Ready to Publish'
  | 'Published';

export type ScriptStatus =
  | 'Draft'
  | 'In Revision'
  | 'Ready for Recording'
  | 'Recorded';

export interface ChannelProfile {
  channelName: string;
  niche: string;
  targetAudience: string;
  preferredFormats: VideoFormat[];
  preferredLanguage: string;
  preferredTone: string;
  creatorGuidelines: string;
  contentObjective: string;
}

export interface VideoIdea {
  id: string;
  title: string;
  coreConcept: string;
  hook: string;
  viewerProblem: string;
  talkingPoints: string[];
  structure: string;
  thumbnailDirection: string;
  difficulty: 'Rendah' | 'Sedang' | 'Tinggi';
  researchNeeded: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface VideoPlan {
  id: string;
  title: string;
  topic: string;
  contentObjective: string;
  targetAudience: string;
  videoFormat: VideoFormat;
  summary: string;
  hook: string;
  talkingPoints: string[];
  researchNotes: string;
  checklist: PlanChecklistItem[];
  linkedScriptId?: string;
  linkedThumbnailId?: string;
  linkedSeoId?: string;
  scheduledPublishDate?: string;
  targetDate?: string;
  personalNotes?: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptItem {
  id: string;
  title: string;
  topic: string;
  targetAudience: string;
  videoFormat: VideoFormat;
  targetDuration: string;
  tone: string;
  objective: string;
  content: string;
  wordCount: number;
  estimatedDurationMinutes: number;
  status: ScriptStatus;
  linkedPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThumbnailConcept {
  id: string;
  title: string;
  topic: string;
  conceptName: string;
  mainSubject: string;
  composition: string;
  focalPoint: string;
  background: string;
  colors: string[];
  textOverlay: string;
  textPlacement: string;
  contrastAndReadability: string;
  imagePrompt: string;
  generatedImageUrl?: string;
  linkedPlanId?: string;
  linkedScriptId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    actionSuggested?: 'save-idea' | 'create-plan' | 'send-script';
    suggestedData?: any;
  };
}

export interface TTSVoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  description: string;
  tone: string;
}

export interface TTSChunkItem {
  id: string;
  order: number;
  text: string;
  status: 'idle' | 'generating' | 'ready' | 'error';
  audioBase64?: string;
  audioUrl?: string;
  error?: string;
  durationEstimateSec?: number;
}

export interface AppActivity {
  id: string;
  action: string;
  itemType: 'idea' | 'plan' | 'script' | 'thumbnail' | 'voice' | 'seo' | 'settings';
  title: string;
  timestamp: string;
}

export interface UploadChecklist {
  titleReviewed: boolean;
  descriptionReviewed: boolean;
  tagsReviewed: boolean;
  thumbnailReady: boolean;
  videoChecked: boolean;
  scheduleSelected: boolean;
}

export interface SeoPackage {
  id: string;
  videoTitle: string;
  videoTopic: string;
  mainKeyword: string;
  videoFormat: 'Shorts' | 'Long-form';
  targetAudience: string;
  scriptSummary?: string;
  alternativeTitles: string[];
  selectedTitle: string;
  description: string;
  hashtags: string[];
  tags: string[];
  tagCharactersCount: number;
  recommendedSchedule: {
    dayOfWeek: string;
    timeWindow: string;
    timezone: string;
    reasoning: string;
    isEstimate: boolean;
  };
  scheduledDateTime?: string;
  checklist: UploadChecklist;
  linkedPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultFormat: VideoFormat;
  defaultTone: string;
  defaultVoiceMode: 'simple' | 'pro';
  defaultVoice: string;
  speechRate: number;
  autoSaveLocal: boolean;
}

export interface ApiStatusResponse {
  ok: boolean;
  hasApiKey: boolean;
  model: string;
  ttsModel: string;
  imageModel: string;
  channelDefault: string;
}

