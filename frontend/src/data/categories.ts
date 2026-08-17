import { CategoryInfo, FieldDefinition } from "../types/dataset";

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: "Healthcare",
    name: "Healthcare & Medicine",
    iconName: "Activity",
    description: "Generate synthetic patient records, clinical trials, diagnostic measurements, and hospital admissions.",
    examplePrompt: "I need patient data for diabetes prediction with blood glucose levels, BMI, age, insulin, and diagnosis outcome.",
    recommendedFields: [
      { id: "h1", name: "patient_id", type: "UUID", description: "Unique patient identifier", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "h2", name: "full_name", type: "Name", description: "Patient full name", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "h3", name: "age", type: "Integer", description: "Patient age in years", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 18, max: 88 } },
      { id: "h4", name: "gender", type: "Enum", description: "Biological gender", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Male", "Female", "Other"] } },
      { id: "h5", name: "blood_type", type: "Enum", description: "ABO blood group type", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] } },
      { id: "h6", name: "bmi", type: "Float", description: "Body Mass Index (kg/m²)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 16.5, max: 44.0 } },
      { id: "h7", name: "systolic_bp", type: "Integer", description: "Systolic Blood Pressure (mmHg)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 90, max: 180 } },
      { id: "h8", name: "diastolic_bp", type: "Integer", description: "Diastolic Blood Pressure (mmHg)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 60, max: 110 } },
      { id: "h9", name: "glucose_level", type: "Float", description: "Fasting blood glucose level (mg/dL)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 70.0, max: 240.0 } },
      { id: "h10", name: "insulin_u_ml", type: "Float", description: "2-hour serum insulin (mu U/ml)", required: false, nullable: true, syntheticStrategy: "realistic_distribution", constraints: { min: 15, max: 280 } },
      { id: "h11", name: "hba1c_pct", type: "Float", description: "Glycated hemoglobin percentage", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 4.5, max: 12.0 } },
      { id: "h12", name: "medical_condition", type: "Enum", description: "Primary diagnosed condition", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Diabetes Type 2", "Hypertension", "Coronary Heart Disease", "Asthma", "Normal Checkup"] } },
      { id: "h13", name: "prescribed_medication", type: "Enum", description: "Active medication prescribed", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["Metformin 500mg", "Lisinopril 10mg", "Atorvastatin 20mg", "Albuterol Inhaler", "None"] } },
      { id: "h14", name: "admission_date", type: "Date", description: "Hospital admission date", required: true, nullable: false, syntheticStrategy: "range" },
      { id: "h15", name: "readmission_30_days", type: "Boolean", description: "Hospital readmission within 30 days flag", required: true, nullable: false, syntheticStrategy: "realistic_distribution" }
    ]
  },
  {
    id: "Finance",
    name: "Finance & Banking",
    iconName: "CreditCard",
    description: "Generate bank transactions, credit scoring, loan risk assessments, and fraud detection datasets.",
    examplePrompt: "I need financial transaction records with fraud labels, merchant categories, amounts, credit scores, and risk indicators.",
    recommendedFields: [
      { id: "f1", name: "transaction_id", type: "UUID", description: "Unique transaction reference", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "f2", name: "customer_id", type: "String", description: "Customer account identifier", required: true, nullable: false, syntheticStrategy: "sequence" },
      { id: "f3", name: "account_type", type: "Enum", description: "Type of financial account", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Savings", "Checking", "Credit Card", "Investment", "Loan"] } },
      { id: "f4", name: "transaction_date", type: "DateTime", description: "Exact date and time of transaction", required: true, nullable: false, syntheticStrategy: "range" },
      { id: "f5", name: "transaction_type", type: "Enum", description: "Direction of funds", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Debit", "Credit", "Wire Transfer", "ATM Withdrawal", "POS Payment"] } },
      { id: "f6", name: "amount", type: "Currency", description: "Transaction amount in USD", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 2.5, max: 15000.0 } },
      { id: "f7", name: "merchant_name", type: "Company", description: "Name of merchant or payee", required: false, nullable: true, syntheticStrategy: "categorical" },
      { id: "f8", name: "merchant_category", type: "Enum", description: "MCC classification category", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["Retail", "Travel & Airlines", "Dining & Restaurants", "Online Services", "Utilities", "Gas Stations"] } },
      { id: "f9", name: "account_balance", type: "Currency", description: "Post-transaction account balance", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 100, max: 250000 } },
      { id: "f10", name: "credit_score", type: "Integer", description: "FICO credit score", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 300, max: 850 } },
      { id: "f11", name: "annual_income", type: "Currency", description: "Declared annual income", required: false, nullable: true, syntheticStrategy: "realistic_distribution", constraints: { min: 25000, max: 350000 } },
      { id: "f12", name: "is_fraud", type: "Boolean", description: "Binary indicator for fraudulent activity", required: true, nullable: false, syntheticStrategy: "realistic_distribution" }
    ]
  },
  {
    id: "E-commerce",
    name: "E-Commerce & Retail",
    iconName: "ShoppingCart",
    description: "Generate customer shopping sessions, online orders, product catalogs, customer reviews, and cart abandonments.",
    examplePrompt: "I need e-commerce order histories with customer demographics, item pricing, discounts, shipping methods, and product ratings.",
    recommendedFields: [
      { id: "e1", name: "order_id", type: "String", description: "Formatted order reference code", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "ORD-#####" } },
      { id: "e2", name: "customer_id", type: "UUID", description: "Unique buyer ID", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "e3", name: "customer_email", type: "Email", description: "Customer contact email address", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "e4", name: "product_name", type: "String", description: "Name of purchased item", required: true, nullable: false, syntheticStrategy: "categorical" },
      { id: "e5", name: "category", type: "Enum", description: "Main department category", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Electronics", "Apparel & Fashion", "Home & Kitchen", "Beauty & Personal Care", "Books & Media", "Sports & Outdoors"] } },
      { id: "e6", name: "unit_price", type: "Currency", description: "Standard price per item", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 4.99, max: 1299.99 } },
      { id: "e7", name: "quantity", type: "Integer", description: "Number of units purchased", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 1, max: 10 } },
      { id: "e8", name: "discount_pct", type: "Percentage", description: "Applied coupon discount rate", required: false, nullable: true, syntheticStrategy: "realistic_distribution", constraints: { min: 0, max: 40 } },
      { id: "e9", name: "total_amount", type: "Currency", description: "Final billed order amount", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "e10", name: "payment_method", type: "Enum", description: "Selected payment gateway", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Credit Card", "PayPal", "Apple Pay", "Buy Now Pay Later", "Bank Transfer"] } },
      { id: "e11", name: "order_status", type: "Enum", description: "Current fulfillment status", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Delivered", "Shipped", "Processing", "Cancelled", "Returned"] } },
      { id: "e12", name: "customer_rating", type: "Integer", description: "Post-purchase star rating (1-5)", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 1, max: 5 } }
    ]
  },
  {
    id: "Education",
    name: "Education & Academics",
    iconName: "GraduationCap",
    description: "Generate student enrollment profiles, academic transcripts, exam results, attendance logs, and job placement data.",
    examplePrompt: "I need student performance data including department, GPA, exam scores, attendance rate, and graduation outcomes.",
    recommendedFields: [
      { id: "ed1", name: "student_id", type: "String", description: "Student matriculation number", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "STU2026-####" } },
      { id: "ed2", name: "full_name", type: "Name", description: "Student full name", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "ed3", name: "department", type: "Enum", description: "Academic major department", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Computer Science", "Electrical Engineering", "Business Administration", "Mechanical Engineering", "Biotechnology", "Data Science"] } },
      { id: "ed4", name: "academic_year", type: "Enum", description: "Current year of study", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Freshman", "Sophomore", "Junior", "Senior", "Postgraduate"] } },
      { id: "ed5", name: "cgpa", type: "Float", description: "Cumulative Grade Point Average (0.0 - 4.0)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1.8, max: 4.0 } },
      { id: "ed6", name: "attendance_pct", type: "Percentage", description: "Semester course attendance rate", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 55, max: 100 } },
      { id: "ed7", name: "midterm_score", type: "Integer", description: "Midterm exam score (out of 100)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 35, max: 100 } },
      { id: "ed8", name: "final_score", type: "Integer", description: "Final exam score (out of 100)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 40, max: 100 } },
      { id: "ed9", name: "placement_status", type: "Enum", description: "Campus placement outcome", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["Placed", "Seeking Employment", "Higher Education", "Self-Employed"] } },
      { id: "ed10", name: "starting_package_k", type: "Float", description: "Offered annual salary package ($k USD)", required: false, nullable: true, syntheticStrategy: "realistic_distribution", constraints: { min: 45, max: 180 } }
    ]
  },
  {
    id: "HR",
    name: "Human Resources",
    iconName: "Users",
    description: "Generate workforce datasets, compensation, performance reviews, employee attrition risk, and recruitment funnels.",
    examplePrompt: "I need employee HR records with tenure, performance scores, salary band, overtime hours, job satisfaction, and attrition flags.",
    recommendedFields: [
      { id: "hr1", name: "employee_id", type: "String", description: "Internal employee badge code", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "EMP-#####" } },
      { id: "hr2", name: "full_name", type: "Name", description: "Employee full legal name", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "hr3", name: "department", type: "Enum", description: "Organisational department", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Engineering", "Sales", "Marketing", "Product", "Human Resources", "Finance & Legal", "Customer Success"] } },
      { id: "hr4", name: "job_role", type: "Enum", description: "Specific designation title", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Senior Software Engineer", "Account Executive", "Product Manager", "HR Specialist", "Financial Analyst", "UX Designer", "Director"] } },
      { id: "hr5", name: "years_experience", type: "Integer", description: "Total professional industry experience", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 0, max: 30 } },
      { id: "hr6", name: "annual_salary", type: "Currency", description: "Base annual salary in USD", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 48000, max: 280000 } },
      { id: "hr7", name: "performance_rating", type: "Enum", description: "Latest performance evaluation grade", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["1 - Needs Improvement", "2 - Meets Expectations", "3 - Exceeds Expectations", "4 - Outstanding"] } },
      { id: "hr8", name: "job_satisfaction_1to5", type: "Integer", description: "Employee survey satisfaction score", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1, max: 5 } },
      { id: "hr9", name: "weekly_overtime_hrs", type: "Float", description: "Average weekly overtime hours worked", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 0, max: 20 } },
      { id: "hr10", name: "attrition_risk", type: "Enum", description: "Predicted attrition probability level", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Low", "Medium", "High"] } }
    ]
  },
  {
    id: "Marketing",
    name: "Marketing & Growth",
    iconName: "TrendingUp",
    description: "Generate ad campaign performance, user acquisition funnels, email engagement rates, and customer lifetime value.",
    examplePrompt: "I need marketing campaign datasets with ad channel, impressions, clicks, conversions, acquisition cost, and revenue.",
    recommendedFields: [
      { id: "m1", name: "campaign_id", type: "String", description: "Marketing campaign tracking code", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "CMP-2026-###" } },
      { id: "m2", name: "channel", type: "Enum", description: "Acquisition marketing channel", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Google Search Ads", "Meta Ads", "LinkedIn Sponsored", "Email Newsletter", "SEO Organic", "Influencer Partnership"] } },
      { id: "m3", name: "impressions", type: "Integer", description: "Total campaign ad impressions", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 1000, max: 500000 } },
      { id: "m4", name: "clicks", type: "Integer", description: "Total registered ad clicks", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "m5", name: "ctr_pct", type: "Percentage", description: "Click-through rate percentage", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "m6", name: "cost_per_click", type: "Currency", description: "Average cost per click ($ USD)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 0.45, max: 12.50 } },
      { id: "m7", name: "conversions", type: "Integer", description: "Total completed signups / purchases", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "m8", name: "cac_usd", type: "Currency", description: "Customer Acquisition Cost ($ USD)", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "m9", name: "customer_ltv", type: "Currency", description: "Predicted Customer Lifetime Value", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 120, max: 4500 } }
    ]
  },
  {
    id: "Retail",
    name: "Retail & Supply Chain",
    iconName: "Store",
    description: "Generate retail inventory logs, supplier lead times, stockout tracking, and store sales metrics.",
    examplePrompt: "I need retail store inventory datasets with product SKUs, stock levels, reorder points, unit costs, and sales velocity.",
    recommendedFields: [
      { id: "r1", name: "store_id", type: "String", description: "Physical store location code", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "STR-###" } },
      { id: "r2", name: "sku_code", type: "String", description: "Product Stock Keeping Unit", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "SKU-#####" } },
      { id: "r3", name: "inventory_count", type: "Integer", description: "Current units in stock", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 0, max: 1500 } },
      { id: "r4", name: "reorder_point", type: "Integer", description: "Minimum inventory stock threshold", required: true, nullable: false, syntheticStrategy: "range", constraints: { min: 25, max: 200 } },
      { id: "r5", name: "unit_cost", type: "Currency", description: "Wholesale cost price per unit", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 1.5, max: 450 } },
      { id: "r6", name: "retail_price", type: "Currency", description: "Selling price to consumers", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "r7", name: "daily_sales_units", type: "Integer", description: "Average units sold per day", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1, max: 120 } },
      { id: "r8", name: "supplier_lead_days", type: "Integer", description: "Supplier replenishment lead time in days", required: false, nullable: true, syntheticStrategy: "range", constraints: { min: 2, max: 21 } }
    ]
  },
  {
    id: "Cybersecurity",
    name: "Cybersecurity & IT Ops",
    iconName: "ShieldAlert",
    description: "Generate network access logs, security intrusion alerts, firewall telemetry, and anomaly detection training sets.",
    examplePrompt: "I need network traffic logs with IP addresses, request protocols, anomaly scores, threat severity levels, and firewall action taken.",
    recommendedFields: [
      { id: "c1", name: "event_id", type: "UUID", description: "Unique security event log ID", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "c2", name: "timestamp", type: "DateTime", description: "Event timestamp UTC", required: true, nullable: false, syntheticStrategy: "range" },
      { id: "c3", name: "source_ip", type: "Custom", description: "Originating IPv4 address", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "192.168.#.#" } },
      { id: "c4", name: "destination_ip", type: "Custom", description: "Target server IPv4 address", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "10.0.#.#" } },
      { id: "c5", name: "protocol", type: "Enum", description: "Network connection protocol", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["HTTPS", "SSH", "DNS", "FTP", "TCP", "UDP"] } },
      { id: "c6", name: "port", type: "Integer", description: "Target port number", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { min: 20, max: 8080 } },
      { id: "c7", name: "bytes_sent", type: "Integer", description: "Data payload volume in bytes", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 64, max: 1048576 } },
      { id: "c8", name: "threat_level", type: "Enum", description: "Assessed threat classification", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Info", "Low", "Medium", "High", "Critical"] } },
      { id: "c9", name: "action_taken", type: "Enum", description: "Automated firewall response", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Allowed", "Blocked", "Quarantined", "Flagged for Inspection"] } },
      { id: "c10", name: "anomaly_score", type: "Float", description: "ML anomaly probability (0.0 to 1.0)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 0.01, max: 0.99 } }
    ]
  },
  {
    id: "IoT",
    name: "IoT & Telemetry",
    iconName: "Cpu",
    description: "Generate IoT sensor readings, industrial equipment telemetry, smart home environmental data, and device health logs.",
    examplePrompt: "I need IoT industrial sensor telemetry with temperature, vibration Hz, pressure, battery status, and anomaly flags.",
    recommendedFields: [
      { id: "iot1", name: "device_id", type: "String", description: "Hardware device identifier", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "IOT-SN-#####" } },
      { id: "iot2", name: "timestamp", type: "DateTime", description: "Telemetry timestamp ISO-8601", required: true, nullable: false, syntheticStrategy: "range" },
      { id: "iot3", name: "temperature_c", type: "Float", description: "Ambient sensor temperature (°C)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: -10.0, max: 85.0 } },
      { id: "iot4", name: "vibration_hz", type: "Float", description: "Machine motor vibration frequency (Hz)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 10.0, max: 250.0 } },
      { id: "iot5", name: "pressure_psi", type: "Float", description: "Fluid pressure reading (PSI)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 14.7, max: 150.0 } },
      { id: "iot6", name: "battery_pct", type: "Percentage", description: "Device remaining battery level", required: true, nullable: false, syntheticStrategy: "range", constraints: { min: 5, max: 100 } },
      { id: "iot7", name: "firmware_version", type: "String", description: "Installed device OS version", required: false, nullable: true, syntheticStrategy: "categorical" },
      { id: "iot8", name: "alert_status", type: "Enum", description: "Hardware alarm state", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Normal", "Warning: High Temp", "Critical: Overpressure", "Low Battery"] } }
    ]
  },
  {
    id: "Logistics",
    name: "Logistics & Supply Chain",
    iconName: "Truck",
    description: "Generate shipment tracking records, freight transit times, delivery status logs, and route optimization datasets.",
    examplePrompt: "I need logistics shipment data with origin, destination, carrier, weight, transit days, and delivery status.",
    recommendedFields: [
      { id: "l1", name: "shipment_id", type: "String", description: "Global shipment tracking number", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "TRK-2026-#######" } },
      { id: "l2", name: "carrier_name", type: "Enum", description: "Shipping carrier service", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["FedEx Express", "DHL Worldwide", "UPS Freight", "Maersk Line", "Amazon Logistics"] } },
      { id: "l3", name: "origin_city", type: "String", description: "Departure origin city", required: true, nullable: false, syntheticStrategy: "categorical" },
      { id: "l4", name: "destination_city", type: "String", description: "Destination delivery city", required: true, nullable: false, syntheticStrategy: "categorical" },
      { id: "l5", name: "package_weight_kg", type: "Float", description: "Cargo weight in kilograms", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 0.5, max: 500.0 } },
      { id: "l6", name: "shipping_cost_usd", type: "Currency", description: "Total shipping fee ($ USD)", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "l7", name: "transit_days", type: "Integer", description: "Total elapsed transit duration in days", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1, max: 18 } },
      { id: "l8", name: "delivery_status", type: "Enum", description: "Final package delivery status", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Delivered On Time", "Delivered Delayed", "In Transit", "Out for Delivery", "Customs Hold"] } }
    ]
  },
  {
    id: "Real Estate",
    name: "Real Estate & Housing",
    iconName: "Home",
    description: "Generate property listings, valuation estimates, rental market metrics, and housing transaction data.",
    examplePrompt: "I need real estate property listings with square footage, bedrooms, bathrooms, price, neighborhood, and days on market.",
    recommendedFields: [
      { id: "re1", name: "property_id", type: "UUID", description: "Unique property listing ID", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "re2", name: "property_type", type: "Enum", description: "Classification of residence", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Single Family Home", "Condo", "Townhouse", "Multi-Family", "Luxury Villa"] } },
      { id: "re3", name: "listing_price", type: "Currency", description: "Asking sale price in USD", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 180000, max: 2500000 } },
      { id: "re4", name: "square_feet", type: "Integer", description: "Total living space area (sq ft)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 650, max: 5500 } },
      { id: "re5", name: "bedrooms", type: "Integer", description: "Count of bedrooms", required: true, nullable: false, syntheticStrategy: "range", constraints: { min: 1, max: 6 } },
      { id: "re6", name: "bathrooms", type: "Float", description: "Count of bathrooms", required: true, nullable: false, syntheticStrategy: "range", constraints: { min: 1.0, max: 5.5 } },
      { id: "re7", name: "year_built", type: "Integer", description: "Year of construction completion", required: false, nullable: true, syntheticStrategy: "range", constraints: { min: 1960, max: 2025 } },
      { id: "re8", name: "days_on_market", type: "Integer", description: "Active listing duration in days", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 2, max: 180 } }
    ]
  },
  {
    id: "Travel",
    name: "Travel & Hospitality",
    iconName: "Plane",
    description: "Generate airline booking records, hotel reservations, passenger itineraries, and loyalty program metrics.",
    examplePrompt: "I need flight booking data with passenger details, travel class, booking date, destination, ticket price, and cancellation status.",
    recommendedFields: [
      { id: "t1", name: "booking_id", type: "String", description: "PNR reservation code", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "PNR-######" } },
      { id: "t2", name: "traveler_name", type: "Name", description: "Passenger full name", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "t3", name: "destination_country", type: "String", description: "Destination country", required: true, nullable: false, syntheticStrategy: "categorical" },
      { id: "t4", name: "cabin_class", type: "Enum", description: "Airline ticket service class", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Economy", "Premium Economy", "Business Class", "First Class"] } },
      { id: "t5", name: "ticket_price_usd", type: "Currency", description: "Total airfare cost ($ USD)", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 120, max: 4800 } },
      { id: "t6", name: "stay_duration_nights", type: "Integer", description: "Length of stay in nights", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 1, max: 21 } },
      { id: "t7", name: "loyalty_tier", type: "Enum", description: "Passenger frequent flyer status", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["Member", "Silver", "Gold", "Platinum", "VIP Elite"] } }
    ]
  },
  {
    id: "Manufacturing",
    name: "Manufacturing & QA",
    iconName: "Factory",
    description: "Generate production assembly line logs, quality defect rates, machine cycle times, and maintenance schedules.",
    examplePrompt: "I need factory quality assurance records with batch ID, defect counts, line operator, machine cycle times, and pass/fail status.",
    recommendedFields: [
      { id: "mfg1", name: "batch_id", type: "String", description: "Production batch lot number", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "LOT-2026-####" } },
      { id: "mfg2", name: "assembly_line", type: "Enum", description: "Production facility line code", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Line Alpha", "Line Beta", "Line Gamma", "Automated Robot Line 1"] } },
      { id: "mfg3", name: "produced_units", type: "Integer", description: "Total units produced in batch", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 500, max: 10000 } },
      { id: "mfg4", name: "defect_count", type: "Integer", description: "Flagged quality defect count", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 0, max: 85 } },
      { id: "mfg5", name: "cycle_time_sec", type: "Float", description: "Average cycle time per unit (sec)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 4.2, max: 32.0 } },
      { id: "mfg6", name: "qa_inspection_result", type: "Enum", description: "Final QA batch verdict", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Passed Inspection", "Passed with Warning", "Rejected - Rework Required", "Scrapped"] } }
    ]
  },
  {
    id: "Customer Support",
    name: "Customer Support",
    iconName: "Headphones",
    description: "Generate helpdesk ticketing datasets, resolution times, CSAT feedback ratings, and escalation metrics.",
    examplePrompt: "I need customer support tickets with issue category, creation date, resolution time in hours, agent name, and CSAT score.",
    recommendedFields: [
      { id: "cs1", name: "ticket_id", type: "String", description: "Support ticket ticket number", required: true, nullable: false, syntheticStrategy: "pattern", constraints: { pattern: "TKT-######" } },
      { id: "cs2", name: "issue_category", type: "Enum", description: "Topic classification", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Billing & Payments", "Account Access", "Technical Bug", "Feature Request", "Shipping Delay", "Cancellation"] } },
      { id: "cs3", name: "priority", type: "Enum", description: "SLA priority level", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Low", "Medium", "High", "Urgent / P1"] } },
      { id: "cs4", name: "resolution_time_hrs", type: "Float", description: "Time taken to resolve ticket in hours", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 0.2, max: 72.0 } },
      { id: "cs5", name: "csat_score_1to5", type: "Integer", description: "Customer satisfaction rating", required: false, nullable: true, syntheticStrategy: "gaussian", constraints: { min: 1, max: 5 } },
      { id: "cs6", name: "is_escalated", type: "Boolean", description: "Ticket escalated to Tier-2 management", required: true, nullable: false, syntheticStrategy: "realistic_distribution" }
    ]
  },
  {
    id: "Social Media",
    name: "Social Media & Content",
    iconName: "Share2",
    description: "Generate social media post analytics, sentiment analysis datasets, influencer engagements, and viral trend metrics.",
    examplePrompt: "I need social media post analytics with platform, impressions, likes, shares, sentiment score (-1 to 1), and hashtag topic.",
    recommendedFields: [
      { id: "sm1", name: "post_id", type: "UUID", description: "Unique post identifier", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "sm2", name: "platform", type: "Enum", description: "Social media network", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["X / Twitter", "LinkedIn", "Instagram", "YouTube Shorts", "TikTok"] } },
      { id: "sm3", name: "impressions", type: "Integer", description: "Total post views / impressions", required: true, nullable: false, syntheticStrategy: "realistic_distribution", constraints: { min: 500, max: 2500000 } },
      { id: "sm4", name: "likes", type: "Integer", description: "Total user likes", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "sm5", name: "shares", type: "Integer", description: "Total reposts / shares", required: true, nullable: false, syntheticStrategy: "correlated" },
      { id: "sm6", name: "sentiment_score", type: "Float", description: "NLP sentiment index (-1.0 to +1.0)", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: -0.95, max: 0.95 } },
      { id: "sm7", name: "hashtag_category", type: "Enum", description: "Dominant topic hashtag", required: false, nullable: true, syntheticStrategy: "categorical", constraints: { options: ["#AI", "#TechNews", "#Productivity", "#Fintech", "#StartupLife", "#DataScience"] } }
    ]
  },
  {
    id: "Custom",
    name: "Custom Schema",
    iconName: "Wand2",
    description: "Build a completely custom dataset schema from scratch or using arbitrary user prompt instructions.",
    examplePrompt: "I need a dataset for testing a real-time smart grid power consumption system.",
    recommendedFields: [
      { id: "cst1", name: "record_id", type: "UUID", description: "Unique record key", required: true, nullable: false, syntheticStrategy: "unique_identifier" },
      { id: "cst2", name: "entity_name", type: "Name", description: "Primary entity name", required: true, nullable: false, syntheticStrategy: "realistic_distribution" },
      { id: "cst3", name: "category", type: "Enum", description: "Classification category", required: true, nullable: false, syntheticStrategy: "categorical", constraints: { options: ["Alpha", "Beta", "Gamma"] } },
      { id: "cst4", name: "score", type: "Float", description: "Computed metric value", required: true, nullable: false, syntheticStrategy: "gaussian", constraints: { min: 0, max: 100 } },
      { id: "cst5", name: "created_at", type: "DateTime", description: "Creation timestamp", required: true, nullable: false, syntheticStrategy: "range" }
    ]
  }
];
