import os
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional

try:
    from .models import (
        GenerationRequest, GenerationResponse, CreateOrderRequest, CreateOrderResponse,
        VerifyPaymentRequest, CancelSubscriptionRequest, ChangePlanRequest, PlanType
    )
    from .generator import generate_samples
    from .validator import validate_batch, compute_stats
    from .billing import (
        check_subscription_limits, record_dataset_creation, record_default_api_dataset_creation,
        create_checkout_order, verify_payment_and_activate, cancel_user_subscription, get_user_subscription,
        get_user_usage, get_user_invoices, process_webhook_payload
    )
    from .prompts import get_schema_creation_prompt, SCHEMA_CREATION_PROMPT
except ImportError:
    from models import (
        GenerationRequest, GenerationResponse, CreateOrderRequest, CreateOrderResponse,
        VerifyPaymentRequest, CancelSubscriptionRequest, ChangePlanRequest, PlanType
    )
    from generator import generate_samples
    from validator import validate_batch, compute_stats
    from billing import (
        check_subscription_limits, record_dataset_creation, record_default_api_dataset_creation,
        create_checkout_order, verify_payment_and_activate, cancel_user_subscription, get_user_subscription,
        get_user_usage, get_user_invoices, process_webhook_payload
    )
    from prompts import get_schema_creation_prompt, SCHEMA_CREATION_PROMPT

app = FastAPI(title="DataGen Framework SaaS API", version="2.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
@app.get("/api/health")
def root():
    return {
        "status": "DataGen SaaS Platform API is running 🚀",
        "version": "2.4.0",
        "billingEngine": "Razorpay + Subscription Enforcement Active"
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

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
dist_dir = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(os.path.join(dist_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

@app.get("/{full_path:path}")
def catch_all(full_path: str):
    if full_path.startswith("api") or full_path.startswith("generate") or full_path.startswith("schema-prompt") or full_path.startswith("billing"):
        raise HTTPException(status_code=404, detail="Not Found")
    index_file = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"detail": "Not Found"}