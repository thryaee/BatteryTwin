"""
config.py
---------
Centralised configuration using pydantic-settings.
All values are read from environment variables or the .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
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

    # Database
    db_host: str = Field(default="localhost")
    db_port: int = Field(default=5432)
    db_name: str = Field(default="batterytwin")
    db_user: str = Field(default="postgres")
    db_password: str = Field(default="password")

    # FastAPI
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)
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

    @property
    def database_url(self) -> str:
        from urllib.parse import quote_plus
        # quote_plus encodes special chars like @ # % in the password
        safe_password = quote_plus(self.db_password)
        return (
            f"postgresql+psycopg2://{self.db_user}:{safe_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


# Singleton – import this everywhere
settings = Settings()
