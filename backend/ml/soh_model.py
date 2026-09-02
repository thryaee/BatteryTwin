"""
ml/soh_model.py
---------------
State of Health (SOH) Estimation Model.

⚠️  MODEL NOTICE
Trained on SYNTHETIC data. Predictions are estimates, not validated measurements.
Replace training data with real battery logs to improve accuracy.

Model: Gradient Boosting Regressor (Scikit-learn)
Target: soh_percent (0–100 %)

Features used:
    - cycle_number        – how many cycles completed
    - voltage_v           – average terminal voltage
    - current_a           – average charge current
    - temperature_c       – average cell temperature
    - internal_resistance_ohm – internal resistance (proxy for ageing)
    - c_rate              – charging C-rate
    - capacity_mah        – remaining capacity
"""

import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

# ── Feature columns ────────────────────────────────────────────────
FEATURES = [
    "cycle_number",
    "voltage_v",
    "current_a",
    "temperature_c",
    "internal_resistance_ohm",
    "c_rate",
    "capacity_mah",
]
TARGET = "soh_percent"
MODEL_FILENAME = "soh_model.pkl"


class SOHModel:
    """
    Wrapper around the Scikit-learn SOH estimation pipeline.
    Handles training, saving, loading, and inference.
    """

    def __init__(self) -> None:
        self._pipeline: Pipeline | None = None
        self._model_path = Path(settings.ml_model_dir) / MODEL_FILENAME
        self._is_trained = False
        self._training_mae: float = 0.0
        self._training_r2: float = 0.0

    # ── Public API ─────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        """
        Train the SOH model on the provided DataFrame.

        Parameters
        ----------
        df : pd.DataFrame
            Must contain FEATURES + TARGET columns.

        Returns
        -------
        dict
            Training metrics: mae, r2, n_samples.
        """
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
            ("model", GradientBoostingRegressor(
                n_estimators=150,
                learning_rate=0.08,
                max_depth=4,
                subsample=0.85,
                random_state=42,
            )),
        ])

        self._pipeline.fit(X_train, y_train)
        y_pred = self._pipeline.predict(X_test)

        self._training_mae = mean_absolute_error(y_test, y_pred)
        self._training_r2 = r2_score(y_test, y_pred)
        self._is_trained = True

        metrics = {
            "model": "SOHModel",
            "mae": round(self._training_mae, 4),
            "r2": round(self._training_r2, 4),
            "n_samples": len(df),
            "data_source": "SYNTHETIC",
        }
        logger.info(
            f"SOH model trained | MAE={self._training_mae:.4f}% "
            f"R²={self._training_r2:.4f} | n={len(df)}"
        )
        return metrics

    def save(self) -> Path:
        """Persist the trained pipeline to disk."""
        if not self._is_trained:
            raise RuntimeError("Model has not been trained yet.")
        self._model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self._pipeline, self._model_path)
        logger.info(f"SOH model saved → {self._model_path}")
        return self._model_path

    def load(self) -> bool:
        """Load a previously saved model. Returns True if successful."""
        if self._model_path.exists():
            self._pipeline = joblib.load(self._model_path)
            self._is_trained = True
            logger.info(f"SOH model loaded ← {self._model_path}")
            return True
        logger.warning(f"No saved SOH model found at {self._model_path}")
        return False

    def predict(self, features: dict) -> dict:
        """
        Estimate SOH from a feature dict.

        Parameters
        ----------
        features : dict
            Must contain the FEATURES keys. Missing keys fall back to defaults.

        Returns
        -------
        dict
            { soh_percent, confidence, data_source, model_note }
        """
        if not self._is_trained:
            return self._fallback_prediction(features)

        row = self._build_feature_row(features)
        soh_pred = float(self._pipeline.predict(row)[0])
        soh_pred = max(0.0, min(100.0, soh_pred))

        return {
            "soh_percent": round(soh_pred, 2),
            "confidence": "medium",           # upgrade when trained on real data
            "data_source": "SYNTHETIC_MODEL",
            "model_note": (
                "⚠ Trained on synthetic data. "
                "Replace with real battery logs for accurate predictions."
            ),
        }

    @property
    def is_trained(self) -> bool:
        return self._is_trained

    # ── Private helpers ────────────────────────────────────────────

    def _build_feature_row(self, features: dict) -> np.ndarray:
        """Build a 2-D array from feature dict, filling defaults for missing keys."""
        defaults = {
            "cycle_number": 1,
            "voltage_v": 3.7,
            "current_a": 1.0,
            "temperature_c": 25.0,
            "internal_resistance_ohm": 0.08,
            "c_rate": 0.5,
            "capacity_mah": 2800.0,
        }
        row = [features.get(f, defaults[f]) for f in FEATURES]
        return np.array(row).reshape(1, -1)

    @staticmethod
    def _fallback_prediction(features: dict) -> dict:
        """
        Rule-based SOH estimate when no trained model is available.
        Uses internal resistance as the primary proxy for ageing.
        """
        r = features.get("internal_resistance_ohm", 0.08)
        # Linear rule: R=0.05Ω → SOH≈100%, R=0.25Ω → SOH≈0%
        soh = max(0.0, min(100.0, 100.0 - (r - 0.05) / 0.20 * 100.0))
        return {
            "soh_percent": round(soh, 2),
            "confidence": "low",
            "data_source": "RULE_BASED_FALLBACK",
            "model_note": "Model not trained yet. Using rule-based estimate.",
        }


# ── Module-level singleton ─────────────────────────────────────────
_soh_model: SOHModel | None = None


def get_soh_model() -> SOHModel:
    global _soh_model
    if _soh_model is None:
        _soh_model = SOHModel()
        _soh_model.load()   # loads from disk if available
    return _soh_model
