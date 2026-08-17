import { TemplateInfo } from "../types/dataset";
import { CATEGORIES_DATA } from "./categories";

export const PREBUILT_TEMPLATES: TemplateInfo[] = [
  {
    id: "tmpl-customer-churn",
    title: "Customer Churn Prediction",
    category: "Finance",
    mlTask: "Classification",
    outputFormat: "JSON & CSV",
    description: "Benchmark telecom/fintech dataset designed for churn prediction models with customer tenure, monthly charges, contract type, and churn status.",
    iconName: "UserMinus",
    recommendedSize: 10000,
    tags: ["Classification", "Machine Learning", "Telco", "Finance"],
    fields: [
      { id: "cc1", name: "customer_id", type: "UUID", description: "Unique subscriber ID", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "cc2", name: "tenure_months", type: "Integer", description: "Subscription duration in months", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1, max: 72 } },
      { id: "cc3", name: "monthly_charges", type: "Currency", description: "Billed monthly amount ($)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 18.5, max: 120.0 } },
      { id: "cc4", name: "total_charges", type: "Currency", description: "Lifetime accumulated charges ($)", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "cc5", name: "contract_type", type: "Enum", description: "Billing contract commitment", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Month-to-month", "One year", "Two year"] } },
      { id: "cc6", name: "payment_method", type: "Enum", description: "Active payment channel", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"] } },
      { id: "cc7", name: "tech_support", type: "Boolean", description: "Subscribed to premium tech support", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "cc8", name: "churn", type: "Boolean", description: "Customer churn outcome target label", required: true, nullable: false, syntheticStrategy: "realistic_distribution" }
    ]
  },
  {
    id: "tmpl-patient-diabetes",
    title: "Clinical Patient Records (Diabetes)",
    category: "Healthcare",
    mlTask: "Classification",
    outputFormat: "JSON & CSV",
    description: "Clinical patient dataset for metabolic disease diagnostic classification and risk scoring.",
    iconName: "Activity",
    recommendedSize: 5000,
    tags: ["Healthcare", "Clinical", "Classification", "Medical"],
    fields: CATEGORIES_DATA.find(c => c.id === "Healthcare")?.recommendedFields || []
  },
  {
    id: "tmpl-real-estate-pricing",
    title: "Real Estate Property Pricing Regression",
    category: "Real Estate",
    mlTask: "Regression",
    outputFormat: "JSON & CSV",
    description: "Housing valuation dataset designed for regression models predicting property listing price using square footage, bedrooms, year built, and location metrics.",
    iconName: "Home",
    recommendedSize: 10000,
    tags: ["Regression", "Housing", "Property Valuation", "Real Estate"],
    fields: CATEGORIES_DATA.find(c => c.id === "Real Estate")?.recommendedFields || []
  },
  {
    id: "tmpl-ecommerce-orders",
    title: "E-Commerce Transaction History",
    category: "E-commerce",
    mlTask: "Regression",
    outputFormat: "JSON & CSV",
    description: "Complete order transactions with item quantities, price, shipping cost, payment methods, and customer ratings.",
    iconName: "ShoppingCart",
    recommendedSize: 10000,
    tags: ["Retail", "Transactions", "Customer Analytics"],
    fields: CATEGORIES_DATA.find(c => c.id === "E-commerce")?.recommendedFields || []
  },
  {
    id: "tmpl-employee-attrition",
    title: "Employee Attrition & HR Analytics",
    category: "HR",
    mlTask: "Classification",
    outputFormat: "JSON & CSV",
    description: "HR analytics dataset featuring salary ranges, performance scores, overtime, job satisfaction, and turnover indicators.",
    iconName: "Users",
    recommendedSize: 2500,
    tags: ["HR", "People Analytics", "Retention", "Classification"],
    fields: CATEGORIES_DATA.find(c => c.id === "HR")?.recommendedFields || []
  },
  {
    id: "tmpl-bank-fraud",
    title: "Bank Credit Card Fraud Detection",
    category: "Finance",
    mlTask: "Anomaly Detection",
    outputFormat: "JSON & CSV",
    description: "High-cardinality financial transaction log with severe class imbalance for testing fraud detection pipelines.",
    iconName: "ShieldAlert",
    recommendedSize: 50000,
    tags: ["Fraud Detection", "Anomaly", "Fintech", "Classification"],
    fields: CATEGORIES_DATA.find(c => c.id === "Finance")?.recommendedFields || []
  },
  {
    id: "tmpl-student-performance",
    title: "Student Academic Performance & Dropout",
    category: "Education",
    mlTask: "Regression & Classification",
    outputFormat: "JSON & CSV",
    description: "Multi-factor academic achievement dataset for regression and grade prediction modeling.",
    iconName: "GraduationCap",
    recommendedSize: 1000,
    tags: ["Education", "Regression", "Academic"],
    fields: CATEGORIES_DATA.find(c => c.id === "Education")?.recommendedFields || []
  },
  {
    id: "tmpl-iot-predictive-maintenance",
    title: "IoT Sensor Telemetry & Predictive Maintenance",
    category: "IoT",
    mlTask: "Time Series Forecasting",
    outputFormat: "JSON & CSV",
    description: "Time-series IoT sensor streams for industrial equipment failure forecasting.",
    iconName: "Cpu",
    recommendedSize: 20000,
    tags: ["IoT", "Time Series", "Predictive Maintenance", "Telemetry"],
    fields: CATEGORIES_DATA.find(c => c.id === "IoT")?.recommendedFields || []
  },
  {
    id: "tmpl-support-ticket-intent",
    title: "Customer Support Ticket Classification & Intent",
    category: "Customer Support",
    mlTask: "Intent & NLP Classification",
    outputFormat: "JSON & CSV",
    description: "Helpdesk support tickets with SLA priority, issue category, resolution time, CSAT score, and escalation status.",
    iconName: "Headphones",
    recommendedSize: 5000,
    tags: ["NLP", "Intent Detection", "Support", "Classification"],
    fields: CATEGORIES_DATA.find(c => c.id === "Customer Support")?.recommendedFields || []
  },
  {
    id: "tmpl-logistics-leadtime",
    title: "Logistics Freight Transit & Lead Time",
    category: "Logistics",
    mlTask: "Regression",
    outputFormat: "JSON & CSV",
    description: "Supply chain shipment tracking with carrier names, package weight, transit duration, shipping fees, and delay status.",
    iconName: "Truck",
    recommendedSize: 10000,
    tags: ["Logistics", "Supply Chain", "Lead Time", "Regression"],
    fields: CATEGORIES_DATA.find(c => c.id === "Logistics")?.recommendedFields || []
  },
  {
    id: "tmpl-cybersecurity-threats",
    title: "Cybersecurity Firewall Telemetry & Anomaly",
    category: "Cybersecurity",
    mlTask: "Anomaly Detection",
    outputFormat: "JSON & CSV",
    description: "Network security access logs with source/dest IPs, protocol, port, threat level, and automated firewall response.",
    iconName: "ShieldAlert",
    recommendedSize: 25000,
    tags: ["Security", "Anomaly Detection", "Network Telemetry"],
    fields: CATEGORIES_DATA.find(c => c.id === "Cybersecurity")?.recommendedFields || []
  },
  {
    id: "tmpl-marketing-lead-scoring",
    title: "Marketing Campaign Lead Scoring",
    category: "Marketing",
    mlTask: "Classification",
    outputFormat: "JSON & CSV",
    description: "Growth marketing campaign metrics with impressions, click rates, CAC, conversion counts, and LTV predictions.",
    iconName: "TrendingUp",
    recommendedSize: 5000,
    tags: ["Marketing", "Lead Scoring", "Growth", "Classification"],
    fields: CATEGORIES_DATA.find(c => c.id === "Marketing")?.recommendedFields || []
  },
  {
    id: "tmpl-social-sentiment",
    title: "Social Media Engagement & Sentiment",
    category: "Social Media",
    mlTask: "NLP Sentiment Analysis",
    outputFormat: "JSON & CSV",
    description: "Cross-platform post metrics with impressions, engagement counters, and NLP sentiment scores.",
    iconName: "Share2",
    recommendedSize: 5000,
    tags: ["Social", "NLP", "Sentiment Analysis"],
    fields: CATEGORIES_DATA.find(c => c.id === "Social Media")?.recommendedFields || []
  }
];
