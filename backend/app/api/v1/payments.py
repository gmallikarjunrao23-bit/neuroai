"""Payment & Billing endpoints with screenshot verification."""

import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, Payment
from app.api.v1.auth import get_current_user
from app.services.ai_service import ai_service

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

    content = await file.read()
    filename = file.filename or "screenshot.png"

    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = filename.split(".")[-1] if "." in filename else "png"
    fname = f"payment_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    fpath = os.path.join(settings.UPLOAD_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(content)

    # Run verification (non-blocking, just informational)
    verification = await ai_service.verify_payment_screenshot(filename, content)
    ai_check = await ai_service.verify_payment_with_ai(content)

    notes = f"AI Score: {verification['score']}/100"
    if ai_check.get("analysis"):
        notes += f" | AI: {ai_check['analysis']}"
    if not ai_check.get("is_payment", True):
        notes += " | Flagged: May not be payment screenshot"

    payment = Payment(
        user_id=user.id,
        plan=plan,
        amount=amount,
        upi_id=upi_id,
        screenshot_path=f"/static/uploads/{fname}",
        status="pending",
        admin_notes=notes
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)

    return {
        "id": str(payment.id),
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "message": "Payment submitted! Admin will review shortly."
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
            "upi_id": p.upi_id,
            "status": p.status if hasattr(p.status, 'value') else p.status,
            "screenshot_path": p.screenshot_path,
            "admin_notes": p.admin_notes,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in payments
    ]
