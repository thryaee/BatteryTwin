"""
config.py
---------
Centralised configuration using pydantic-settings.

Priority order for database connection:
  1. DATABASE_URL  (set automatically by Render PostgreSQL add-on)
  2. Individual DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD vars

PORT is provided automatically by Render for the web service.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8-sig",   # handles BOM + special chars on Windows
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_env: str = Field(default="development")
    log_level: str = Field(default="INFO")

    # MQTT
    mqtt_broker_host: str = Field(default="localhost")
    mqtt_broker_port: int = Field(default=1883)
    mqtt_username: str = Field(default="")
    mqtt_password: str = Field(default="")
    mqtt_topic_data: str = Field(default="chargex/battery/data")
    mqtt_topic_relay: str = Field(default="chargex/relay/control")

    # Database — individual vars (used locally and as fallback)
    db_host: str = Field(default="localhost")
    db_port: int = Field(default=5432)
    db_name: str = Field(default="batterytwin")
    db_user: str = Field(default="postgres")
    db_password: str = Field(default="password")

    # Database — full URL override (set by Render PostgreSQL add-on)
    # When DATABASE_URL is set it takes priority over individual DB_* vars.
    database_url_override: str = Field(default="", alias="DATABASE_URL")

    # FastAPI
    api_host: str = Field(default="0.0.0.0")
    # PORT is injected by Render; falls back to 8000 for local dev
    api_port: int = Field(default=int(os.environ.get("PORT", 8000)))
    cors_origins: str = Field(default="http://localhost:3000,http://localhost:5173")

    # Simulator
    use_simulator: bool = Field(default=True)
    simulator_interval_seconds: float = Field(default=2.0)

    # ML
    ml_model_dir: str = Field(default="ml/saved_models")

    # Relay safety thresholds
    relay_max_temp_c: float = Field(default=45.0)
    relay_min_voltage_v: float = Field(default=2.5)
    relay_max_voltage_v: float = Field(default=4.25)
    relay_max_current_a: float = Field(default=3.0)

    # JWT / Auth
    jwt_secret_key: str = Field(default="CHANGE_THIS_IN_PRODUCTION_USE_OPENSSL_RAND")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    refresh_token_expire_days: int = Field(default=7)

    # Password policy
    password_min_length: int = Field(default=8)

    # Rate limiting (slowapi)
    auth_rate_limit: str = Field(default="10/minute")

    @property
    def database_url(self) -> str:
        """
        Returns the SQLAlchemy database URL.

        Render injects DATABASE_URL as a postgres:// URI.
        SQLAlchemy requires postgresql+psycopg2:// so we fix the scheme.
        """
        if self.database_url_override:
            url = self.database_url_override
            # Fix Render's legacy postgres:// scheme
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif url.startswith("postgresql://") and "+psycopg2" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url

        # Fall back to individual DB_* vars
        from urllib.parse import quote_plus
        safe_password = quote_plus(self.db_password)
        return (
            f"postgresql+psycopg2://{self.db_user}:{safe_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"


# Singleton – import this everywhere
settings = Settings()
