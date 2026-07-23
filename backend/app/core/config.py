"""Application configuration."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "ModelHub API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    SECRET_KEY: str = "modelhub-super-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite+aiosqlite:///./modelhub.db"

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://localhost:3000"]

    UPLOAD_DIR: str = "static/uploads"
    RAILWAY_PUBLIC_DOMAIN: Optional[str] = None
    FRONTEND_URL: str = "https://web-production-a5dad.up.railway.app"

    # OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    # Supabase Settings
    SUPABASE_URL: str = "https://pxpxzasavltypdrkpmdw.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cHh6YXNhdmx0eXBkcmtwbWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDQxNzgsImV4cCI6MjEwMDM4MDE3OH0.HqC0jTkWEvUXRb_YPs0H_GQlrzGUnYHKrnz_m0iO_W0"
    SUPABASE_SERVICE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cHh6YXNhdmx0eXBkcmtwbWR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgwNDE3OCwiZXhwIjoyMTAwMzgwMTc4fQ.-CeECX7xcJwEbf2vKGmFBsy6xVsfKKqFXVMbIPXo7jk"

    @property
    def cors_origins_list(self) -> list[str]:
        origins = list(self.CORS_ORIGINS)
        if self.RAILWAY_PUBLIC_DOMAIN:
            origins.append(f"https://{self.RAILWAY_PUBLIC_DOMAIN}")
        # All frontend domains
        origins.append("https://frontend-production-bc308.up.railway.app")
        origins.append("https://web-production-a5dad.up.railway.app")
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
