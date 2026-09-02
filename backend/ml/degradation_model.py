"""
ml/degradation_model.py
-----------------------
Battery Degradation Prediction Model.

⚠️  MODEL NOTICE
Trained on SYNTHETIC data.

Predicts the degradation rate (% SOH loss per cycle) given current
operating conditions. Used by the Charging Optimization Agent to
recommend charging parameters that minimise degradation.

Model: Ridge Regression (fast, interpretable, suitable for real-time inference)
Target: degradation_rate (% SOH lost per cycle)

Features:
    - temperature_c
    - c_rate              – charging C-rate (higher = faster degradation)
    - soc_percent         – current SOC (high SOC charging = more stress)
    - voltage_v
    - internal_resistance_ohm
    - cycle_number
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

FEATURES = [
    "temperature_c",
    "c_rate",
    "soc_percent",
    "voltage_v",
    "internal_resistance_ohm",
    "cycle_number",
]
TARGET = "degradation_rate"
MODEL_FILENAME = "degradation_model.pkl"


class DegradationModel:
    """
    Predicts per-cycle degradation rate.
    Uses polynomial features to capture non-linear stress interactions
    (e.g. high temperature × high C-rate compounds degradation).
    """

    def __init__(self) -> None:
        self._pipeline: Pipeline | None = None
        self._model_path = Path(settings.ml_model_dir) / MODEL_FILENAME
        self._is_trained = False

    # ── Public API ─────────────────────────────────────────────────

    def train(self, df: pd.DataFrame) -> dict:
        missing = [c for c in FEATURES + [TARGET] if c not in df.columns]
        if missing:
            raise ValueError(f"Training data missing columns: {missing}")

        X = df[FEATURES].values
        y = df[TARGET].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self._pipeline = Pipeline([
            ("poly", PolynomialFeatures(degree=2, include_bias=False)),
            ("scaler", StandardScaler()),
            ("model", Ridge(alpha=1.0)),
        ])

        self._pipeline.fit(X_train, y_train)
        y_pred = self._pipeline.predict(X_test)
        y_pred = np.clip(y_pred, 0, None)

        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        self._is_trained = True

        metrics = {
            "model": "DegradationModel",
            "mae": round(mae, 6),
            "r2": round(r2, 4),
            "n_samples": len(df),
            "data_source": "SYNTHETIC",
        }
        logger.info(
            f"Degradation model trained | MAE={mae:.6f} R²={r2:.4f} | n={len(df)}"
        )
        return metrics

    def save(self) -> Path:
        if not self._is_trained:
            raise RuntimeError("Model has not been trained yet.")
        self._model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self._pipeline, self._model_path)
        logger.info(f"Degradation model saved → {self._model_path}")
        return self._model_path

    def load(self) -> bool:
        if self._model_path.exists():
            self._pipeline = joblib.load(self._model_path)
            self._is_trained = True
            logger.info(f"Degradation model loaded ← {self._model_path}")
            return True
        logger.warning(f"No saved degradation model found at {self._model_path}")
        return False

    def predict(self, features: dict) -> dict:
        """
        Predict degradation rate for given operating conditions.

        Returns
        -------
        dict
            {
              degradation_rate,        – % SOH lost per cycle at current conditions
              degradation_at_slow_charge,  – if C-rate reduced to 0.2C
              degradation_at_optimal,      – at optimal conditions (25°C, 0.5C, 50% SOC)
              data_source,
              model_note
            }
        """
        if not self._is_trained:
            return self._fallback_prediction(features)

        current_deg = float(np.clip(
            self._pipeline.predict(self._build_feature_row(features))[0], 0, None
        ))

        # Predict degradation under slow-charge scenario
        slow_features = {**features, "c_rate": 0.2, "soc_percent": min(80.0, features.get("soc_percent", 50.0))}
        slow_deg = float(np.clip(
            self._pipeline.predict(self._build_feature_row(slow_features))[0], 0, None
        ))

        # Predict degradation under optimal conditions
        optimal_features = {
            "temperature_c": 25.0, "c_rate": 0.5, "soc_percent": 50.0,
            "voltage_v": 3.78, "internal_resistance_ohm": 0.07,
            "cycle_number": features.get("cycle_number", 1),
        }
        optimal_deg = float(np.clip(
            self._pipeline.predict(self._build_feature_row(optimal_features))[0], 0, None
        ))

        return {
            "degradation_rate": round(current_deg, 6),
            "degradation_at_slow_charge": round(slow_deg, 6),
            "degradation_at_optimal": round(optimal_deg, 6),
            "savings_percent": round(
                max(0.0, (current_deg - slow_deg) / max(current_deg, 1e-9) * 100.0), 1
            ),
            "data_source": "SYNTHETIC_MODEL",
            "model_note": (
                "⚠ Trained on synthetic data. "
                "Degradation predictions are approximate."
            ),
        }

    def predict_optimal_c_rate(self, features: dict, max_deg_per_cycle: float = 0.025) -> float:
        """
        Find the highest C-rate that keeps degradation below `max_deg_per_cycle`.
        Used by the Charging Optimization Agent.
        """
        if not self._is_trained:
            return 0.5  # safe default

        for c_rate in [0.2, 0.3, 0.5, 0.8, 1.0, 1.5, 2.0]:
            test_features = {**features, "c_rate": c_rate}
            deg = float(np.clip(
                self._pipeline.predict(self._build_feature_row(test_features))[0], 0, None
            ))
            if deg > max_deg_per_cycle:
                return max(0.2, c_rate - 0.1)   # step back one level
        return 2.0  # all C-rates are within budget

    @property
    def is_trained(self) -> bool:
        return self._is_trained

    # ── Private helpers ────────────────────────────────────────────

    def _build_feature_row(self, features: dict) -> np.ndarray:
        defaults = {
            "temperature_c": 25.0,
            "c_rate": 0.5,
            "soc_percent": 50.0,
            "voltage_v": 3.78,
            "internal_resistance_ohm": 0.08,
            "cycle_number": 1,
        }
        row = [features.get(f, defaults[f]) for f in FEATURES]
        return np.array(row).reshape(1, -1)

    @staticmethod
    def _fallback_prediction(features: dict) -> dict:
        """Rule-based degradation estimate."""
        temp = features.get("temperature_c", 25.0)
        c_rate = features.get("c_rate", 0.5)
        temp_factor = 1.0 + max(0.0, (temp - 30.0) / 10.0) * 0.5
        rate_factor = 1.0 + max(0.0, (c_rate - 0.5)) * 0.3
        deg = 0.02 * temp_factor * rate_factor
        return {
            "degradation_rate": round(deg, 6),
            "degradation_at_slow_charge": round(0.015, 6),
            "degradation_at_optimal": round(0.018, 6),
            "savings_percent": 0.0,
            "data_source": "RULE_BASED_FALLBACK",
            "model_note": "Model not trained yet. Using rule-based estimate.",
        }


# ── Module-level singleton ─────────────────────────────────────────
_deg_model: DegradationModel | None = None


def get_degradation_model() -> DegradationModel:
    global _deg_model
    if _deg_model is None:
        _deg_model = DegradationModel()
        _deg_model.load()
    return _deg_model
