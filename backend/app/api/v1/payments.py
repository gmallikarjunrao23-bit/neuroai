"""Payment endpoints - Strict AI verification with ban system."""

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
MAX_ATTEMPTS = 10

PLANS = {
    "basic": {"name": "Basic", "price": 199, "desc": "200 chats/day, all models"},
    "pro": {"name": "Professional", "price": 499, "desc": "500 chats/day, all models, image gen"},
    "premium": {"name": "Premium", "price": 999, "desc": "Unlimited chats, all models, priority"},
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

    # Check if banned
    if user.is_banned:
        raise HTTPException(status_code=403, detail={
            "error": "ACCOUNT_BANNED",
            "message": "Your account has been banned after 10+ failed attempts.",
            "reason": user.ban_reason,
            "support": "Contact admin to appeal"
        })

    content = await file.read()
    filename = file.filename or "screenshot.png"

    # Run AI verification
    verification = await payment_verifier.verify(content, filename, plan)

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = filename.split(".")[-1] if "." in filename else "png"
    fname = f"payment_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    with open(os.path.join(settings.UPLOAD_DIR, fname), "wb") as f:
        f.write(content)

    # Log the attempt with all AI results
    attempt = PaymentAttempt(
        user_id=user.id, plan=plan, amount=amount,
        ai_score=verification["score"],
        ai_checks=json.dumps(verification["checks"]),
        ai_analysis=verification.get("ai_analysis", ""),
        screenshot_path=f"/static/uploads/{fname}"
    )
    db.add(attempt)

    # Check if this is a real payment screenshot
    if not verification["passed"]:
        # Increment failed attempts
        user.failed_payment_attempts = (user.failed_payment_attempts or 0) + 1
        remaining = MAX_ATTEMPTS - user.failed_payment_attempts

        # BAN if over limit
        if user.failed_payment_attempts >= MAX_ATTEMPTS:
            user.is_banned = True
            user.ban_reason = f"Banned after {MAX_ATTEMPTS} failed payment attempts"
            await db.flush()
            raise HTTPException(status_code=403, detail={
                "error": "ACCOUNT_BANNED",
                "message": f"Permanently banned after {MAX_ATTEMPTS} invalid attempts.",
                "reason": user.ban_reason,
                "fraud_attempts": user.failed_payment_attempts
            })

        # Return rejection with full details
        await db.flush()
        raise HTTPException(status_code=400, detail={
            "error": "INVALID_PAYMENT_SCREENSHOT",
            "message": "Not a valid UPI payment screenshot",
            "score": verification["score"],
            "ai_analysis": verification.get("ai_analysis", ""),
            "rejection_reasons": verification["rejection_reasons"],
            "checks": verification["checks"],
            "detected_app": verification.get("detected_app"),
            "attempts_used": user.failed_payment_attempts,
            "attempts_remaining": remaining,
        })

    # VERIFICATION PASSED
    payment = Payment(
        user_id=user.id, plan=plan, amount=amount, upi_id=upi_id,
        screenshot_path=f"/static/uploads/{fname}",
        status="pending",
        admin_notes=f"AI Verified (Score: {verification['score']}/100)"
    )
    db.add(payment)
    user.failed_payment_attempts = 0

    await db.flush()
    await db.refresh(payment)

    return {
        "id": str(payment.id),
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "message": "Payment submitted for admin review!",
        "verification_score": verification["score"],
        "checks": verification["checks"],
        "detected_app": verification.get("detected_app"),
        "is_payment_screenshot": verification.get("is_payment_screenshot", False),
        "amount_matches": verification.get("amount_matches", False),
    }


@router.get("/my-payments")
async def get_my_payments(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return [{
        "id": str(p.id), "plan": p.plan, "amount": p.amount,
        "status": p.status if hasattr(p.status, 'value') else p.status,
        "screenshot_path": p.screenshot_path, "admin_notes": p.admin_notes,
        "created_at": p.created_at.isoformat() if p.created_at else None
    } for p in payments]


@router.get("/my-attempts")
async def get_my_attempts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PaymentAttempt).where(PaymentAttempt.user_id == user.id).order_by(PaymentAttempt.created_at.desc()).limit(10)
    )
    attempts = result.scalars().all()
    return [{
        "id": str(a.id), "plan": a.plan, "amount": a.amount,
        "ai_score": a.ai_score, "ai_analysis": a.ai_analysis,
        "ai_checks": json.loads(a.ai_checks) if a.ai_checks else [],
        "created_at": a.created_at.isoformat() if a.created_at else None
    } for a in attempts]
