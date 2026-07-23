"""Auth endpoints with OAuth support."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, Payment
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserResponse
from app.services.auth import verify_password, hash_password, create_access_token, decode_token
import httpx
import json

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
    user.role = "admin"
    return {"status": "success", "message": "You are now admin!", "role": user.role}


# =============== OAUTH ENDPOINTS ===============

@router.get("/oauth/google/url")
async def google_oauth_url():
    """Get Google OAuth URL for frontend redirect."""
    if not settings.GOOGLE_CLIENT_ID:
        return {"url": None, "error": "Google OAuth not configured"}
    redirect_uri = f"{settings.FRONTEND_URL}/api/v1/auth/oauth/google/callback"
    url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}&redirect_uri={redirect_uri}&response_type=code&scope=email%20profile"
    return {"url": url}


@router.get("/oauth/github/url")
async def github_oauth_url():
    """Get GitHub OAuth URL for frontend redirect."""
    if not settings.GITHUB_CLIENT_ID:
        return {"url": None, "error": "GitHub OAuth not configured"}
    redirect_uri = f"{settings.FRONTEND_URL}/api/v1/auth/oauth/github/callback"
    url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={redirect_uri}&scope=read:user%20user:email"
    return {"url": url}


@router.post("/oauth/google/callback")
async def google_callback(code: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(400, "Google OAuth not configured")
    
    # Exchange code for token
    redirect_uri = f"{settings.FRONTEND_URL}/api/v1/auth/oauth/google/callback"
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        })
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to exchange code")
        tokens = resp.json()
    
    # Get user info
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"})
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to get user info")
        google_user = resp.json()
    
    email = google_user.get("email", "")
    name = google_user.get("name", email.split("@")[0] if email else "Google User")
    
    # Create or login user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        result = await db.execute(select(User))
        existing = result.scalars().all()
        user = User(
            email=email, name=name,
            hashed_password=hash_password(email + settings.SECRET_KEY),
            role="admin" if len(existing) == 0 else "user",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
    
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user={
        "id": str(user.id), "email": user.email, "name": user.name, "role": user.role,
        "subscription_status": user.subscription_status,
        "subscription_plan": user.subscription_plan,
    })


@router.post("/oauth/github/callback")
async def github_callback(code: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Handle GitHub OAuth callback."""
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(400, "GitHub OAuth not configured")
    
    # Exchange code for token
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://github.com/login/oauth/access_token", data={
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
        }, headers={"Accept": "application/json"})
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to exchange code")
        tokens = resp.json()
    
    # Get user info
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.github.com/user",
            headers={"Authorization": f"Bearer {tokens['access_token']}",
                      "Accept": "application/json"})
        if resp.status_code != 200:
            raise HTTPException(400, "Failed to get user info")
        gh_user = resp.json()
    
    login = gh_user.get("login", "")
    name = gh_user.get("name", login or "GitHub User")
    email = gh_user.get("email", f"{login}@github.oauth")
    
    if not email or "@" not in email:
        # Try to fetch emails
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {tokens['access_token']}"})
            if resp.status_code == 200:
                emails = resp.json()
                for e in emails:
                    if e.get("primary") and e.get("verified"):
                        email = e["email"]
                        break
                if not email and emails:
                    email = emails[0]["email"]
    
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        result = await db.execute(select(User))
        existing = result.scalars().all()
        user = User(
            email=email, name=name,
            hashed_password=hash_password(email + settings.SECRET_KEY),
            role="admin" if len(existing) == 0 else "user",
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
    
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user={
        "id": str(user.id), "email": user.email, "name": user.name, "role": user.role,
        "subscription_status": user.subscription_status,
        "subscription_plan": user.subscription_plan,
    })
