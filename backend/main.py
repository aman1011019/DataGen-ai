import os
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional

try:
    from .models import (
        GenerationRequest, GenerationResponse, CreateOrderRequest, CreateOrderResponse,
        VerifyPaymentRequest, CancelSubscriptionRequest, ChangePlanRequest, PlanType,
        AISchemaRequest, AISchemaResponse, AISuggestFieldsRequest, AISuggestFieldsResponse, UsageEligibilityResponse
    )
    from .generator import generate_samples, generate_schema_ai, suggest_fields_ai
    from .validator import validate_batch, compute_stats
    from .billing import (
        check_subscription_limits, record_dataset_creation, record_default_api_dataset_creation,
        create_checkout_order, verify_payment_and_activate, cancel_user_subscription, get_user_subscription,
        get_user_usage, get_user_invoices, process_webhook_payload, get_generation_eligibility
    )
    from .prompts import get_schema_creation_prompt, SCHEMA_CREATION_PROMPT
except ImportError:
    from models import (
        GenerationRequest, GenerationResponse, CreateOrderRequest, CreateOrderResponse,
        VerifyPaymentRequest, CancelSubscriptionRequest, ChangePlanRequest, PlanType,
        AISchemaRequest, AISchemaResponse, AISuggestFieldsRequest, AISuggestFieldsResponse, UsageEligibilityResponse
    )
    from generator import generate_samples, generate_schema_ai, suggest_fields_ai
    from validator import validate_batch, compute_stats
    from billing import (
        check_subscription_limits, record_dataset_creation, record_default_api_dataset_creation,
        create_checkout_order, verify_payment_and_activate, cancel_user_subscription, get_user_subscription,
        get_user_usage, get_user_invoices, process_webhook_payload, get_generation_eligibility
    )
    from prompts import get_schema_creation_prompt, SCHEMA_CREATION_PROMPT

app = FastAPI(title="DataGen Framework SaaS API", version="2.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def fix_vercel_path_routing(request: Request, call_next):
    path = request.url.path
    if "/index.py" in path:
        path = path.split("/index.py")[-1]
    if not path or path == "":
        path = "/"
    request.scope["path"] = path
    return await call_next(request)


@app.get("/")
@app.get("/api")
@app.get("/health")
@app.get("/api/health")
def root():
    return {
        "status": "DataGen SaaS Platform API is running 🚀",
        "version": "2.4.0",
        "limits": "3 datasets per 7 days, max 5000 rows/dataset"
    }

@app.get("/api/schema-prompt")
@app.get("/schema-prompt")
def get_schema_prompt(format: Optional[str] = "postgresql"):
    return {
        "status": "success",
        "format": format,
        "prompt": get_schema_creation_prompt(format),
        "raw_base_prompt": SCHEMA_CREATION_PROMPT
    }

# ==================== SERVER-SIDE AI & USAGE ENDPOINTS ====================
@app.post("/api/ai/schema", response_model=AISchemaResponse)
@app.post("/ai/schema", response_model=AISchemaResponse)
async def api_generate_schema(req: AISchemaRequest):
    fields = await generate_schema_ai(req.category, req.prompt or "")
    return AISchemaResponse(
        status="success",
        category=req.category,
        fields=fields
    )

@app.post("/api/ai/suggest-fields", response_model=AISuggestFieldsResponse)
@app.post("/ai/suggest-fields", response_model=AISuggestFieldsResponse)
async def api_suggest_fields(req: AISuggestFieldsRequest):
    existing_dicts = [f.model_dump() if hasattr(f, "model_dump") else dict(f) for f in req.existing_fields]
    suggestions = await suggest_fields_ai(req.category, existing_dicts)
    return AISuggestFieldsResponse(
        status="success",
        suggestions=suggestions
    )

@app.get("/api/usage/eligibility", response_model=UsageEligibilityResponse)
@app.get("/usage/eligibility", response_model=UsageEligibilityResponse)
def api_usage_eligibility(user_email: Optional[str] = None):
    user_id = user_email.replace("@", "_").replace(".", "_").lower() if user_email else "anonymous"
    res = get_generation_eligibility(user_id)
    return UsageEligibilityResponse(**res)


# ==================== DATASET GENERATION ENDPOINT ====================
@app.post("/generate", response_model=GenerationResponse)
@app.post("/api/generate", response_model=GenerationResponse)
async def generate(req: GenerationRequest):
    user_id = req.user_email.replace("@", "_").replace(".", "_").lower() if req.user_email else "anonymous"

    # SERVER-SIDE SUBSCRIPTION & DEFAULT API KEY LIMIT ENFORCEMENT
    check_subscription_limits(
        user_id=user_id,
        requested_rows=req.num_samples,
        is_new_dataset=True,
        is_custom_api_key=req.is_custom_api_key or bool(req.api_key and req.api_key.strip())
    )

    try:
        samples = await generate_samples(req)
        samples = validate_batch(samples, req.task_type, req.labels)
        stats = compute_stats(samples, req.task_type)
        valid_samples = [s for s in samples if s.validation and s.validation.is_valid]

        # Record Usage
        record_dataset_creation(user_id=user_id, rows=req.num_samples)
        record_default_api_dataset_creation(user_id=user_id, is_custom_api_key=req.is_custom_api_key or bool(req.api_key and req.api_key.strip()))

        return GenerationResponse(
            task_type=req.task_type,
            domain=req.domain,
            total_requested=req.num_samples,
            total_generated=len(samples),
            total_valid=len(valid_samples),
            samples=samples,
            stats=stats,
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SUBSCRIPTION & BILLING ENDPOINTS ====================
@app.get("/api/billing/subscription")
@app.get("/billing/subscription")
async def get_subscription(user_email: Optional[str] = None):
    user_id = user_email.replace("@", "_").replace(".", "_").lower() if user_email else "anonymous"
    sub = get_user_subscription(user_id)
    usage = get_user_usage(user_id)
    return {
        "subscription": sub,
        "usage": usage,
    }

@app.post("/api/billing/create-order", response_model=CreateOrderResponse)
@app.post("/billing/create-order", response_model=CreateOrderResponse)
async def create_order(req: CreateOrderRequest):
    user_id = req.user_email.replace("@", "_").replace(".", "_")
    req.user_id = user_id
    return create_checkout_order(req)

@app.post("/api/billing/verify-payment")
@app.post("/billing/verify-payment")
async def verify_payment(req: VerifyPaymentRequest):
    user_id = req.user_email.replace("@", "_").replace(".", "_")
    req.user_id = user_id
    sub = verify_payment_and_activate(req)
    return {
        "status": "success",
        "message": f"Payment verified successfully. {sub.plan.value.capitalize()} plan activated!",
        "subscription": sub
    }

@app.post("/api/billing/cancel")
@app.post("/billing/cancel")
async def cancel_subscription(req: CancelSubscriptionRequest):
    sub = cancel_user_subscription(req.user_id)
    return {
        "status": "success",
        "message": "Subscription set to cancel at end of current billing period.",
        "subscription": sub
    }

@app.post("/api/billing/change-plan")
@app.post("/billing/change-plan")
async def change_plan(req: ChangePlanRequest):
    sub = get_user_subscription(req.user_id)
    sub.plan = req.new_plan_id
    return {
        "status": "success",
        "message": f"Plan changed to {req.new_plan_id.value.capitalize()}.",
        "subscription": sub
    }

@app.get("/api/billing/invoices")
@app.get("/billing/invoices")
async def get_invoices(user_email: Optional[str] = None):
    user_id = user_email.replace("@", "_").replace(".", "_").lower() if user_email else "anonymous"
    invoices = get_user_invoices(user_id)
    return {"invoices": invoices}

@app.post("/api/billing/webhook")
@app.post("/billing/webhook")
async def billing_webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    body_bytes = await request.body()
    result = process_webhook_payload(body_bytes, x_razorpay_signature)
    return result