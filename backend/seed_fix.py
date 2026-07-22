"""Seed admin role fix - run once."""
import asyncio, sys
sys.path.insert(0, ".")
from app.core.database import async_session_factory, engine, Base
from app.models.user import User
from sqlalchemy import select, text

async def fix():
    async with engine.connect() as conn:
        await conn.execute(text("UPDATE users SET role = 'admin' WHERE email = 'admin@modelhub.com'"))
        await conn.commit()
        print("✅ Admin role updated!")
    
    # Verify
    async with async_session_factory() as db:
        result = await db.execute(select(User).where(User.email == 'admin@modelhub.com'))
        user = result.scalar_one_or_none()
        if user:
            print(f"✅ {user.email} -> role: {user.role}")

asyncio.run(fix())
