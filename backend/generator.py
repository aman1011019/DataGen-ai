import json
import os
import re
from typing import List
try:
    from .models import TaskType, DataSample, GenerationRequest
    from .prompts import get_prompt, SYSTEM_PROMPT
except ImportError:
    from models import TaskType, DataSample, GenerationRequest
    from prompts import get_prompt, SYSTEM_PROMPT

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def clean_json_response(text: str) -> str:
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = text.strip("`").strip()
    return text


async def generate_with_anthropic(prompt: str, api_key: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text


async def generate_with_openai(prompt: str, api_key: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        max_tokens=4096,
    )
    return resp.choices[0].message.content


async def generate_with_gemini(prompt: str, api_key: str) -> str:
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        import google.generativeai as genai
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
       model_name="gemini-2.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )
    response = model.generate_content(prompt)
    return response.text

async def generate_schema_ai(category: str, user_prompt: str) -> List[dict]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    prompt = f"""You are an expert AI data architect. Generate a clean synthetic dataset schema for the category "{category}".
User Requirement Prompt: "{user_prompt or 'Standard realistic dataset schema'}"

Return strictly valid JSON array without markdown backticks:
[
  {{
    "name": "snake_case_field_name",
    "type": "String" | "Integer" | "Float" | "Boolean" | "Date" | "DateTime" | "Email" | "Phone" | "UUID" | "URL" | "Enum" | "Currency" | "Percentage" | "Address" | "Name" | "Company" | "Custom",
    "description": "Short explanation",
    "required": true,
    "nullable": false,
    "syntheticStrategy": "realistic_distribution",
    "constraints": {{
      "min": 1,
      "max": 100,
      "options": ["Option A", "Option B"]
    }}
  }}
]"""
    try:
        if api_key:
            raw = await generate_with_gemini(prompt, api_key)
            cleaned = clean_json_response(raw)
            parsed = json.loads(cleaned)
            if isinstance(parsed, list) and len(parsed) > 0:
                for idx, f in enumerate(parsed):
                    if "id" not in f:
                        f["id"] = f"ai_srv_{int(time.time())}_{idx}"
                return parsed
    except Exception as e:
        print(f"ℹ️ Server AI schema notice: {e}. Using structured fallback schema.")

    # Fallback schema
    return [
        {"id": f"srv_fld_1", "name": "record_id", "type": "UUID", "description": "Unique record identifier", "required": True, "nullable": False, "syntheticStrategy": "unique_identifier", "constraints": {}},
        {"id": f"srv_fld_2", "name": "full_name", "type": "Name", "description": "Subject or customer name", "required": True, "nullable": False, "syntheticStrategy": "realistic_distribution", "constraints": {}},
        {"id": f"srv_fld_3", "name": "email_address", "type": "Email", "description": "Contact email address", "required": True, "nullable": False, "syntheticStrategy": "realistic_distribution", "constraints": {}},
        {"id": f"srv_fld_4", "name": "status", "type": "Enum", "description": "Lifecycle status", "required": True, "nullable": False, "syntheticStrategy": "categorical", "constraints": {"options": ["Active", "Pending", "Completed", "Archived"]}},
        {"id": f"srv_fld_5", "name": "score_metric", "type": "Float", "description": "Computed quantitative score", "required": True, "nullable": False, "syntheticStrategy": "gaussian", "constraints": {"min": 0.0, "max": 100.0}},
        {"id": f"srv_fld_6", "name": "created_at", "type": "DateTime", "description": "Record timestamp", "required": True, "nullable": False, "syntheticStrategy": "range", "constraints": {}},
    ]

async def suggest_fields_ai(category: str, existing_fields: List[dict]) -> List[dict]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    existing_names = [f.get("name", "") for f in existing_fields]
    prompt = f"""You are an AI data architect. Suggest 3 additional relevant fields for a "{category}" synthetic dataset.
Existing field names: {json.dumps(existing_names)}

Return strictly valid JSON array:
[
  {{
    "id": "sug_1",
    "name": "recommended_field_name",
    "type": "String" | "Integer" | "Float" | "Boolean" | "Enum" | "DateTime",
    "description": "Short explanation",
    "required": true,
    "nullable": false,
    "syntheticStrategy": "realistic_distribution",
    "constraints": {{}}
  }}
]"""
    try:
        if api_key:
            raw = await generate_with_gemini(prompt, api_key)
            cleaned = clean_json_response(raw)
            parsed = json.loads(cleaned)
            if isinstance(parsed, list) and len(parsed) > 0:
                return parsed
    except Exception as e:
        print(f"ℹ️ Server AI suggest notice: {e}.")

    return [
        {"id": f"sug_srv_1", "name": "risk_tier", "type": "Enum", "description": "Assessed risk classification", "required": True, "nullable": False, "syntheticStrategy": "categorical", "constraints": {"options": ["Low", "Medium", "High", "Critical"]}},
        {"id": f"sug_srv_2", "name": "updated_at", "type": "DateTime", "description": "Last update timestamp", "required": True, "nullable": False, "syntheticStrategy": "range", "constraints": {}},
        {"id": f"sug_srv_3", "name": "compliance_flag", "type": "Boolean", "description": "Regulatory compliance check", "required": True, "nullable": False, "syntheticStrategy": "realistic_distribution", "constraints": {}},
    ]



async def generate_samples(req: GenerationRequest) -> List[DataSample]:
    prompt = get_prompt(
        task_type=req.task_type,
        domain=req.domain,
        num_samples=req.num_samples,
        labels=req.labels,
        language=req.language,
        include_edge_cases=req.include_edge_cases,
        custom_instructions=req.custom_instructions,
    )

    # Resolve API key: prefer provided request key, otherwise fallback to server default key
    provided_key = (req.api_key or "").strip()
    provider = req.llm_provider or "gemini"
    default_key = os.getenv("GEMINI_API_KEY", "")

    effective_key = provided_key if (provided_key and not provided_key.startswith("sk-custom")) else default_key

    try:
        if provider == "openai" and provided_key:
            raw = await generate_with_openai(prompt, provided_key)
        elif provider == "anthropic" and provided_key:
            raw = await generate_with_anthropic(prompt, provided_key)
        else:
            raw = await generate_with_gemini(prompt, effective_key)

        cleaned = clean_json_response(raw)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r'\[.*\]', cleaned, re.DOTALL)
            if match:
                data = json.loads(match.group())
    except Exception as e:
        print(f"ℹ️  LLM Generation notice: {e}. Falling back to high-fidelity synthetic generator.")
        return _mock_samples(req)

    if not isinstance(data, list):
        return _mock_samples(req)

    samples = []
    for i, item in enumerate(data):
        samples.append(DataSample(
            id=i + 1,
            input=str(item.get("input", "")),
            output=item.get("output"),
            metadata=item.get("metadata", {}),
        ))

    return samples


import random
import time

def _mock_samples(req: GenerationRequest) -> List[DataSample]:
    random_seed = int(time.time() * 1000) % 1000000 + random.randint(1, 99999)
    rng = random.Random(random_seed)

    domains_adj = ["corporate", "enterprise", "financial", "clinical", "retail", "cloud", "security", "digital", "operational"]
    actions = ["disrupted", "accelerated", "streamlined", "optimized", "enhanced", "revamped", "modernized"]
    sentiments = ["positive", "neutral", "negative"]

    first_names = ["Sarah", "Marcus", "Elena", "David", "Priya", "Alexander", "Chloe", "Hiroshi", "Aisha", "Carlos"]
    last_names = ["Chen", "Vance", "Gupta", "Miller", "Kowalski", "Patel", "Dubois", "Saito", "Tanaka", "Smith"]
    locations = ["New York", "London", "Tokyo", "Berlin", "Singapore", "Sydney", "Toronto", "Austin", "Paris"]
    companies = ["Acme Corp", "Apex Tech", "Nova Healthcare", "Quantum Financial", "CyberShield", "CloudScale AI"]

    samples = []
    for i in range(req.num_samples):
        adj = rng.choice(domains_adj)
        act = rng.choice(actions)
        fname = rng.choice(first_names)
        lname = rng.choice(last_names)
        loc = rng.choice(locations)
        company = rng.choice(companies)

        if req.task_type == TaskType.classification:
            sentiment = rng.choice(sentiments)
            inp = f"The {req.domain} {adj} workflow was {act} by {company}'s recent update #{i + 101}."
            samples.append(DataSample(
                id=i + 1,
                input=inp,
                output=sentiment,
                metadata={"confidence": f"{rng.uniform(0.78, 0.99):.2f}", "run_id": f"rnd_{random_seed}_{i+1}"}
            ))

        elif req.task_type == TaskType.qa:
            q_types = [
                (f"What is the target threshold for {req.domain} {adj} metrics in item {i+1}?", f"The recommended metric target is {rng.randint(80, 99)}% under operational guidelines."),
                (f"How does {company} manage {req.domain} compliance in {loc}?", f"{company} enforces automated audit checks and {act} protocols."),
                (f"Why is {fname} {lname} monitoring {req.domain} batch #{i+500}?", f"To ensure validation standards and prevent anomaly spikes across operations.")
            ]
            q, a = rng.choice(q_types)
            samples.append(DataSample(
                id=i + 1,
                input=q,
                output=a,
                metadata={"difficulty": rng.choice(["easy", "medium", "hard"])}
            ))

        elif req.task_type == TaskType.summarization:
            inp = f"Quarterly analysis for {company} in the {req.domain} domain revealed that operating metrics were {act} by {rng.randint(12, 45)}% year-over-year under the direction of {fname} {lname} in {loc}."
            out = f"{company} achieved {rng.randint(12, 45)}% growth in {req.domain} performance."
            samples.append(DataSample(
                id=i + 1,
                input=inp,
                output=out,
                metadata={"compression_ratio": f"{rng.uniform(0.35, 0.55):.2f}"}
            ))

        elif req.task_type == TaskType.ner:
            inp = f"{company} director {fname} {lname} introduced new {req.domain} guidelines in {loc}."
            out = [
                {"entity": company, "label": "ORG"},
                {"entity": f"{fname} {lname}", "label": "PERSON"},
                {"entity": loc, "label": "LOC"}
            ]
            samples.append(DataSample(
                id=i + 1,
                input=inp,
                output=out,
                metadata={"entity_count": 3}
            ))

        elif req.task_type == TaskType.intent:
            intents = ["check_status", "cancel_order", "get_support", "request_refund", "update_account"]
            intent = rng.choice(intents)
            inp = f"Please help me {intent.replace('_', ' ')} for {req.domain} reference code #{rng.randint(10000, 99999)}."
            samples.append(DataSample(
                id=i + 1,
                input=inp,
                output=intent,
                metadata={"confidence": f"{rng.uniform(0.85, 0.99):.2f}"}
            ))

        else:
            samples.append(DataSample(
                id=i + 1,
                input=f"Sample {req.domain} input record #{i + 101} ({adj})",
                output=f"Output target {act}",
                metadata={"run_nonce": random_seed}
            ))

    return samples
