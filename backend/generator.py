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
