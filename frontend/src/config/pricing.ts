export interface PlanLimits {
  datasets: number;        // 1 or Infinity
  rowsPerDataset: number;  // 500 or Infinity
  fieldsPerDataset: number;// 20 or Infinity
  teamMembers: number;     // 1 or Infinity
  apiAccess: boolean;
  excelExport: boolean;
  qualityAnalysis: boolean;
  priorityGeneration: boolean;
}

export interface PlanConfig {
  id: "normal" | "pro" | "business";
  name: string;
  badge?: string;
  tagline: string;
  priceMonthly: number; // in INR
  priceYearly: number;  // in INR (20% discount optional)
  currency: string;
  interval: "month" | "year";
  popular?: boolean;
  enterprise?: boolean;
  limits: PlanLimits;
  features: string[];
  unavailableFeatures?: string[];
  ctaText: string;
}

export const PLANS: Record<string, PlanConfig> = {
  normal: {
    id: "normal",
    name: "Normal",
    tagline: "For students, individuals, and small test datasets.",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "₹",
    interval: "month",
    limits: {
      datasets: 1,
      rowsPerDataset: 500,
      fieldsPerDataset: 20,
      teamMembers: 1,
      apiAccess: false,
      excelExport: false,
      qualityAnalysis: false,
      priorityGeneration: false,
    },
    features: [
      "1 Dataset Limit",
      "Maximum 500 rows per dataset",
      "Up to 20 fields schema",
      "Basic AI schema generation",
      "CSV & JSON exports",
      "Basic pre-engineered templates",
      "Standard generation queue",
      "Community support",
    ],
    unavailableFeatures: [
      "Excel (.xlsx) export",
      "Unlimited datasets & rows",
      "Advanced AI quality scorecards",
      "Team workspaces & role management",
      "REST API access & Webhooks",
    ],
    ctaText: "Start Free",
  },
  pro: {
    id: "pro",
    name: "Pro",
    badge: "MOST POPULAR",
    popular: true,
    tagline: "For developers, researchers, startups, and power users.",
    priceMonthly: 499,
    priceYearly: 4790, // discounted yearly
    currency: "₹",
    interval: "month",
    limits: {
      datasets: Infinity,
      rowsPerDataset: Infinity,
      fieldsPerDataset: Infinity,
      teamMembers: 1,
      apiAccess: false,
      excelExport: true,
      qualityAnalysis: true,
      priorityGeneration: true,
    },
    features: [
      "Unlimited Datasets",
      "Unlimited Rows per dataset",
      "Unlimited Fields schema",
      "Advanced AI Schema Generation (Gemini/GPT-4)",
      "CSV, JSON & Excel (.xlsx) exports",
      "AI Dataset Quality & Bias Analysis",
      "All pre-engineered & custom templates",
      "High-priority generation queue",
      "Dataset history & cloning",
      "Priority email support",
    ],
    unavailableFeatures: [
      "Team workspaces & role management",
      "REST API access & Webhooks",
      "Dedicated account manager",
    ],
    ctaText: "Upgrade to Pro",
  },
  business: {
    id: "business",
    name: "Business",
    badge: "ENTERPRISE READY",
    enterprise: true,
    tagline: "For teams, organizations, and commercial data products.",
    priceMonthly: 1499,
    priceYearly: 14390,
    currency: "₹",
    interval: "month",
    limits: {
      datasets: Infinity,
      rowsPerDataset: Infinity,
      fieldsPerDataset: Infinity,
      teamMembers: Infinity,
      apiAccess: true,
      excelExport: true,
      qualityAnalysis: true,
      priorityGeneration: true,
    },
    features: [
      "Everything in Pro, PLUS:",
      "Unlimited Datasets & Unlimited Rows",
      "Team Workspaces & Organization Management",
      "Multi-user Role-Based Access Control (RBAC)",
      "Shared Team Schemas & Templates",
      "Developer REST API & Webhooks Access",
      "Audit Logs & Security Governance",
      "Dedicated Generation Infrastructure",
      "Enterprise SLA & Priority 24/7 Support",
    ],
    ctaText: "Start Business",
  },
};

export const COMPARISON_CATEGORIES = [
  {
    category: "Dataset & Row Capacity",
    items: [
      { name: "Max Datasets", normal: "1 Dataset", pro: "Unlimited", business: "Unlimited" },
      { name: "Max Rows per Dataset", normal: "500 Rows", pro: "Unlimited", business: "Unlimited" },
      { name: "Max Fields per Schema", normal: "20 Fields", pro: "Unlimited", business: "Unlimited" },
    ],
  },
  {
    category: "AI Generation & Features",
    items: [
      { name: "Basic AI Schema Generation", normal: true, pro: true, business: true },
      { name: "Advanced Multi-Model AI Engine", normal: false, pro: true, business: true },
      { name: "Smart Field Suggestions", normal: true, pro: true, business: true },
      { name: "Quality & Bias Scorecards", normal: false, pro: true, business: true },
    ],
  },
  {
    category: "Export Formats",
    items: [
      { name: "CSV Export", normal: true, pro: true, business: true },
      { name: "JSON Export", normal: true, pro: true, business: true },
      { name: "Excel (.xlsx) Export", normal: false, pro: true, business: true },
    ],
  },
  {
    category: "Team & Enterprise",
    items: [
      { name: "Team Workspaces", normal: false, pro: false, business: true },
      { name: "Role-Based Access (RBAC)", normal: false, pro: false, business: true },
      { name: "Developer REST API Access", normal: false, pro: false, business: true },
      { name: "Audit Logs & Governance", normal: false, pro: false, business: true },
      { name: "Priority Support SLA", normal: "Basic", pro: "Priority", business: "24/7 Dedicated" },
    ],
  },
];
