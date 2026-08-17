import sys
import os

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
try:
    from backend.main import app
    from backend.billing import (
        _subscriptions_db, _usage_db, _default_usage_db, PlanType, SubscriptionStatus, Subscription, Usage
    )
except ImportError:
    from main import app
    from billing import (
        _subscriptions_db, _usage_db, _default_usage_db, PlanType, SubscriptionStatus, Subscription, Usage
    )

client = TestClient(app)

def setup_function():
    _subscriptions_db.clear()
    _usage_db.clear()
    _default_usage_db.clear()

def test_normal_plan_5000_rows_allow():
    user_email = "student_test_5000@datagen.ai"

    response = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "finance",
            "num_samples": 5000,
            "user_email": user_email,
            "is_custom_api_key": False
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_requested"] == 5000

def test_default_api_5001_rows_reject():
    user_email = "student_test_5001@datagen.ai"

    response = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "finance",
            "num_samples": 5001,
            "user_email": user_email,
            "is_custom_api_key": False
        }
    )
    assert response.status_code == 400
    err = response.json()["detail"]
    assert "5,000 records" in err

def test_default_api_second_dataset_cooldown_reject():
    user_email = "student_test_dataset2@datagen.ai"

    # First dataset generation -> ALLOW
    res1 = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "finance",
            "num_samples": 50,
            "user_email": user_email,
            "is_custom_api_key": False
        }
    )
    assert res1.status_code == 200

    # Second dataset generation within 1 week -> REJECT (403 Cooldown)
    res2 = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "healthcare",
            "num_samples": 50,
            "user_email": user_email,
            "is_custom_api_key": False
        }
    )
    assert res2.status_code == 403
    err = res2.json()["detail"]
    assert "1 week" in err

def test_custom_api_key_bypasses_cooldown():
    user_email = "custom_key_user@datagen.ai"

    # First dataset with custom API key
    res1 = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "finance",
            "num_samples": 100,
            "user_email": user_email,
            "api_key": "sk-custom-user-key-12345",
            "is_custom_api_key": True
        }
    )
    assert res1.status_code == 200

    # Second dataset with custom API key -> ALSO ALLOWED (NO COOLDOWN!)
    res2 = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "healthcare",
            "num_samples": 100,
            "user_email": user_email,
            "api_key": "sk-custom-user-key-12345",
            "is_custom_api_key": True
        }
    )
    assert res2.status_code == 200

def test_pro_plan_unlimited_access():
    user_email = "pro_user_test@datagen.ai"
    user_id = user_email.replace("@", "_").replace(".", "_")

    # Set user to Pro plan
    _subscriptions_db[user_id] = Subscription(
        id=f"sub_{user_id}",
        userId=user_id,
        plan=PlanType.pro,
        status=SubscriptionStatus.active
    )

    # 10,000 rows generation -> ALLOW
    res = client.post(
        "/generate",
        json={
            "task_type": "classification",
            "domain": "finance",
            "num_samples": 1000,
            "user_email": user_email,
            "plan": "pro"
        }
    )
    assert res.status_code == 200

def test_payment_verification_signature():
    response = client.post(
        "/api/billing/verify-payment",
        json={
            "user_id": "usr_test_verification",
            "user_email": "verify_test@datagen.ai",
            "plan_id": "pro",
            "razorpay_order_id": "order_test_12345",
            "razorpay_payment_id": "pay_test_67890",
            "razorpay_signature": "demo_signature_ok"
        }
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["subscription"]["plan"] == "pro"
