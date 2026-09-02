"""
ml/trainer.py
-------------
Training pipeline – generates synthetic data and trains all three ML models.

⚠️  DATA NOTICE
This script trains models on SYNTHETIC data. The models are suitable for
demonstration purposes. Replace the CSV files in ml/data/ with real battery
logs for production-quality predictions.

Usage:
    python -m ml.trainer              # train all models
    python -m ml.trainer --model soh  # train only the SOH model
    python -m ml.trainer --model rul
    python -m ml.trainer --model deg

After training, model files are saved to ml/saved_models/*.pkl
"""

import argparse
import time
from pathlib import Path

import pandas as pd

from ml.data.synthetic_data import save_datasets, generate_cycle_dataset, generate_timeseries_dataset
from ml.soh_model import SOHModel
from ml.rul_model import RULModel
from ml.degradation_model import DegradationModel
from utils.logger import get_logger

logger = get_logger(__name__)

# Ensure saved_models dir exists
SAVED_MODELS_DIR = Path("ml/saved_models")
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)

DATA_DIR = Path("ml/data")


def _load_or_generate_cycle_data() -> pd.DataFrame:
    """Load the cycle CSV or regenerate it if missing."""
    csv_path = DATA_DIR / "synthetic_battery_cycles.csv"
    if csv_path.exists():
        logger.info(f"Loading existing cycle dataset from {csv_path}")
        return pd.read_csv(csv_path)
    logger.info("Cycle dataset not found – generating...")
    save_datasets(DATA_DIR)
    return pd.read_csv(csv_path)


def _load_or_generate_ts_data() -> pd.DataFrame:
    """Load the timeseries CSV or regenerate it if missing."""
    csv_path = DATA_DIR / "synthetic_timeseries.csv"
    if csv_path.exists():
        logger.info(f"Loading existing timeseries dataset from {csv_path}")
        return pd.read_csv(csv_path)
    logger.info("Timeseries dataset not found – generating...")
    save_datasets(DATA_DIR)
    return pd.read_csv(csv_path)


def train_soh(df: pd.DataFrame | None = None) -> dict:
    """Train and save the SOH model."""
    logger.info("=" * 50)
    logger.info("Training SOH (State of Health) model...")
    t0 = time.time()

    if df is None:
        df = _load_or_generate_cycle_data()

    model = SOHModel()
    metrics = model.train(df)
    model.save()

    metrics["training_time_s"] = round(time.time() - t0, 2)
    logger.info(f"SOH training complete in {metrics['training_time_s']}s | {metrics}")
    return metrics


def train_rul(df: pd.DataFrame | None = None) -> dict:
    """Train and save the RUL model."""
    logger.info("=" * 50)
    logger.info("Training RUL (Remaining Useful Life) model...")
    t0 = time.time()

    if df is None:
        df = _load_or_generate_cycle_data()

    model = RULModel()
    metrics = model.train(df)
    model.save()

    metrics["training_time_s"] = round(time.time() - t0, 2)
    logger.info(f"RUL training complete in {metrics['training_time_s']}s | {metrics}")
    return metrics


def train_degradation(df: pd.DataFrame | None = None) -> dict:
    """Train and save the degradation model."""
    logger.info("=" * 50)
    logger.info("Training Degradation model...")
    t0 = time.time()

    if df is None:
        df = _load_or_generate_ts_data()

    # The timeseries dataset has the required columns
    # Map column names if needed
    if "c_rate" not in df.columns and "current_a" in df.columns:
        df = df.copy()
        df["c_rate"] = (df["current_a"] * 1000.0) / 3000.0
    if "cycle_number" not in df.columns:
        df = df.copy()
        df["cycle_number"] = df.groupby("battery_id").cumcount() + 1

    model = DegradationModel()
    metrics = model.train(df)
    model.save()

    metrics["training_time_s"] = round(time.time() - t0, 2)
    logger.info(f"Degradation training complete in {metrics['training_time_s']}s | {metrics}")
    return metrics


def train_all() -> dict:
    """Generate data (if needed) and train all three models."""
    logger.info("╔══════════════════════════════════════════════╗")
    logger.info("║   BatteryTwin ML Training Pipeline           ║")
    logger.info("║   ⚠ Training on SYNTHETIC data               ║")
    logger.info("╚══════════════════════════════════════════════╝")

    t_start = time.time()

    # Generate datasets once and share DataFrames
    cycle_df = _load_or_generate_cycle_data()
    ts_df = _load_or_generate_ts_data()

    results = {
        "soh": train_soh(cycle_df),
        "rul": train_rul(cycle_df),
        "degradation": train_degradation(ts_df),
        "total_time_s": 0.0,
    }
    results["total_time_s"] = round(time.time() - t_start, 2)

    logger.info("═" * 50)
    logger.info(f"All models trained in {results['total_time_s']}s")
    logger.info(f"  SOH  → MAE: {results['soh']['mae']:.4f}%  R²: {results['soh']['r2']:.4f}")
    logger.info(f"  RUL  → MAE: {results['rul']['mae_cycles']:.1f} cycles  R²: {results['rul']['r2']:.4f}")
    logger.info(f"  Deg  → MAE: {results['degradation']['mae']:.6f}  R²: {results['degradation']['r2']:.4f}")
    logger.info("Models saved to ml/saved_models/")
    logger.info("═" * 50)

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train BatteryTwin ML models")
    parser.add_argument(
        "--model",
        choices=["soh", "rul", "deg", "all"],
        default="all",
        help="Which model to train (default: all)",
    )
    args = parser.parse_args()

    if args.model == "soh":
        train_soh()
    elif args.model == "rul":
        train_rul()
    elif args.model == "deg":
        train_degradation()
    else:
        train_all()
