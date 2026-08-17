from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from enum import Enum
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class TaskType(str, Enum):
    classification = "classification"
    summarization = "summarization"
    qa = "qa"
    ner = "ner"
    intent = "intent"

class PlanType(str, Enum):
    normal = "normal"
    pro = "pro"
    business = "business"

class SubscriptionStatus(str, Enum):
    active = "active"
    trialing = "trialing"
    past_due = "past_due"
    cancelled = "cancelled"
    expired = "expired"
    payment_failed = "payment_failed"
    paused = "paused"
    pending = "pending"

class UserRole(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

class User(BaseModel):
    id: str
    name: str
    email: str
    createdAt: datetime = Field(default_factory=utc_now)

class Subscription(BaseModel):
    id: str
    userId: str
    plan: PlanType = PlanType.normal
    status: SubscriptionStatus = SubscriptionStatus.active
    provider: str = "razorpay"
    providerCustomerId: Optional[str] = None
    providerSubscriptionId: Optional[str] = None
    providerPaymentId: Optional[str] = None
    providerOrderId: Optional[str] = None
    currentPeriodStart: Optional[datetime] = None
    currentPeriodEnd: Optional[datetime] = None
    cancelAtPeriodEnd: bool = False
    createdAt: datetime = Field(default_factory=utc_now)
    updatedAt: datetime = Field(default_factory=utc_now)

class Payment(BaseModel):
    id: str
    userId: str
    subscriptionId: Optional[str] = None
    providerPaymentId: str
    providerOrderId: str
    amount: float
    currency: str = "INR"
    status: str = "captured"
    createdAt: datetime = Field(default_factory=utc_now)

class Invoice(BaseModel):
    id: str
    userId: str
    subscriptionId: Optional[str] = None
    providerInvoiceId: Optional[str] = None
    amount: float
    currency: str = "INR"
    status: str = "paid"
    planName: str
    invoiceUrl: Optional[str] = None
    createdAt: datetime = Field(default_factory=utc_now)

class Usage(BaseModel):
    userId: str
    datasetsCreated: int = 0
    rowsGenerated: int = 0
    updatedAt: datetime = Field(default_factory=utc_now)

class Organization(BaseModel):
    id: str
    name: str
    ownerId: str
    createdAt: datetime = Field(default_factory=utc_now)

class OrganizationMember(BaseModel):
    organizationId: str
    userId: str
    role: UserRole = UserRole.member

# API Request/Response DTOs
class GenerationRequest(BaseModel):
    task_type: TaskType = TaskType.classification
    domain: str = "general"
    num_samples: int = Field(default=10, ge=1, le=100000)
    labels: Optional[List[str]] = None
    language: Optional[str] = "English"
    include_edge_cases: bool = True
    custom_instructions: Optional[str] = None
    llm_provider: Optional[str] = "gemini"
    api_key: Optional[str] = None
    is_custom_api_key: Optional[bool] = False
    user_email: Optional[str] = None
    user_id: Optional[str] = None
    plan: Optional[PlanType] = PlanType.normal

class ValidationResult(BaseModel):
    is_valid: bool
    issues: List[str] = []
    score: float

class DataSample(BaseModel):
    id: int
    input: str
    output: Any
    metadata: Dict[str, Any] = {}
    validation: Optional[ValidationResult] = None

class GenerationResponse(BaseModel):
    task_type: TaskType
    domain: str
    total_requested: int
    total_generated: int
    total_valid: int
    samples: List[DataSample]
    stats: Dict[str, Any] = {}

# Billing Checkout & Webhook DTOs
class CreateOrderRequest(BaseModel):
    user_id: str
    user_email: str
    plan_id: PlanType
    billing_period: str = "month" # "month" | "year"

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int # in paise
    currency: str = "INR"
    key_id: str
    plan_id: PlanType
    is_sandbox: bool = False

class VerifyPaymentRequest(BaseModel):
    user_id: str
    user_email: str
    plan_id: PlanType
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ChangePlanRequest(BaseModel):
    user_id: str
    new_plan_id: PlanType

class CancelSubscriptionRequest(BaseModel):
    user_id: str
    reason: Optional[str] = None