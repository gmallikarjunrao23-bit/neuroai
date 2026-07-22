"""Payment endpoints - All submissions accepted for admin review."""

import os, uuid, json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, Payment, PaymentAttempt
from app.api.v1.auth import get_current_user
from app.services.payment_verifier import payment_verifier

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
    return {"upi_id": UPI_ID, "plans": PLANS}


@router.post("/initiate")
async def initiate_payment(
    plan: str = Form(...),
    amount: float = Form(...),
    upi_id: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    # Check banned
    if user.is_banned:
        raise HTTPException(status_code=403, detail={
            "error": "ACCOUNT_BANNED",
            "message": "Your account has been banned.",
            "reason": user.ban_reason or "Contact admin"
        })

    content = await file.read()
    filename = file.filename or "screenshot.png"

    # ALWAYS accept - just run checks for info, never reject
    verification = await payment_verifier.verify(content, filename, plan)

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = filename.split(".")[-1] if "." in filename else "png"
    fname = f"payment_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    with open(os.path.join(settings.UPLOAD_DIR, fname), "wb") as f:
        f.write(content)

    # Log attempt
    attempt = PaymentAttempt(
        user_id=user.id, plan=plan, amount=amount,
        ai_score=verification["score"],
        ai_checks=json.dumps(verification["checks"]),
        ai_analysis=verification.get("ai_analysis", ""),
        is_payment_screenshot=True,
        screenshot_path=f"/static/uploads/{fname}"
    )
    db.add(attempt)

    # Create payment - ALWAYS pending for admin review
    payment = Payment(
        user_id=user.id, plan=plan, amount=amount, upi_id=upi_id,
        screenshot_path=f"/static/uploads/{fname}",
        status="pending",
        admin_notes="Awaiting admin review"
    )
    db.add(payment)

    await db.flush()
    await db.refresh(payment)

    return {
        "id": str(payment.id),
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "message": "Payment submitted for admin review! ✅",
        "verification_score": verification["score"],
        "checks": verification["checks"]
    }


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
            "id": str(p.id), "plan": p.plan, "amount": p.amount,
            "status": p.status if hasattr(p.status, 'value') else p.status,
            "screenshot_path": p.screenshot_path,
            "admin_notes": p.admin_notes,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in payments
    ]


@router.get("/my-attempts")
async def get_my_attempts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PaymentAttempt).where(PaymentAttempt.user_id == user.id).order_by(PaymentAttempt.created_at.desc()).limit(10)
    )
    attempts = result.scalars().all()
    return [
        {
            "id": str(a.id), "plan": a.plan, "amount": a.amount,
            "ai_score": a.ai_score, "ai_analysis": a.ai_analysis,
            "ai_checks": json.loads(a.ai_checks) if a.ai_checks else [],
            "is_payment_screenshot": a.is_payment_screenshot,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attempts
    ]
