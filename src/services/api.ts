import {
  ApiStatusResponse,
  ChannelProfile,
  VideoFormat,
  VideoIdea,
  ThumbnailConcept,
} from '../types';

export function parseCleanError(rawError: any): string {
  if (!rawError) return 'Terjadi kendala pada server.';
  const str = typeof rawError === 'string' ? rawError : rawError.message || JSON.stringify(rawError);
  const lower = str.toLowerCase();

  if (
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate-limit') ||
    lower.includes('rate limits')
  ) {
    return 'Batas kuota gratis Gemini API tercapai (Error 429). Mohon tunggu sekitar 20-30 detik sebelum mencoba lagi.';
  }

  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('capacity') ||
    lower.includes('deadline_exceeded') ||
    lower.includes('504')
  ) {
    return 'Server AI saat ini sedang memproses antrean permintaan tinggi (High Demand). Silakan coba kembali dalam beberapa detik.';
  }

  try {
    const parsed = JSON.parse(str);
    if (parsed.error?.message) {
      return parseCleanError(parsed.error.message);
    }
  } catch {}

  return str;
}

export const ApiService = {
  async getStatus(): Promise<ApiStatusResponse> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) {
        throw new Error('Gagal memeriksa status API.');
      }
      return await res.json();
    } catch (err: any) {
      return {
        ok: false,
        hasApiKey: false,
        model: 'gemini-3.8-flash',
        ttsModel: 'gemini-3.8-flash-lite-tts',
        imageModel: 'gemini-3.1-flash-lite-image',
        channelDefault: 'Revisitekno',
      };
    }
  },

  async sendChat(
    messages: { role: string; content: string }[],
    channelProfile: ChannelProfile,
    currentContext?: any
  ): Promise<string> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, channelProfile, currentContext }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return data.reply;
  },

  async generateIdeas(payload: {
    topic: string;
    audience: string;
    format: VideoFormat;
    objective: string;
    tone: string;
    additionalNotes?: string;
    channelProfile: ChannelProfile;
  }): Promise<{ ideas: Omit<VideoIdea, 'id' | 'createdAt' | 'updatedAt'>[]; isFallback?: boolean; notice?: string }> {
    const res = await fetch('/api/ideas/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return {
      ideas: data.ideas || [],
      isFallback: data.isFallback,
      notice: data.notice,
    };
  },

  async generateScript(payload: {
    topic: string;
    title: string;
    audience: string;
    format: VideoFormat;
    duration: string;
    tone: string;
    objective: string;
    talkingPoints: string[];
    researchNotes?: string;
    additionalNotes?: string;
  }): Promise<{ script: string; isFallback?: boolean; notice?: string }> {
    const res = await fetch('/api/scripts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return {
      script: data.script || '',
      isFallback: data.isFallback,
      notice: data.notice,
    };
  },

  async refineScript(payload: {
    action: string;
    selectedText: string;
    fullScriptContext?: string;
    instruction?: string;
  }): Promise<string> {
    const res = await fetch('/api/scripts/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return data.refinedText || '';
  },

  async generateThumbnailConcepts(payload: {
    title: string;
    topic: string;
    audience: string;
    style: string;
    notes?: string;
    channelProfile: ChannelProfile;
  }): Promise<{ concepts: Omit<ThumbnailConcept, 'id' | 'createdAt' | 'updatedAt'>[]; isFallback?: boolean; notice?: string }> {
    const res = await fetch('/api/thumbnails/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return {
      concepts: data.concepts || [],
      isFallback: data.isFallback,
      notice: data.notice,
    };
  },

  async generateThumbnailImage(payload: string | { prompt: string; title?: string; textOverlay?: string }): Promise<{ imageUrl: string; isFallback?: boolean; notice?: string }> {
    const body = typeof payload === 'string' ? { prompt: payload } : payload;
    const res = await fetch('/api/thumbnails/preview-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return {
      imageUrl: data.imageUrl || '',
      isFallback: data.isFallback,
      notice: data.notice,
    };
  },

  async synthesizeSpeech(payload: {
    text: string;
    voiceName?: string;
    style?: string;
  }): Promise<{ audioBase64: string; mimeType: string; voiceName: string; charCount: number }> {
    const res = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return data;
  },

  async combineSpeechChunks(
    chunks: string[]
  ): Promise<{ combinedAudioBase64: string; mimeType: string; chunkCount: number }> {
    const res = await fetch('/api/tts/combine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chunks }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return data;
  },

  async generateSeoPackage(payload: {
    videoTitle: string;
    videoTopic: string;
    mainKeyword: string;
    videoScript?: string;
    videoFormat: 'Shorts' | 'Long-form';
    targetAudience: string;
    channelProfile?: ChannelProfile;
  }): Promise<{
    alternativeTitles: string[];
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
    isFallback?: boolean;
    notice?: string;
  }> {
    const res = await fetch('/api/seo/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(parseCleanError(data.error));
    }
    return data;
  },
};
