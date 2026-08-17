import { getAISettings } from "./aiProviderService";
import { FIREBASE_GEMINI_API_KEY } from "./firebase";
import { getActiveUserId } from "./authService";

function getDefaultUsageStorageKey(): string {
  return `datagen_default_api_usage_${getActiveUserId()}`;
}

export const DEFAULT_FREE_DATASETS_LIMIT = 3;
const RECYCLE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface DefaultApiCheckResult {
  allowed: boolean;
  isCustomKey: boolean;
  reason?: "cooldown" | "row_limit";
  nextAvailableDate?: Date;
  message?: string;
}

export interface DefaultApiUsage {
  lastGeneratedAt: string | null;
  count: number;
}

export const hasCustomApiKey = (): boolean => {
  try {
    const settings = getAISettings();
    const customGemini = !!(settings.geminiApiKey && settings.geminiApiKey.trim() !== "" && settings.geminiApiKey.trim() !== FIREBASE_GEMINI_API_KEY.trim());
    const customOpenAI = !!(settings.openaiApiKey && settings.openaiApiKey.trim());
    const customAnthropic = !!(settings.anthropicApiKey && settings.anthropicApiKey.trim());

    const activeUserId = getActiveUserId();
    const directGemini = localStorage.getItem(`gemini_api_key_${activeUserId}`) || localStorage.getItem("gemini_api_key") || "";
    const directOpenAI = localStorage.getItem(`openai_api_key_${activeUserId}`) || localStorage.getItem("openai_api_key") || "";
    const directAnthropic = localStorage.getItem(`anthropic_api_key_${activeUserId}`) || localStorage.getItem("anthropic_api_key") || "";

    const hasDirectCustom = 
      (directGemini && directGemini.trim() !== "" && directGemini.trim() !== FIREBASE_GEMINI_API_KEY.trim()) ||
      !!directOpenAI.trim() ||
      !!directAnthropic.trim();

    return Boolean(customGemini || customOpenAI || customAnthropic || hasDirectCustom);
  } catch (e) {
    console.error("Error checking custom API key status", e);
    return false;
  }
};

export const getDefaultApiUsage = (): { 
  lastGeneratedAt: string | null; 
  count: number; 
  limit: number;
  nextAvailableDate: Date | null;
  msRemaining: number;
} => {
  const usageKey = getDefaultUsageStorageKey();
  try {
    const raw = localStorage.getItem(usageKey);
    if (raw) {
      const parsed: DefaultApiUsage = JSON.parse(raw);
      if (parsed.lastGeneratedAt) {
        const lastTime = new Date(parsed.lastGeneratedAt).getTime();
        const now = Date.now();
        const elapsed = now - lastTime;
        if (elapsed >= RECYCLE_WINDOW_MS) {
          localStorage.removeItem(usageKey);
          return { lastGeneratedAt: null, count: 0, limit: DEFAULT_FREE_DATASETS_LIMIT, nextAvailableDate: null, msRemaining: 0 };
        } else {
          const nextDate = new Date(lastTime + RECYCLE_WINDOW_MS);
          const msRemaining = Math.max(0, nextDate.getTime() - now);
          return { 
            lastGeneratedAt: parsed.lastGeneratedAt, 
            count: Math.min(parsed.count, DEFAULT_FREE_DATASETS_LIMIT), 
            limit: DEFAULT_FREE_DATASETS_LIMIT,
            nextAvailableDate: nextDate,
            msRemaining
          };
        }
      }
    }
  } catch (e) {
    console.error("Failed to read default API usage", e);
  }
  return { lastGeneratedAt: null, count: 0, limit: DEFAULT_FREE_DATASETS_LIMIT, nextAvailableDate: null, msRemaining: 0 };
};

export const formatCountdownMs = (ms: number): string => {
  if (ms <= 0) return "00h 00m 00s";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
};

export const checkDefaultApiLimit = (requestedRows: number): DefaultApiCheckResult => {
  if (hasCustomApiKey()) {
    return { allowed: true, isCustomKey: true };
  }

  const usage = getDefaultApiUsage();

  if (usage.count >= DEFAULT_FREE_DATASETS_LIMIT && usage.nextAvailableDate) {
    const unlockStr = usage.nextAvailableDate.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      allowed: false,
      isCustomKey: false,
      reason: "cooldown",
      nextAvailableDate: usage.nextAvailableDate,
      message: `You have reached the default API key limit (${DEFAULT_FREE_DATASETS_LIMIT} free datasets). Recycling reset available on ${unlockStr}. Add your own custom API key in Settings to unlock unlimited generation with no cooldown!`,
    };
  }

  if (requestedRows > 5000) {
    return {
      allowed: false,
      isCustomKey: false,
      reason: "row_limit",
      message: "The dataset limit for the default API key is 5,000 records. Please reduce your row count to 5,000 or add your own API key in Settings for unlimited records!",
    };
  }

  return { allowed: true, isCustomKey: false };
};

export const recordDefaultApiUsage = (): void => {
  if (hasCustomApiKey()) {
    return;
  }

  const current = getDefaultApiUsage();
  const nextCount = current.count + 1;
  const data: DefaultApiUsage = {
    lastGeneratedAt: current.lastGeneratedAt || new Date().toISOString(),
    count: nextCount,
  };

  try {
    localStorage.setItem(getDefaultUsageStorageKey(), JSON.stringify(data));
  } catch (e) {
    console.error("Failed to record default API usage", e);
  }
};
