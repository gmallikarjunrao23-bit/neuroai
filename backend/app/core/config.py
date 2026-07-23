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
