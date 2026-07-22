"""Chat & AI endpoints with session-based conversation memory."""

from datetime import datetime, timedelta
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.core.database import get_db
from app.models.user import User, ChatHistory, ImageGeneration
from app.schemas.user import ChatRequest, ChatResponse
from app.services.ai_service import ai_service
from app.api.v1.auth import get_current_user

router = APIRouter(tags=["AI"])


@router.get("/models")
async def list_models():
    return ai_service.get_models()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Use session_id from request or generate one
    session_id = req.session_id or f"session_{user.id}_{datetime.utcnow().strftime('%Y%m%d')}"
    
    # Check subscription / daily limit
    if user.subscription_status == "none" or user.subscription_status == "inactive":
        today = datetime.utcnow().date()
        result = await db.execute(
            select(func.count()).where(
                ChatHistory.user_id == user.id,
                func.date(ChatHistory.created_at) == today
            )
        )
        daily_count = result.scalar() or 0
        if daily_count >= 50:
            raise HTTPException(status_code=402, detail="Daily limit reached. Please subscribe.")

    # 🔥 Get conversation memory — last 10 messages from SAME session
    memory_result = await db.execute(
        select(ChatHistory)
        .where(
            ChatHistory.user_id == user.id,
            ChatHistory.session_id == session_id
        )
        .order_by(ChatHistory.created_at.desc())
        .limit(10)
    )
    previous_chats = memory_result.scalars().all()
    
    # Build conversation context
    conversation_history = []
    for chat_msg in reversed(previous_chats):  # oldest first
        conversation_history.append({"role": "user", "content": chat_msg.prompt})
        conversation_history.append({"role": "assistant", "content": chat_msg.response[:2000]})
    
    # 🔥 Handle attached files - read content and add to context
    enriched_message = req.message
    if req.files:
        import os
        from app.core.config import settings
        
        file_context = "\n\n--- ATTACHED FILES ---\n"
        for f in req.files:
            ext = f.name.split(".")[-1].lower() if "." in f.name else ""
            is_image = f.type and f.type.startswith("image/")
            is_text = ext in ["py","js","ts","jsx","tsx","txt","md","json","css","html","csv","xml","yaml","yml","toml","ini","cfg","log","sh","bash","sql","r","rb","go","rs","java","cpp","c","h","hpp","php","swift","kt","scala","pl","pm","lua","vim","pyw","bat","ps1","env","gitignore","dockerfile","makefile","gradle","lock","sum"]
            
            if is_image:
                file_context += f"\n📷 Image: {f.name}\n(The user attached an image file named {f.name})\n"
            elif is_text:
                # 🔥 FIX: Extract filename from URL and construct path directly
                url_filename = f.url.split("/")[-1] if f.url else ""
                file_dir = os.path.join(settings.UPLOAD_DIR, "files")
                file_path = os.path.join(file_dir, url_filename) if url_filename else None
                
                # Also check in UPLOAD_DIR directly (backward compat)
                if not file_path or not os.path.exists(file_path):
                    file_path = os.path.join(settings.UPLOAD_DIR, url_filename) if url_filename else None
                
                file_found = file_path and os.path.exists(file_path)
                
                if file_found:
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="replace") as fh:
                            content = fh.read()
                        max_chars = 4000
                        if len(content) > max_chars:
                            content = content[:max_chars] + "\n\n...[truncated, full file available for download]"
                        file_context += f"\n📄 File: {f.name}\n```{ext}\n{content}\n```\n"
                    except Exception as e:
                        file_context += f"\n📄 File: {f.name} (reading error: {str(e)[:50]})\n"
                else:
                    file_context += f"\n📄 File: {f.name}\n(The user attached a file named {f.name}. I should acknowledge it.)\n"
            else:
                file_context += f"\n📎 File: {f.name} (type: {f.type or 'unknown'})\n"
        
        file_context += "\n--- END ATTACHED FILES ---\nUser has attached the above file(s). Please acknowledge and analyze them accordingly."
        enriched_message += file_context
    
    # Pass memory to AI
    result = await ai_service.chat_with_memory(req.model, enriched_message, conversation_history)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    # Handle image response
    if result.get("is_image"):
        img_gen = ImageGeneration(user_id=user.id, prompt=req.message)
        if result.get("image_url"):
            img_gen.image_url = result["image_url"]
        db.add(img_gen)
        await db.flush()
        return ChatResponse(
            model=req.model,
            response=result.get("response", "[Image generated]"),
            tokens_used=1,
            image_url=result.get("image_url")
        )
    
    # Save to history with session_id
    history = ChatHistory(
        user_id=user.id,
        session_id=session_id,
        model=req.model,
        prompt=req.message,
        response=result["response"],
        tokens_used=len(result["response"]) // 4
    )
    db.add(history)
    
    user.api_calls_today += 1
    user.total_tokens_used += len(result["response"]) // 4
    
    return ChatResponse(
        model=req.model,
        response=result["response"],
        tokens_used=len(result["response"]) // 4,
        reasoning=result.get("reasoning")
    )


@router.get("/sessions")
async def get_sessions(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get distinct sessions with message count and last message."""
    result = await db.execute(
        select(
            ChatHistory.session_id,
            func.count(ChatHistory.id).label("msg_count"),
            func.max(ChatHistory.created_at).label("last_active"),
            func.min(ChatHistory.prompt).label("first_prompt")
        )
        .where(ChatHistory.user_id == user.id)
        .group_by(ChatHistory.session_id)
        .order_by(func.max(ChatHistory.created_at).desc())
        .limit(20)
    )
    sessions = result.all()
    return [
        {
            "session_id": s.session_id,
            "msg_count": s.msg_count,
            "last_active": s.last_active.isoformat() if s.last_active else None,
            "preview": s.first_prompt[:80] if s.first_prompt else "New conversation"
        }
        for s in sessions
    ]


@router.get("/chat/history")
async def get_chat_history(
    session_id: str = None,
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(ChatHistory).where(ChatHistory.user_id == user.id)
    if session_id:
        query = query.where(ChatHistory.session_id == session_id)
    query = query.order_by(ChatHistory.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    chats = result.scalars().all()
    return [
        {
            "id": str(c.id),
            "model": c.model,
            "prompt": c.prompt,
            "response": c.response,
            "image_url": getattr(c, 'image_url', None),
            "created_at": c.created_at.isoformat(),
            "session_id": c.session_id
        }
        for c in chats
    ]


@router.get("/usage")
async def get_usage(user: User = Depends(get_current_user)):
    return {
        "api_calls_today": user.api_calls_today,
        "total_tokens_used": user.total_tokens_used,
        "subscription_status": user.subscription_status.value if hasattr(user.subscription_status, 'value') else user.subscription_status,
        "subscription_plan": user.subscription_plan,
        "kyc_verified": user.kyc_verified
    }


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    """Upload a file for chat context."""
    import os
    from app.core.config import settings
    upload_dir = os.path.join(settings.UPLOAD_DIR, "files")
    os.makedirs(upload_dir, exist_ok=True)
    
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    file_url = f"/static/uploads/files/{filename}"
    file_type = file.content_type or "application/octet-stream"
    
    return {
        "filename": file.filename,
        "url": file_url,
        "type": file_type,
        "size": len(content)
    }
