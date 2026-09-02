"""
ml/rul_model.py
---------------
Remaining Useful Life (RUL) Prediction Model.

⚠️  MODEL NOTICE
Trained on SYNTHETIC data. Replace with real battery cycle data for
accurate predictions.

Model: Random Forest Regressor (Scikit-learn)
Target: rul_cycles (integer – how many charge cycles remain before EOL)

Features used:
    - cycle_number
    - soh_percent
    - voltage_v
    - temperature_c
    - internal_resistance_ohm
    - degradation_rate          – SOH lost per cycle
    - c_rate
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

FEATURES = [
    "cycle_number",
    "soh_percent",
    "voltage_v",
    "temperature_c",
    "internal_resistance_ohm",
    "degradation_rate",
    "c_rate",
]
TARGET = "rul_cycles"
MODEL_FILENAME = "rul_model.pkl"


class RULModel:
    """Wrapper for the Scikit-learn RUL prediction pipeline."""

    def __init__(self) -> None:
        self._pipeline: Pipeline | None = None
        self._model_path = Path(settings.ml_model_dir) / MODEL_FILENAME
        self._is_trained = False

    # ── Public API ─────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        """Train the RUL model. `df` must contain FEATURES + TARGET columns."""
        missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
        if missing:
            raise ValueError(f"Training data missing columns: {missing}")

        X = df[FEATURES].values
        y = df[TARGET].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self._pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("model", RandomForestRegressor(
                n_estimators=200,
                max_depth=12,
                min_samples_leaf=3,
                random_state=42,
                n_jobs=-1,
            )),
        ])

        self._pipeline.fit(X_train, y_train)
        y_pred = self._pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        self._is_trained = True

        metrics = {
            "model": "RULModel",
            "mae_cycles": round(mae, 2),
            "r2": round(r2, 4),
            "n_samples": len(df),
            "data_source": "SYNTHETIC",
        }
        logger.info(f"RUL model trained | MAE={mae:.2f} cycles R²={r2:.4f} | n={len(df)}")
        return metrics

    def save(self) -> Path:
        if not self._is_trained:
            raise RuntimeError("Model has not been trained yet.")
        self._model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self._pipeline, self._model_path)
        logger.info(f"RUL model saved → {self._model_path}")
        return self._model_path

    def load(self) -> bool:
        if self._model_path.exists():
            self._pipeline = joblib.load(self._model_path)
            self._is_trained = True
            logger.info(f"RUL model loaded ← {self._model_path}")
            return True
        logger.warning(f"No saved RUL model found at {self._model_path}")
        return False

    def predict(self, features: dict) -> dict:
        """
        Predict remaining useful life in charge cycles.

        Returns
        -------
        dict
            { rul_cycles, rul_days_estimate, confidence, data_source, model_note }
        """
        if not self._is_trained:
            return self._fallback_prediction(features)

        row = self._build_feature_row(features)
        rul_pred = float(self._pipeline.predict(row)[0])
        rul_pred = max(0.0, rul_pred)

        # Rough real-world estimate: assume 1 cycle/day average usage
        rul_days = rul_pred * 1.0

        return {
            "rul_cycles": round(rul_pred, 0),
            "rul_days_estimate": round(rul_days, 0),
            "confidence": "medium",
            "data_source": "SYNTHETIC_MODEL",
            "model_note": (
                "⚠ Trained on synthetic data. "
                "Connect real battery data for accurate RUL prediction."
            ),
        }

    @property
    def is_trained(self) -> bool:
        return self._is_trained

    # ── Private helpers ────────────────────────────────────────────

    def _build_feature_row(self, features: dict) -> np.ndarray:
        defaults = {
            "cycle_number": 1,
            "soh_percent": 100.0,
            "voltage_v": 3.7,
            "temperature_c": 25.0,
            "internal_resistance_ohm": 0.08,
            "degradation_rate": 0.02,
            "c_rate": 0.5,
        }
        row = [features.get(f, defaults[f]) for f in FEATURES]
        return np.array(row).reshape(1, -1)

    @staticmethod
    def _fallback_prediction(features: dict) -> dict:
        """Rule-based RUL estimate using SOH as a proxy."""
        soh = features.get("soh_percent", 100.0)
        # Linear: SOH 100% → 500 cycles, SOH 60% → 0 cycles
        rul = max(0.0, (soh - 60.0) / 40.0 * 500.0)
        return {
            "rul_cycles": round(rul, 0),
            "rul_days_estimate": round(rul, 0),
            "confidence": "low",
            "data_source": "RULE_BASED_FALLBACK",
            "model_note": "Model not trained yet. Using rule-based estimate.",
        }


# ── Module-level singleton ─────────────────────────────────────────
_rul_model: RULModel | None = None


def get_rul_model() -> RULModel:
    global _rul_model
    if _rul_model is None:
        _rul_model = RULModel()
        _rul_model.load()
    return _rul_model
