"""Payment & Billing endpoints with STRICT AI verification and ban system."""

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

    # === CHECK 0: Is user banned? ===
    if user.is_banned:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "ACCOUNT_BANNED",
                "message": "Your account has been banned due to multiple fake payment attempts.",
                "reason": user.ban_reason or "Fraudulent activity detected",
                "support": "Contact admin for assistance"
            }
        )

    content = await file.read()
    filename = file.filename or "screenshot.png"

    # === STEP 1: Run STRICT AI Verification ===
    verification = await payment_verifier.verify(content, filename, plan)
    
    # === STEP 2: Save the file ===
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = filename.split(".")[-1] if "." in filename else "png"
    fname = f"payment_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    fpath = os.path.join(settings.UPLOAD_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(content)

    # === STEP 3: Log the attempt ===
    attempt = PaymentAttempt(
        user_id=user.id,
        plan=plan,
        amount=amount,
        ai_score=verification["score"],
        ai_checks=json.dumps(verification["checks"]),
        ai_analysis=verification.get("ai_analysis", ""),
        is_payment_screenshot=verification["is_payment_screenshot"],
        screenshot_path=f"/static/uploads/{fname}"
    )
    db.add(attempt)

    # === STEP 4: Handle failed verification ===
    if not verification["passed"]:
        # Increment failed attempts
        user.failed_payment_attempts = (user.failed_payment_attempts or 0) + 1
        remaining = MAX_ATTEMPTS - user.failed_payment_attempts

        # If over limit, BAN the user permanently
        if user.failed_payment_attempts >= MAX_ATTEMPTS:
            user.is_banned = True
            user.ban_reason = f"Automatically banned after {MAX_ATTEMPTS} failed payment verification attempts"
            await db.flush()
            
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ACCOUNT_BANNED",
                    "message": f"Your account has been permanently banned after {MAX_ATTEMPTS} invalid payment attempts.",
                    "reason": user.ban_reason,
                    "fraud_attempts": user.failed_payment_attempts,
                    "support": "Contact admin to appeal"
                }
            )

        error_detail = {
            "error": "INVALID_PAYMENT_SCREENSHOT",
            "message": "Payment screenshot verification failed. Please upload a genuine UPI payment screenshot.",
            "score": verification["score"],
            "ai_analysis": verification.get("ai_analysis", ""),
            "rejection_reasons": verification["rejection_reasons"],
            "checks": verification["checks"],
            "attempts_used": user.failed_payment_attempts,
            "attempts_remaining": remaining,
            "is_payment_screenshot": verification["is_payment_screenshot"],
        }

        await db.flush()
        raise HTTPException(status_code=400, detail=error_detail)

    # === STEP 5: Verification PASSED ===
    payment = Payment(
        user_id=user.id,
        plan=plan,
        amount=amount,
        upi_id=upi_id,
        screenshot_path=f"/static/uploads/{fname}",
        status="pending",
        admin_notes=f"AI Verified (Score: {verification['score']}/100). Amount matched: {verification['amount_matches']}"
    )
    db.add(payment)
    
    # Reset failed attempts on success
    user.failed_payment_attempts = 0
    
    await db.flush()
    await db.refresh(payment)

    return {
        "id": str(payment.id),
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "message": "Payment screenshot verified! Admin will review shortly.",
        "verification_score": verification["score"],
        "checks": [c for c in verification["checks"] if c.get("severity") in ["success", "info"]]
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
            "id": str(p.id),
            "plan": p.plan,
            "amount": p.amount,
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
            "id": str(a.id),
            "plan": a.plan,
            "amount": a.amount,
            "ai_score": a.ai_score,
            "ai_analysis": a.ai_analysis,
            "ai_checks": json.loads(a.ai_checks) if a.ai_checks else [],
            "is_payment_screenshot": a.is_payment_screenshot,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attempts
    ]
