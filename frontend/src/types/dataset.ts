export type DatasetCategory =
  | "Healthcare"
  | "Finance"
  | "E-commerce"
  | "Education"
  | "HR"
  | "Marketing"
  | "Retail"
  | "Cybersecurity"
  | "IoT"
  | "Logistics"
  | "Real Estate"
  | "Travel"
  | "Manufacturing"
  | "Customer Support"
  | "Social Media"
  | "Custom";

export type FieldType =
  | "String"
  | "Integer"
  | "Float"
  | "Boolean"
  | "Date"
  | "DateTime"
  | "Email"
  | "Phone"
  | "UUID"
  | "URL"
  | "Enum"
  | "Currency"
  | "Percentage"
  | "Address"
  | "Name"
  | "Company"
  | "Custom";

export type SyntheticStrategy =
  | "realistic_distribution"
  | "unique_identifier"
  | "categorical"
  | "sequence"
  | "range"
  | "pattern"
  | "correlated"
  | "gaussian"
  | "custom";

export interface FieldConstraints {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  pattern?: string;
  defaultValue?: string;
  dateFormat?: string;
}

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  description: string;
  required: boolean;
  nullable: boolean;
  syntheticStrategy: SyntheticStrategy;
  constraints?: FieldConstraints;
}

export interface AdvancedSettings {
  realism: "Low" | "Medium" | "High";
  randomness: number; // 0 - 100
  missingValues: number; // % missing
  duplicateRate: number; // % duplicates
  outlierRate: "None" | "Low" | "Medium" | "High";
  classImbalance: "Balanced" | "Skewed" | "Extreme";
  noiseLevel: "None" | "Low" | "Medium";
  locale: string;
  country: string;
  language: string;
  startDate?: string;
  endDate?: string;
  seed?: number;
}

export interface DatasetStats {
  schemaValidityPct: number;
  missingValuesPct: number;
  duplicatePct: number;
  outlierPct: number;
  distributionScorePct: number;
  overallQualityPct: number;
}

export interface DatasetGenerationMetadata {
  datasetName: string;
  domain: string;
  mlTask: string;
  numberOfRecords: number;
  numberOfFields: number;
  fieldNames: string[];
  fieldTypes: string[];
  outputFormat: string; // "JSON", "CSV", or "JSON & CSV"
  generationTimeMs: number;
  validationTimeMs: number;
  validRecords: number;
  invalidRecords: number;
  totalGenerationAttempts: number;
  modelLLM: string;
  numberOfRuns: number;
}

export interface GeneratedDataset {
  id: string;
  name: string;
  category: DatasetCategory;
  description: string;
  fields: FieldDefinition[];
  sampleRows: Record<string, any>[];
  recordCount: number;
  fieldCount: number;
  createdAt: string;
  updatedAt: string;
  status: "Completed" | "Generating" | "Failed";
  qualityScore: number;
  stats: DatasetStats;
  settings: AdvancedSettings;
  sizeBytes?: number;
  mlTask?: string;
  outputFormat?: string;
  metadata?: DatasetGenerationMetadata;
  userId?: string;
}

export interface CategoryInfo {
  id: DatasetCategory;
  name: string;
  iconName: string;
  description: string;
  recommendedFields: FieldDefinition[];
  examplePrompt: string;
}

export interface TemplateInfo {
  id: string;
  title: string;
  category: DatasetCategory;
  description: string;
  iconName: string;
  recommendedSize: number;
  fields: FieldDefinition[];
  tags: string[];
  mlTask?: string;
  outputFormat?: string;
}

export type AIProvider = "Google Gemini" | "OpenAI" | "Anthropic";

export interface AISettings {
  provider: AIProvider;
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  selectedModel: string;
}
