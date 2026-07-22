"""Admin panel endpoints."""

from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from app.core.database import get_db
from app.models.user import User, Payment
from app.api.v1.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/dashboard")
async def admin_dashboard(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    total_payments = (await db.execute(select(func.count()).select_from(Payment))).scalar() or 0
    pending_payments = (await db.execute(
        select(func.count()).where(Payment.status == "pending")
    )).scalar() or 0
    
    recent_users = await db.execute(select(User).order_by(User.created_at.desc()).limit(5))
    
    return {
        "total_users": total_users,
        "total_payments": total_payments,
        "pending_payments": pending_payments,
        "revenue": 0,
        "recent_users": [
            {"id": str(u.id), "name": u.name, "email": u.email, "created_at": u.created_at.isoformat()}
            for u in recent_users.scalars().all()
        ]
    }


@router.get("/users")
async def list_users(admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id), "email": u.email, "name": u.name,
            "role": u.role or "user",
            "subscription_status": u.subscription_status or "none",
            "subscription_plan": u.subscription_plan or "none",
            "kyc_verified": bool(u.kyc_verified),
            "api_calls_today": u.api_calls_today or 0,
            "is_banned": bool(u.is_banned) if hasattr(u, 'is_banned') else False,
            "ban_reason": u.ban_reason,
            "failed_payment_attempts": u.failed_payment_attempts or 0,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]


@router.get("/payments")
async def list_payments(
    status_filter: str = None,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    query = select(Payment).order_by(Payment.created_at.desc())
    if status_filter:
        query = query.where(Payment.status == status_filter)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    response = []
    for p in payments:
        user = await db.get(User, p.user_id)
        response.append({
            "id": str(p.id), "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "user_id": str(p.user_id), "plan": p.plan, "amount": p.amount,
            "upi_id": p.upi_id, "screenshot_path": p.screenshot_path,
            "status": p.status or "pending",
            "admin_notes": p.admin_notes, "created_at": p.created_at.isoformat()
        })
    return response


@router.post("/payments/{payment_id}/approve")
async def approve_payment(
    payment_id: UUID, data: dict,
    admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = data.get("status", "approved")
    payment.admin_notes = data.get("admin_notes", "")
    payment.approved_by = admin.id
    payment.approved_at = datetime.utcnow()
    
    if data.get("status") == "approved":
        user = await db.get(User, payment.user_id)
        if user:
            user.subscription_status = "active"
            user.subscription_plan = payment.plan
            user.subscription_end = datetime.utcnow() + timedelta(days=30)
    
    return {"status": "success", "message": f"Payment {data.get('status')}"}


@router.post("/users/{user_id}/toggle-kyc")
async def toggle_kyc(
    user_id: UUID, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.kyc_verified = not user.kyc_verified
    return {"status": "success", "kyc_verified": user.kyc_verified}

@router.post("/users/{user_id}/toggle-ban")
async def toggle_ban(
    user_id: UUID,
    data: dict = {},
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot ban another admin")

    user.is_banned = not user.is_banned
    if user.is_banned:
        user.ban_reason = data.get("reason", "Banned by admin for fraudulent activity")
    else:
        user.ban_reason = None
        user.failed_payment_attempts = 0

    return {
        "status": "success",
        "is_banned": user.is_banned,
        "ban_reason": user.ban_reason,
        "failed_payment_attempts": user.failed_payment_attempts
    }


@router.get("/users/{user_id}/attempts")
async def get_user_attempts(
    user_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    from app.models.user import PaymentAttempt
    result = await db.execute(
        select(PaymentAttempt).where(PaymentAttempt.user_id == user_id).order_by(PaymentAttempt.created_at.desc()).limit(20)
    )
    attempts = result.scalars().all()
    import json
    return [
        {
            "id": str(a.id),
            "plan": a.plan,
            "amount": a.amount,
            "ai_score": a.ai_score,
            "ai_analysis": a.ai_analysis[:200] if a.ai_analysis else "",
            "ai_checks": json.loads(a.ai_checks) if a.ai_checks else [],
            "is_payment_screenshot": a.is_payment_screenshot,
            "screenshot_path": a.screenshot_path,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in attempts
    ]
