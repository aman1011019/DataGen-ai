# 🏛️ DataGen AI SaaS Database Schema & Prompt Reference

> **Official Prompt & Architecture Specs for Generating DataGen Database Schemas**

This document contains the official prompt used to generate database schema definitions for the DataGen Framework across multiple database dialects (PostgreSQL, Supabase GraphQL / REST, Prisma, and Pydantic DTOs).

---

## 🤖 Schema Generation AI Prompt

```text
You are a Principal Database Architect & Data Engineer. Your task is to generate complete, production-ready database schema definitions for the DataGen AI SaaS Framework based on the project's data requirements.

--- PROJECT DOMAIN & DATA ENTITIES ---
DataGen is an Automated Synthetic Dataset Generation platform for ML fine-tuning. The system requires the following core data models and relationships:

1. User Profile (`UserProfile` / `users`):
   - Attributes: id (PK, String/UUID), supabaseUid (String, indexed), email (String, unique, indexed), displayName (String), photoUrl (Text/String), createdAt (Timestamp), updatedAt (Timestamp)
   - Relations: One-to-Many with Datasets, UsageWindows, GenerationJobs, Subscriptions, Payments, Invoices.

2. Dataset (`Dataset` / `datasets`):
   - Attributes: id (PK, String/UUID), userProfileId (FK -> UserProfile.id, CASCADE), name (String), description (Text), category (String/Domain), mlTask (String: classification|qa|summarization|ner|intent), recordCount (Int), fieldCount (Int), qualityScore (Float/Double), outputFormat (String), createdAt (Timestamp), updatedAt (Timestamp)
   - Relations: Belongs to UserProfile; One-to-Many with DatasetFields and GenerationJobs.

3. Dataset Field (`DatasetField` / `dataset_fields`):
   - Attributes: id (PK, String/UUID), datasetId (FK -> Dataset.id, CASCADE), name (String), type (String: string|number|boolean|date|json), description (Text), required (Boolean), nullable (Boolean), syntheticStrategy (String: realistic_distribution|edge_case|adversarial)
   - Relations: Belongs to Dataset.

4. Usage Window (`UsageWindow` / `usage_windows`):
   - Attributes: id (PK, String/UUID), userProfileId (FK -> UserProfile.id, CASCADE), datasetsCreatedCount (Int), lastGeneratedAt (Timestamp), windowResetAt (Timestamp), createdAt (Timestamp)
   - Relations: Tracks free tier 1-week cooldown limits per user.

5. Generation Job (`GenerationJob` / `generation_jobs`):
   - Attributes: id (PK, String/UUID), userProfileId (FK -> UserProfile.id, CASCADE), datasetId (FK -> Dataset.id, NULLABLE), taskType (String), domain (String), requestedRows (Int), generatedRows (Int), validRows (Int), status (String: pending|running|completed|failed), createdAt (Timestamp)
   - Relations: Tracks async dataset generation runs.

6. Subscription (`Subscription` / `subscriptions`):
   - Attributes: id (PK, String/UUID), userId (FK -> UserProfile.id, CASCADE), plan (Enum: normal|pro|business), status (Enum: active|trialing|past_due|cancelled|expired), provider (String: razorpay), providerCustomerId (String), providerSubscriptionId (String), providerPaymentId (String), providerOrderId (String), currentPeriodStart (Timestamp), currentPeriodEnd (Timestamp), cancelAtPeriodEnd (Boolean), createdAt (Timestamp), updatedAt (Timestamp)

7. Payment (`Payment` / `payments`):
   - Attributes: id (PK, String/UUID), userId (FK -> UserProfile.id, CASCADE), subscriptionId (FK -> Subscription.id, NULLABLE), providerPaymentId (String), providerOrderId (String), amount (Numeric/Decimal), currency (String), status (String: captured|failed|refunded), createdAt (Timestamp)

8. Invoice (`Invoice` / `invoices`):
   - Attributes: id (PK, String/UUID), userId (FK -> UserProfile.id, CASCADE), subscriptionId (FK -> Subscription.id, NULLABLE), providerInvoiceId (String), amount (Numeric/Decimal), currency (String), status (String: paid|unpaid|void), planName (String), invoiceUrl (Text), createdAt (Timestamp)

9. Usage (`Usage` / `user_usage`):
   - Attributes: userId (PK, FK -> UserProfile.id, CASCADE), datasetsCreated (Int), rowsGenerated (Int), updatedAt (Timestamp)

--- OUTPUT REQUIREMENTS ---
Generate executable schema definitions in your target output format (PostgreSQL SQL DDL, Supabase GraphQL / REST schema, Prisma Schema, or Pydantic models). Include:
- Primary keys, foreign key constraints with ON DELETE CASCADE where appropriate
- Indexes for query optimization (e.g. userProfileId, datasetId, email)
- Default timestamps (CURRENT_TIMESTAMP) and data types matched strictly to enterprise requirements
- Strict type safety and data integrity rules
```

---

## 🛠️ API & Code Locations

1. **Python Backend**: Recorded in [`backend/prompts.py`](file:///c:/Users/aman1/Downloads/Datagen-framework-main/backend/prompts.py) as `SCHEMA_CREATION_PROMPT` and `get_schema_creation_prompt(format)`.
2. **REST API Endpoint**: Available at `GET /api/schema-prompt?format=postgresql` in [`backend/main.py`](file:///c:/Users/aman1/Downloads/Datagen-framework-main/backend/main.py).
3. **Database Schema Files**:
   - PostgreSQL SQL: [`schema.sql`](file:///c:/Users/aman1/Downloads/Datagen-framework-main/schema.sql)
   - GraphQL Schema: [`schema.gql`](file:///c:/Users/aman1/Downloads/Datagen-framework-main/schema.gql)

