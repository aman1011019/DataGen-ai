import { AISettings, DatasetCategory, FieldDefinition, FieldType } from "../types/dataset";
import { CATEGORIES_DATA } from "../data/categories";

export const getAISettings = (): AISettings => {
  return {
    provider: "Google Gemini (Server)",
    geminiApiKey: "••••••••",
    openaiApiKey: "",
    anthropicApiKey: "",
    selectedModel: "gemini-2.5-flash",
  };
};

export const saveAISettings = (_settings: AISettings): void => {
  // AI models run securely on the server
};

export const generateSchemaFromAI = async (
  category: DatasetCategory,
  userPrompt: string
): Promise<FieldDefinition[]> => {
  try {
    const response = await fetch("/api/ai/schema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, prompt: userPrompt }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.fields) && data.fields.length > 0) {
        return data.fields.map((f: any, idx: number) => ({
          id: f.id || `ai_srv_${Date.now()}_${idx}`,
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
    console.warn("Server AI schema call notice:", err);
  }

  // Fallback intelligent schema generator
  const catData = CATEGORIES_DATA.find((c) => c.id === category) || CATEGORIES_DATA[0];
  let baseFields = [...catData.recommendedFields];

  const lowerPrompt = (userPrompt || "").toLowerCase();
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
  try {
    const response = await fetch("/api/ai/suggest-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, existing_fields: existingFields }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        const existingNames = new Set(existingFields.map((f) => f.name.toLowerCase()));
        return data.suggestions
          .map((f: any, idx: number) => ({
            id: f.id || `sug_${Date.now()}_${idx}`,
            name: f.name || `suggested_field_${idx}`,
            type: normalizeType(f.type),
            description: f.description || "AI Suggested field",
            required: f.required !== false,
            nullable: !!f.nullable,
            syntheticStrategy: f.syntheticStrategy || "realistic_distribution",
            constraints: f.constraints || {},
          }))
          .filter((c: FieldDefinition) => !existingNames.has(c.name.toLowerCase()));
      }
    }
  } catch (err) {
    console.warn("Server AI suggest fields notice:", err);
  }

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
      name: "compliance_status",
      type: "Enum",
      description: "Regulatory compliance verification state",
      required: true,
      nullable: false,
      syntheticStrategy: "categorical",
      constraints: { options: ["Compliant", "Non-Compliant", "Under Review"] },
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
