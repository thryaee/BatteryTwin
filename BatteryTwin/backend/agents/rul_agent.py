"""
agents/rul_agent.py
--------------------
Remaining Useful Life (RUL) Prediction Agent.

Responsibility:
  - Use SOH output from the SOH Agent (already in state).
  - Call the RUL ML model to predict remaining charge cycles.
  - Convert cycles to a human-friendly time estimate.
  - Add urgency classification.
"""

from ml.rul_model import get_rul_model
from utils.logger import get_logger
from utils.constants import RUL_HEALTHY_CYCLES, RUL_WARNING_CYCLES, RUL_CRITICAL_CYCLES

logger = get_logger(__name__)


def rul_agent_node(state: dict) -> dict:
    """
    LangGraph node function for RUL prediction.
    Expects 'soh_agent_output' to already be present in state.
    """
    try:
        model = get_rul_model()

        # Pull SOH from the previous agent's output
        soh_output = state.get("soh_agent_output", {})
        soh = soh_output.get("soh_percent", state.get("soh_percent", 100.0))

        features = {
            "cycle_number": state.get("cycle_count", 1),
            "soh_percent": soh,
            "voltage_v": state.get("voltage_v", 3.7),
            "temperature_c": state.get("temperature_c", 25.0),
            "internal_resistance_ohm": soh_output.get("features_used", {}).get(
                "internal_resistance_ohm", 0.08
            ),
            "degradation_rate": _estimate_degradation_rate(state),
            "c_rate": soh_output.get("features_used", {}).get("c_rate", 0.5),
        }

        result = model.predict(features)
        rul_cycles = result["rul_cycles"]
        rul_days = result["rul_days_estimate"]

        urgency, message = _classify_rul(rul_cycles)

        output = {
            "rul_cycles": rul_cycles,
            "rul_days_estimate": rul_days,
            "rul_urgency": urgency,           # OK / WARNING / URGENT / CRITICAL
            "rul_message": message,
            "confidence": result["confidence"],
            "data_source": result["data_source"],
            "model_note": result["model_note"],
        }

        logger.debug(
            f"[RUL Agent] RUL={rul_cycles:.0f} cycles "
            f"(~{rul_days:.0f} days) | {urgency}"
        )
        return {**state, "rul_agent_output": output}

    except Exception as exc:
        logger.error(f"[RUL Agent] Error: {exc}", exc_info=True)
        return {
            **state,
            "rul_agent_output": {
                "rul_cycles": 0,
                "rul_days_estimate": 0,
                "rul_urgency": "UNKNOWN",
                "rul_message": "RUL prediction unavailable.",
                "error": str(exc),
            },
        }


# ── Classification helpers ────────────────────────────────────────

def _classify_rul(rul_cycles: float) -> tuple[str, str]:
    if rul_cycles >= RUL_HEALTHY_CYCLES:
        return (
            "OK",
            f"Battery has approximately {int(rul_cycles)} cycles remaining. "
            "No immediate action needed.",
        )
    elif rul_cycles >= RUL_WARNING_CYCLES:
        return (
            "WARNING",
            f"Battery has approximately {int(rul_cycles)} cycles remaining (~{int(rul_cycles)} days). "
            "Start planning for battery replacement.",
        )
    elif rul_cycles >= RUL_CRITICAL_CYCLES:
        return (
            "URGENT",
            f"Battery has only {int(rul_cycles)} cycles remaining. "
            "Order replacement battery now.",
        )
    else:
        return (
            "CRITICAL",
            f"Battery is near end-of-life ({int(rul_cycles)} cycles remaining). "
            "Replace immediately to avoid unexpected failure.",
        )


def _estimate_degradation_rate(state: dict) -> float:
    """
    Estimate per-cycle degradation rate.
    If the coordinator has stored this from a previous cycle, use it;
    otherwise fall back to a conservative default.
    """
    stored = state.get("degradation_rate")
    if stored and isinstance(stored, (int, float)) and stored > 0:
        return float(stored)
    # Default: 0.02% SOH per cycle (moderate usage)
    return 0.02
