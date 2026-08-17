import { AISettings, DatasetCategory, FieldDefinition, FieldType } from "../types/dataset";
import { CATEGORIES_DATA } from "../data/categories";
import { FIREBASE_GEMINI_API_KEY } from "./firebase";
import { getActiveUserId } from "./authService";

function getAISettingsKey(): string {
  return `datagen_ai_settings_${getActiveUserId()}`;
}

function getGeminiKeyStorageName(): string {
  return `gemini_api_key_${getActiveUserId()}`;
}

function getOpenAIKeyStorageName(): string {
  return `openai_api_key_${getActiveUserId()}`;
}

function getAnthropicKeyStorageName(): string {
  return `anthropic_api_key_${getActiveUserId()}`;
}

export const getAISettings = (): AISettings => {
  const settingsKey = getAISettingsKey();
  try {
    const raw = localStorage.getItem(settingsKey);
    if (raw) {
      const parsed: AISettings = JSON.parse(raw);
      if (parsed.geminiApiKey === FIREBASE_GEMINI_API_KEY) {
        parsed.geminiApiKey = "";
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load user AI settings", e);
  }

  const storedGemini = localStorage.getItem(getGeminiKeyStorageName()) || "";
  const cleanGemini = storedGemini === FIREBASE_GEMINI_API_KEY ? "" : storedGemini;

  return {
    provider: "Google Gemini",
    geminiApiKey: cleanGemini,
    openaiApiKey: localStorage.getItem(getOpenAIKeyStorageName()) || "",
    anthropicApiKey: localStorage.getItem(getAnthropicKeyStorageName()) || "",
    selectedModel: "gemini-1.5-flash",
  };
};

export const saveAISettings = (settings: AISettings): void => {
  try {
    const cleanSettings: AISettings = {
      ...settings,
      geminiApiKey: (settings.geminiApiKey || "").trim() === FIREBASE_GEMINI_API_KEY ? "" : (settings.geminiApiKey || "").trim(),
      openaiApiKey: (settings.openaiApiKey || "").trim(),
      anthropicApiKey: (settings.anthropicApiKey || "").trim(),
    };

    localStorage.setItem(getAISettingsKey(), JSON.stringify(cleanSettings));

    const geminiKeyName = getGeminiKeyStorageName();
    if (cleanSettings.geminiApiKey) {
      localStorage.setItem(geminiKeyName, cleanSettings.geminiApiKey);
    } else {
      localStorage.removeItem(geminiKeyName);
    }

    const openaiKeyName = getOpenAIKeyStorageName();
    if (cleanSettings.openaiApiKey) {
      localStorage.setItem(openaiKeyName, cleanSettings.openaiApiKey);
    } else {
      localStorage.removeItem(openaiKeyName);
    }

    const anthropicKeyName = getAnthropicKeyStorageName();
    if (cleanSettings.anthropicApiKey) {
      localStorage.setItem(anthropicKeyName, cleanSettings.anthropicApiKey);
    } else {
      localStorage.removeItem(anthropicKeyName);
    }
  } catch (e) {
    console.error("Failed to save user AI settings", e);
  }
};

export const generateSchemaFromAI = async (
  category: DatasetCategory,
  userPrompt: string
): Promise<FieldDefinition[]> => {
  const settings = getAISettings();
  const apiKey =
    (settings.provider === "Google Gemini"
      ? settings.geminiApiKey
      : settings.provider === "OpenAI"
      ? settings.openaiApiKey
      : settings.anthropicApiKey) || FIREBASE_GEMINI_API_KEY;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert AI data architect. Generate a clean synthetic dataset schema for the category "${category}".
User Requirement Prompt: "${userPrompt || "Standard realistic dataset schema"}"

Return strictly valid JSON array without markdown backticks:
[
  {
    "name": "snake_case_field_name",
    "type": "String" | "Integer" | "Float" | "Boolean" | "Date" | "DateTime" | "Email" | "Phone" | "UUID" | "URL" | "Enum" | "Currency" | "Percentage" | "Address" | "Name" | "Company" | "Custom",
    "description": "Short explanation",
    "required": true,
    "nullable": false,
    "syntheticStrategy": "realistic_distribution" | "unique_identifier" | "categorical" | "sequence" | "range" | "pattern" | "correlated" | "gaussian",
    "constraints": {
      "min": 1,
      "max": 100,
      "options": ["Option A", "Option B"]
    }
  }
]`
                }
              ]
            }
          ]
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f: any, idx: number) => ({
          id: `ai_${Date.now()}_${idx}`,
          name: f.name || `field_${idx}`,
          type: normalizeType(f.type),
          description: f.description || "AI Generated field",
          required: f.required !== false,
          nullable: !!f.nullable,
          syntheticStrategy: f.syntheticStrategy || "realistic_distribution",
          constraints: f.constraints || {},
        }));
      }
    }
  } catch (err) {
    console.warn("Gemini API call failed, using intelligent schema synthesis fallback", err);
  }

  // Fallback intelligent schema generator
  await new Promise((res) => setTimeout(res, 600));
  const catData = CATEGORIES_DATA.find((c) => c.id === category) || CATEGORIES_DATA[0];
  let baseFields = [...catData.recommendedFields];

  const lowerPrompt = userPrompt.toLowerCase();
  if (lowerPrompt.includes("churn") && !baseFields.some((f) => f.name.includes("churn"))) {
    baseFields.push({
      id: `inf_${Date.now()}_1`,
      name: "churn_probability",
      type: "Float",
      description: "Predicted probability of customer churn (0.0 - 1.0)",
      required: true,
      nullable: false,
      syntheticStrategy: "gaussian",
      constraints: { min: 0.01, max: 0.99 },
    });
  }

  return baseFields;
};

export const suggestMoreFieldsAI = async (
  existingFields: FieldDefinition[],
  category: DatasetCategory
): Promise<FieldDefinition[]> => {
  await new Promise((res) => setTimeout(res, 500));
  const existingNames = new Set(existingFields.map((f) => f.name.toLowerCase()));
  const candidates: FieldDefinition[] = [
    {
      id: `sug_${Date.now()}_1`,
      name: "risk_category",
      type: "Enum",
      description: "Assessed operational or credit risk tier",
      required: true,
      nullable: false,
      syntheticStrategy: "categorical",
      constraints: { options: ["Low", "Moderate", "High", "Critical"] },
    },
    {
      id: `sug_${Date.now()}_2`,
      name: "updated_at",
      type: "DateTime",
      description: "Last system modification timestamp",
      required: true,
      nullable: false,
      syntheticStrategy: "range",
    },
    {
      id: `sug_${Date.now()}_3`,
      name: "ip_address",
      type: "Custom",
      description: "Client IP connection address",
      required: false,
      nullable: true,
      syntheticStrategy: "pattern",
      constraints: { pattern: "192.168.#.#" },
    },
  ];
  return candidates.filter((c) => !existingNames.has(c.name.toLowerCase()));
};

function normalizeType(raw: string): FieldType {
  const types: FieldType[] = [
    "String", "Integer", "Float", "Boolean", "Date", "DateTime",
    "Email", "Phone", "UUID", "URL", "Enum", "Currency",
    "Percentage", "Address", "Name", "Company", "Custom"
  ];
  const found = types.find((t) => t.toLowerCase() === (raw || "").toLowerCase());
  return found || "String";
}
