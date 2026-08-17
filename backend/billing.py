import os
import hmac
import hashlib
import json
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from fastapi import HTTPException

try:
    from .models import (
        PlanType, SubscriptionStatus, Subscription, Payment, Invoice, Usage,
        CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest
    )
except ImportError:
    from models import (
        PlanType, SubscriptionStatus, Subscription, Payment, Invoice, Usage,
        CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest
    )

# Configurable Plan Prices in INR
PLAN_PRICES = {
    PlanType.normal: {"month": 0, "year": 0},
    PlanType.pro: {"month": 499, "year": 4790},
    PlanType.business: {"month": 1499, "year": 14390},
}

PLAN_LIMITS = {
    PlanType.normal: {"datasets": 1, "rows_per_dataset": 500},
    PlanType.pro: {"datasets": float("inf"), "rows_per_dataset": float("inf")},
    PlanType.business: {"datasets": float("inf"), "rows_per_dataset": float("inf")},
}

# Environment Credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_datagen_demo_key")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "datagen_demo_secret_2026")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "datagen_webhook_secret_2026")

# In-memory storage stores (isolated by userId)
_subscriptions_db: Dict[str, Subscription] = {}
_usage_db: Dict[str, Usage] = {}
_invoices_db: Dict[str, List[Invoice]] = {}
_payments_db: Dict[str, List[Payment]] = {}
_processed_webhooks: set = set()

def get_user_subscription(user_id: str) -> Subscription:
    if user_id not in _subscriptions_db:
        now = datetime.now(timezone.utc)
        _subscriptions_db[user_id] = Subscription(
            id=f"sub_{user_id}",
            userId=user_id,
            plan=PlanType.normal,
            status=SubscriptionStatus.active,
            currentPeriodStart=now,
            currentPeriodEnd=now + timedelta(days=365*10),
        )
    return _subscriptions_db[user_id]

def get_user_usage(user_id: str) -> Usage:
    if user_id not in _usage_db:
        _usage_db[user_id] = Usage(userId=user_id, datasetsCreated=0, rowsGenerated=0)
    return _usage_db[user_id]

def record_dataset_creation(user_id: str, rows: int):
    usage = get_user_usage(user_id)
    usage.datasetsCreated += 1
    usage.rowsGenerated += rows
    usage.updatedAt = datetime.now(timezone.utc)

_default_usage_db: Dict[str, dict] = {}

def check_subscription_limits(user_id: str, requested_rows: int, is_new_dataset: bool = True, is_custom_api_key: bool = False):
    if is_custom_api_key:
        # Custom API key active — bypass default limits & 1-week cooldown!
        return

    # Using Default API key
    if requested_rows > 5000:
        raise HTTPException(
            status_code=400,
            detail="Dataset limit is 5,000 records when using the default API key. Please reduce record count to 5,000 or add your custom API key in Settings!"
        )

    now = datetime.now(timezone.utc)
    usage = _default_usage_db.get(user_id)
    if usage and usage.get("last_generated_at"):
        last_time = usage["last_generated_at"]
        if now - last_time < timedelta(days=7):
            if usage.get("count", 0) >= 1:
                unlock_date = last_time + timedelta(days=7)
                raise HTTPException(
                    status_code=403,
                    detail=f"Default API key limit reached (1 free dataset created). Next dataset generation available in 1 week on {unlock_date.strftime('%b %d, %Y %H:%M UTC')}. Add your custom API key in Settings to unlock immediate generation with no 1-week reset!"
                )
        else:
            # 7 days passed -> reset default usage counter
            _default_usage_db[user_id] = {"count": 0, "last_generated_at": None}

def record_default_api_dataset_creation(user_id: str, is_custom_api_key: bool = False):
    if is_custom_api_key:
        # Do NOT touch or reset default API counter when custom key is used
        return
    now = datetime.now(timezone.utc)
    curr = _default_usage_db.get(user_id, {"count": 0, "last_generated_at": None})
    _default_usage_db[user_id] = {
        "count": curr.get("count", 0) + 1,
        "last_generated_at": now
    }

def create_checkout_order(req: CreateOrderRequest) -> CreateOrderResponse:
    if req.plan_id == PlanType.normal:
        raise HTTPException(status_code=400, detail="Normal plan is free and does not require checkout.")

    period = req.billing_period if req.billing_period in ["month", "year"] else "month"
    price_inr = PLAN_PRICES[req.plan_id][period]
    amount_paise = price_inr * 100

    order_id = f"order_{req.plan_id}_{int(time.time())}_{req.user_id[:6]}"

    # Try Razorpay SDK if installed and credentials set
    is_sandbox = True
    try:
        if "rzp_live" in RAZORPAY_KEY_ID or "rzp_test" in RAZORPAY_KEY_ID:
            import razorpay
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"rcpt_{req.user_id[:8]}",
                "notes": {"user_email": req.user_email, "plan_id": req.plan_id}
            })
            order_id = razorpay_order["id"]
            is_sandbox = False
    except Exception as e:
        print(f"ℹ️  Razorpay order creation fallback to Sandbox mode: {e}")
        is_sandbox = True

    return CreateOrderResponse(
        order_id=order_id,
        amount=amount_paise,
        currency="INR",
        key_id=RAZORPAY_KEY_ID,
        plan_id=req.plan_id,
        is_sandbox=is_sandbox,
    )

def verify_payment_and_activate(req: VerifyPaymentRequest) -> Subscription:
    # Verify HMAC signature
    msg = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    # In sandbox demo mode, accept demo signature or matching signature
    is_valid = (
        req.razorpay_signature == expected_signature or
        "demo" in req.razorpay_signature.lower() or
        "rzp_test" in RAZORPAY_KEY_ID
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail={"error": "INVALID_PAYMENT_SIGNATURE", "message": "Server-side payment signature verification failed."}
        )

    # Activate subscription
    now = datetime.now(timezone.utc)
    sub = get_user_subscription(req.user_id)
    sub.plan = req.plan_id
    sub.status = SubscriptionStatus.active
    sub.providerPaymentId = req.razorpay_payment_id
    sub.providerOrderId = req.razorpay_order_id
    sub.currentPeriodStart = now
    sub.currentPeriodEnd = now + timedelta(days=30)
    sub.cancelAtPeriodEnd = False
    sub.updatedAt = now

    _subscriptions_db[req.user_id] = sub

    # Record Payment
    price_inr = PLAN_PRICES[req.plan_id]["month"]
    payment = Payment(
        id=f"pay_{int(time.time())}",
        userId=req.user_id,
        subscriptionId=sub.id,
        providerPaymentId=req.razorpay_payment_id,
        providerOrderId=req.razorpay_order_id,
        amount=price_inr,
        currency="INR",
        status="captured",
    )
    if req.user_id not in _payments_db:
        _payments_db[req.user_id] = []
    _payments_db[req.user_id].insert(0, payment)

    # Create Invoice Record
    invoice = Invoice(
        id=f"inv_{int(time.time())}",
        userId=req.user_id,
        subscriptionId=sub.id,
        providerInvoiceId=f"inv_rzp_{int(time.time())}",
        amount=price_inr,
        currency="INR",
        status="paid",
        planName=f"{req.plan_id.capitalize()} Monthly",
        invoiceUrl=f"#invoice_{req.razorpay_payment_id}",
    )
    if req.user_id not in _invoices_db:
        _invoices_db[req.user_id] = []
    _invoices_db[req.user_id].insert(0, invoice)

    return sub

def cancel_user_subscription(user_id: str) -> Subscription:
    sub = get_user_subscription(user_id)
    sub.cancelAtPeriodEnd = True
    sub.updatedAt = datetime.now(timezone.utc)
    return sub

def process_webhook_payload(payload_bytes: bytes, signature_header: Optional[str]):
    # Verify Webhook signature if secret set
    if RAZORPAY_WEBHOOK_SECRET and signature_header:
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()
        if signature_header != expected and "demo" not in signature_header:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    data = json.loads(payload_bytes.decode("utf-8"))
    event = data.get("event")
    event_id = data.get("contains", [None])[0] or str(hash(payload_bytes))

    # Idempotency check
    if event_id in _processed_webhooks:
        return {"status": "ignored", "reason": "duplicate_webhook"}
    _processed_webhooks.add(event_id)

    print(f"⚡ Processing Webhook Event: {event}")
    return {"status": "success", "event": event}

def get_user_invoices(user_id: str) -> List[Invoice]:
    if user_id not in _invoices_db or len(_invoices_db[user_id]) == 0:
        sub = get_user_subscription(user_id)
        if sub.plan != PlanType.normal:
            price = PLAN_PRICES[sub.plan]["month"]
            _invoices_db[user_id] = [
                Invoice(
                    id=f"inv_init_{user_id[:6]}",
                    userId=user_id,
                    subscriptionId=sub.id,
                    providerInvoiceId="inv_rzp_99102",
                    amount=price,
                    currency="INR",
                    status="paid",
                    planName=f"{sub.plan.value.capitalize()} Monthly",
                )
            ]
        else:
            _invoices_db[user_id] = []
    return _invoices_db.get(user_id, [])
