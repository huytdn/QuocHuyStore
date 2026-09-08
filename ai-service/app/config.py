from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AI_SERVICE_")

    api_key: str
    torch_threads: int = 2
    detection_confidence: float = 0.35
    detection_padding_ratio: float = 0.10
    max_image_side: int = 1024
    request_timeout_seconds: int = 15


@lru_cache
def get_settings() -> Settings:
    return Settings()
