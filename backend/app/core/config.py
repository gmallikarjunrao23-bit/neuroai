"""Application configuration - Secure version with env vars."""

from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    APP_NAME: str = "NeuroAI API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # Security
    SECRET_KEY: str = "change-this-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = ""

    CORS_ORIGINS: list[str] = ["https://web-production-a5dad.up.railway.app"]

    UPLOAD_DIR: str = "static/uploads"
    RAILWAY_PUBLIC_DOMAIN: Optional[str] = None
    FRONTEND_URL: str = "https://web-production-a5dad.up.railway.app"

    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        origins = list(self.CORS_ORIGINS)
        if self.RAILWAY_PUBLIC_DOMAIN:
            origins.append(f"https://{self.RAILWAY_PUBLIC_DOMAIN}")
        origins.append("https://frontend-production-bc308.up.railway.app")
        origins.append("https://web-production-a5dad.up.railway.app")
        # Dev
        origins.extend(["http://localhost:3000", "https://localhost:3000"])
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
