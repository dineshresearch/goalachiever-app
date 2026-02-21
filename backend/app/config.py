"""
Application configuration and settings
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./goal_achiever.db"
    
    # JWT Authentication
    JWT_SECRET: str = "dev-secret-key-for-testing-only-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # Google Gemini AI API
    GEMINI_API_KEY: str = ""
    
    # Legacy Nebius (kept for backwards compat, now unused)
    NEBIUS_API_KEY: str = ""
    NEBIUS_API_URL: str = ""
    NEBIUS_MODEL: str = ""
    
    # Application
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "http://localhost:19000",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
