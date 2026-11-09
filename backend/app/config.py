import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    BIFROST_BASE_URL: str = Field(default="https://api.bifrost.maxim.ai/v1")
    BIFROST_API_KEY: str = Field(default="")
    BIFROST_MODEL: str = Field(default="gpt-4o-mini")
    BIFROST_FALLBACK_MODEL: str = Field(default="claude-3-5-haiku")
    
    TAVILY_API_KEY: str = Field(default="")
    
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./truthlens.db")
    PORT: int = Field(default=8000)
    HOST: str = Field(default="0.0.0.0")
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])
    ENVIRONMENT: str = Field(default="development")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

def update_runtime_settings(bifrost_base_url: str = None, bifrost_api_key: str = None, 
                           bifrost_model: str = None, tavily_api_key: str = None):
    """Allow updating keys dynamically from settings API."""
    global settings
    if bifrost_base_url is not None:
        settings.BIFROST_BASE_URL = bifrost_base_url.strip()
    if bifrost_api_key is not None:
        settings.BIFROST_API_KEY = bifrost_api_key.strip()
    if bifrost_model is not None:
        settings.BIFROST_MODEL = bifrost_model.strip()
    if tavily_api_key is not None:
        settings.TAVILY_API_KEY = tavily_api_key.strip()
