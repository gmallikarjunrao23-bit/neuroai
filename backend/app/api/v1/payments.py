"""Payment & Billing endpoints."""

import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, Payment
from app.schemas.user import PaymentRequest, PaymentResponse, PaymentApprove
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


PLANS = {
    "starter": {"name": "Starter", "price": 99, "desc": "100 chats/day, 5 models"},
    "pro": {"name": "Professional", "price": 499, "desc": "500 chats/day, all models, image gen"},
    "premium": {"name": "Premium", "price": 999, "desc": "Unlimited chats, all models, priority"},
    "lifetime": {"name": "Lifetime", "price": 4999, "desc": "Lifetime access, everything included"},
}

UPI_ID = "toxic-karthik.sai@fam"


@router.get("/plans")
async def get_plans():
    """Get available subscription plans."""
    return {
        "upi_id": UPI_ID,
        "plans": PLANS
    }


@router.post("/initiate", response_model=PaymentResponse)
async def initiate_payment(
    plan: str = Form(...),
    amount: float = Form(...),
    upi_id: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initiate payment with UPI screenshot."""
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Save screenshot
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"payment_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    payment = Payment(
        user_id=user.id,
        plan=plan,
        amount=amount,
        upi_id=upi_id,
        screenshot_path=f"/static/uploads/{filename}",
        status="pending"
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    
    return PaymentResponse(
        id=payment.id,
        plan=payment.plan,
        amount=payment.amount,
        upi_id=payment.upi_id,
        status=payment.status.value if hasattr(payment.status, 'value') else payment.status,
        screenshot_path=payment.screenshot_path,
        created_at=payment.created_at
    )


@router.get("/my-payments")
async def get_my_payments(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "plan": p.plan,
            "amount": p.amount,
            "upi_id": p.upi_id,
            "status": p.status.value if hasattr(p.status, 'value') else p.status,
            "screenshot_path": p.screenshot_path,
            "admin_notes": p.admin_notes,
            "created_at": p.created_at.isoformat()
        }
        for p in payments
    ]
