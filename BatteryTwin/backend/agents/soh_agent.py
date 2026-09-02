"""
agents/soh_agent.py
--------------------
Battery State of Health (SOH) Agent.

Responsibility:
  - Receive the current twin state dict from the LangGraph pipeline.
  - Call the SOH ML model to estimate SOH%.
  - Enrich the state with SOH results + a human-readable assessment.
  - Return the updated state (LangGraph node pattern).

The agent is deliberately STATELESS – it reads from and writes to the
shared graph state dict. This makes it easy to swap the rule/ML logic
for an LLM call later without changing any other file.
"""

from ml.soh_model import get_soh_model
from utils.logger import get_logger
from utils.constants import SOH_HEALTHY, SOH_DEGRADED, SOH_CRITICAL

logger = get_logger(__name__)


def soh_agent_node(state: dict) -> dict:
    """
    LangGraph node function for SOH estimation.

    Parameters
    ----------
    state : dict
        Shared LangGraph state – contains current twin readings.

    Returns
    -------
    dict
        Updated state with 'soh_agent_output' key added.
    """
    try:
        model = get_soh_model()

        # Build feature dict from current twin readings
        features = {
            "cycle_number": state.get("cycle_count", 1),
            "voltage_v": state.get("voltage_v", 3.7),
            "current_a": abs(state.get("current_a", 1.0)),
            "temperature_c": state.get("temperature_c", 25.0),
            "internal_resistance_ohm": _estimate_r_internal(state),
            "c_rate": _estimate_c_rate(state),
            "capacity_mah": _estimate_capacity(state),
        }

        result = model.predict(features)
        soh = result["soh_percent"]

        # Generate assessment text
        assessment, severity = _assess_soh(soh)

        output = {
            "soh_percent": soh,
            "soh_assessment": assessment,
            "soh_severity": severity,         # OK / WARNING / CRITICAL
            "confidence": result["confidence"],
            "data_source": result["data_source"],
            "model_note": result["model_note"],
            "features_used": features,
        }

        logger.debug(f"[SOH Agent] SOH={soh:.1f}% | {assessment}")
        return {**state, "soh_agent_output": output}

    except Exception as exc:
        logger.error(f"[SOH Agent] Error: {exc}", exc_info=True)
        return {
            **state,
            "soh_agent_output": {
                "soh_percent": state.get("soh_percent", 100.0),
                "soh_assessment": "SOH estimation unavailable.",
                "soh_severity": "UNKNOWN",
                "error": str(exc),
            },
        }


# ── Assessment helpers ─────────────────────────────────────────────

def _assess_soh(soh: float) -> tuple[str, str]:
    """Return a human-readable assessment and severity level."""
    if soh >= SOH_HEALTHY:
        return (
            f"Battery health is good ({soh:.1f}%). "
            "Normal operation recommended.",
            "OK",
        )
    elif soh >= SOH_DEGRADED:
        return (
            f"Battery health is degraded ({soh:.1f}%). "
            "Consider reducing charge rate and avoiding deep discharge.",
            "WARNING",
        )
    elif soh >= SOH_CRITICAL:
        return (
            f"Battery health is poor ({soh:.1f}%). "
            "Frequent monitoring required. Plan replacement within 3 months.",
            "CRITICAL",
        )
    else:
        return (
            f"Battery health is critical ({soh:.1f}%). "
            "Immediate replacement strongly recommended.",
            "CRITICAL",
        )


def _estimate_r_internal(state: dict) -> float:
    """
    Approximate internal resistance from voltage sag under load.
    Falls back to a default if current is near zero.
    """
    # Use the coordinator's stored value if available
    if "internal_resistance_ohm" in state:
        return float(state["internal_resistance_ohm"])
    current = abs(state.get("current_a", 0.0))
    if current > 0.1:
        # R ≈ ΔV / I — approximate using OCV difference
        ocv = _ocv_approx(state.get("soc_percent", 50.0))
        terminal_v = state.get("voltage_v", ocv)
        r = abs(ocv - terminal_v) / current
        return min(max(r, 0.03), 0.5)   # clamp to realistic range
    return 0.08  # default


def _estimate_c_rate(state: dict) -> float:
    """Estimate C-rate from current and assumed 3Ah capacity."""
    current = abs(state.get("current_a", 1.0))
    capacity_ah = state.get("capacity_mah", 3000.0) / 1000.0
    return current / max(capacity_ah, 0.1)


def _estimate_capacity(state: dict) -> float:
    """Return capacity estimate in mAh."""
    # Capacity degrades linearly with SOH
    soh = state.get("soh_percent", 100.0)
    return 3000.0 * soh / 100.0


def _ocv_approx(soc: float) -> float:
    """Quick linear OCV approximation."""
    return 2.8 + (4.2 - 2.8) * soc / 100.0
