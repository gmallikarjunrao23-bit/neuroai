"""Auth endpoints with profile support."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User, Payment
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth import verify_password, hash_password, create_access_token, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


async def get_current_user(authorization: str = Header(...), db: AsyncSession = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth")
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.get(User, UUID(payload["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email exists")

    count_result = await db.execute(select(User))
    existing_users = count_result.scalars().all()
    is_first = len(existing_users) == 0

    user = User(
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
        role="admin" if is_first else "user",
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user={
        "id": str(user.id), "email": user.email, "name": user.name, "role": user.role
    })


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user={
        "id": str(user.id), "email": user.email, "name": user.name, "role": user.role,
        "subscription_status": user.subscription_status,
        "subscription_plan": user.subscription_plan,
        "kyc_verified": user.kyc_verified,
    })


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.get("/profile")
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user profile with payment history."""
    result = await db.execute(
        select(Payment).where(Payment.user_id == user.id).order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "subscription_status": user.subscription_status or "none",
        "subscription_plan": user.subscription_plan or "none",
        "kyc_verified": bool(user.kyc_verified),
        "api_calls_today": user.api_calls_today or 0,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "payments": [
            {
                "id": str(p.id),
                "plan": p.plan,
                "amount": p.amount,
                "status": p.status or "pending",
                "admin_notes": p.admin_notes,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ]
    }


@router.post("/become-admin")
async def become_admin(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Promote authenticated user to admin (one-time per user)."""
    user.role = "admin"
    return {"status": "success", "message": "You are now admin!", "role": user.role}
