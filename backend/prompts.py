try:
    from .models import TaskType
except ImportError:
    from models import TaskType

SYSTEM_PROMPT = """You are a synthetic data generation expert. Your job is to create high-quality, 
diverse, realistic training data for machine learning models. Always return valid JSON arrays.
Generate data that includes edge cases, adversarial examples, and diverse linguistic patterns — 
not just typical happy-path examples."""

SCHEMA_CREATION_PROMPT = """You are a Principal Database Architect & Data Engineer. Your task is to generate complete, production-ready database schema definitions for the DataGen AI SaaS Framework based on the project's data requirements.

--- PROJECT DOMAIN & DATA ENTITIES ---
DataGen is an Automated Synthetic Dataset Generation platform for ML fine-tuning. The system requires the following core data models and relationships:

1. User Profile (`UserProfile` / `users`):
   - Attributes: id (PK, String/UUID), firebaseUid (String, indexed), email (String, unique, indexed), displayName (String), photoUrl (Text/String), createdAt (Timestamp), updatedAt (Timestamp)
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
Generate executable schema definitions in your target output format (PostgreSQL SQL DDL, Firebase Data Connect GraphQL schema, Prisma Schema, or Pydantic models). Include:
- Primary keys, foreign key constraints with ON DELETE CASCADE where appropriate
- Indexes for query optimization (e.g. userProfileId, datasetId, email)
- Default timestamps (CURRENT_TIMESTAMP) and data types matched strictly to enterprise requirements
- Strict type safety and data integrity rules"""

def get_schema_creation_prompt(target_format: str = "postgresql") -> str:
    return f"{SCHEMA_CREATION_PROMPT}\n\nPlease generate the target schema specifically formatted for: {target_format.upper()}."

def get_prompt(task_type, domain, num_samples, labels=None,
               language="English", include_edge_cases=True, custom_instructions=None):

    edge_case_note = """
Also include some edge cases such as:
- Ambiguous or borderline examples
- Short or very long inputs
- Informal or noisy language
- Uncommon but valid scenarios
""" if include_edge_cases else ""

    custom_note = f"\nAdditional instructions: {custom_instructions}" if custom_instructions else ""

    if task_type == TaskType.classification:
        label_str = ", ".join(labels) if labels else "positive, negative, neutral"
        return f"""Generate {num_samples} synthetic text classification samples in the {domain} domain.
Language: {language}
Labels to use: {label_str}
Return a JSON array: [{{"input": "text", "output": "label", "metadata": {{"confidence": "high|medium|low"}}}}]
{edge_case_note}{custom_note}
Return ONLY the JSON array, no extra text."""

    elif task_type == TaskType.qa:
        return f"""Generate {num_samples} synthetic question-answer pairs in the {domain} domain.
Language: {language}
Return a JSON array: [{{"input": "question", "output": "answer", "metadata": {{"difficulty": "easy|medium|hard"}}}}]
{edge_case_note}{custom_note}
Return ONLY the JSON array, no extra text."""

    elif task_type == TaskType.summarization:
        return f"""Generate {num_samples} summarization samples in the {domain} domain.
Language: {language}
Return a JSON array: [{{"input": "long passage", "output": "short summary", "metadata": {{"compression_ratio": "high|medium|low"}}}}]
{edge_case_note}{custom_note}
Return ONLY the JSON array, no extra text."""

    elif task_type == TaskType.ner:
        return f"""Generate {num_samples} Named Entity Recognition samples in the {domain} domain.
Language: {language}
Return a JSON array: [{{"input": "sentence", "output": [{{"entity": "text", "label": "PERSON|ORG|LOC|DATE", "start": 0, "end": 5}}], "metadata": {{"entity_count": 2}}}}]
{edge_case_note}{custom_note}
Return ONLY the JSON array, no extra text."""

    elif task_type == TaskType.intent:
        label_str = ", ".join(labels) if labels else "book_flight, cancel_order, check_status, get_support"
        return f"""Generate {num_samples} intent detection samples in the {domain} domain.
Language: {language}
Intents: {label_str}
Return a JSON array: [{{"input": "user message", "output": "intent", "metadata": {{"confidence": "high|medium|low"}}}}]
{edge_case_note}{custom_note}
Return ONLY the JSON array, no extra text."""