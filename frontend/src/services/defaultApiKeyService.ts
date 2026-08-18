import { getActiveUserId } from "./authService";

function getDefaultUsageStorageKey(): string {
  return `datagen_usage_window_${getActiveUserId()}`;
}

export const DEFAULT_FREE_DATASETS_LIMIT = 3;
const RECYCLE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface DefaultApiCheckResult {
  allowed: boolean;
  isCustomKey: boolean;
  reason?: "cooldown" | "row_limit";
  nextAvailableDate?: Date;
  message?: string;
}

export interface DefaultApiUsage {
  history: string[]; // ISO timestamp strings
}

export const hasCustomApiKey = (): boolean => {
  try {
    const raw = localStorage.getItem("datagen_ai_settings");
    if (raw) {
      const parsed = JSON.parse(raw);
      return !!(parsed.geminiApiKey || parsed.openaiApiKey || parsed.anthropicApiKey);
    }
  } catch (e) {
    console.error("Failed to check custom API key", e);
  }
  return false;
};

export const getDefaultApiUsage = (): { 
  history: string[]; 
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
      const now = Date.now();
      const validHistory = (parsed.history || []).filter(ts => {
        return (now - new Date(ts).getTime()) < RECYCLE_WINDOW_MS;
      });

      if (validHistory.length !== (parsed.history || []).length) {
        localStorage.setItem(usageKey, JSON.stringify({ history: validHistory }));
      }

      if (validHistory.length >= DEFAULT_FREE_DATASETS_LIMIT) {
        const oldestTime = new Date(validHistory[0]).getTime();
        const nextDate = new Date(oldestTime + RECYCLE_WINDOW_MS);
        const msRemaining = Math.max(0, nextDate.getTime() - now);
        return {
          history: validHistory,
          count: validHistory.length,
          limit: DEFAULT_FREE_DATASETS_LIMIT,
          nextAvailableDate: nextDate,
          msRemaining,
        };
      }

      return {
        history: validHistory,
        count: validHistory.length,
        limit: DEFAULT_FREE_DATASETS_LIMIT,
        nextAvailableDate: null,
        msRemaining: 0,
      };
    }
  } catch (e) {
    console.error("Failed to read default API usage", e);
  }
  return { history: [], count: 0, limit: DEFAULT_FREE_DATASETS_LIMIT, nextAvailableDate: null, msRemaining: 0 };
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
  const isCustom = hasCustomApiKey();
  const maxLimit = isCustom ? 100000 : 5000;

  if (requestedRows > maxLimit) {
    return {
      allowed: false,
      isCustomKey: isCustom,
      reason: "row_limit",
      message: isCustom
        ? `Maximum ${maxLimit.toLocaleString()} rows allowed per dataset with custom API key.`
        : "Maximum 5,000 rows are allowed on standard free tier. Add your custom API key in Settings to generate up to 100,000 rows.",
    };
  }

  if (isCustom) {
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
      message: `Weekly generation limit reached (3 datasets per 7 days). Next dataset generation will reset on ${unlockStr}. Add your own API key in Settings for unlimited generations.`,
    };
  }

  return { allowed: true, isCustomKey: false };
};

export const recordDefaultApiUsage = (): void => {
  if (hasCustomApiKey()) return; // Don't count against free quota if custom key is used
  const usageKey = getDefaultUsageStorageKey();
  const current = getDefaultApiUsage();
  const newHistory = [...current.history, new Date().toISOString()];
  try {
    localStorage.setItem(usageKey, JSON.stringify({ history: newHistory }));
  } catch (e) {
    console.error("Failed to record default API usage", e);
  }
};
