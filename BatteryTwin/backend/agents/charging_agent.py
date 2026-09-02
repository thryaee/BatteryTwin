"""
agents/charging_agent.py
-------------------------
Charging Optimization Agent.

Responsibility:
  - Analyse current battery state (SOC, temperature, SOH, RUL).
  - Call the degradation model to find the optimal charging C-rate.
  - Recommend a charging strategy that balances speed vs. longevity.
  - Issue relay control recommendation (charge / pause / stop).

Charging strategy matrix:
  SOC < 20%   → Fast charge allowed if temp is OK and SOH > 70%
  SOC 20–80%  → Normal CC-CV charging at optimised C-rate
  SOC 80–95%  → Slow CV taper to reduce stress
  SOC > 95%   → Stop charging (trickle only) – avoids top-stress
  Temp > 40°C → Pause charging until temperature drops
  Temp < 5°C  → Reduce C-rate (lithium plating risk)
  SOH < 60%   → Always use slow charge (0.2C max)
"""

from ml.degradation_model import get_degradation_model
from utils.logger import get_logger
from utils.constants import (
    C_RATE_SLOW, C_RATE_NORMAL, C_RATE_FAST, C_RATE_RAPID,
    TEMP_COLD, TEMP_OPTIMAL_HIGH, TEMP_HOT,
    SOC_OPTIMAL_HIGH, SOC_HIGH,
    SOH_DEGRADED,
)

logger = get_logger(__name__)

# Relay actions
RELAY_ON = "ON"     # allow charging
RELAY_OFF = "OFF"   # cut charging


def charging_agent_node(state: dict) -> dict:
    """
    LangGraph node function for charging optimisation.
    Expects 'soh_agent_output' and 'rul_agent_output' in state.
    """
    try:
        deg_model = get_degradation_model()

        soh_output = state.get("soh_agent_output", {})
        soh = soh_output.get("soh_percent", state.get("soh_percent", 100.0))

        soc = state.get("soc_percent", 50.0)
        temperature = state.get("temperature_c", 25.0)
        current_a = state.get("current_a", 0.0)
        voltage = state.get("voltage_v", 3.7)
        cycle_count = state.get("cycle_count", 1)

        # ── Safety check: should we even be charging? ─────────────
        relay_action, safety_reason = _safety_gate(soc, temperature, soh)

        if relay_action == RELAY_OFF:
            # No point optimising – just report the stop reason
            output = _build_output(
                relay_action=RELAY_OFF,
                recommended_c_rate=0.0,
                target_soc=soc,
                strategy="STOP",
                reasoning=safety_reason,
                degradation_result={"degradation_rate": 0.0},
                deg_model_note="N/A – charging stopped",
            )
            return {**state, "charging_agent_output": output}

        # ── Find optimal C-rate via degradation model ─────────────
        deg_features = {
            "temperature_c": temperature,
            "c_rate": abs(current_a) / max(soh / 100.0 * 3.0, 0.1),
            "soc_percent": soc,
            "voltage_v": voltage,
            "internal_resistance_ohm": soh_output.get("features_used", {}).get(
                "internal_resistance_ohm", 0.08
            ),
            "cycle_number": cycle_count,
        }

        # Max degradation budget: tighter for degraded batteries
        max_deg = 0.025 if soh >= SOH_DEGRADED else 0.015

        optimal_c_rate = deg_model.predict_optimal_c_rate(deg_features, max_deg)
        deg_result = deg_model.predict(deg_features)

        # ── Apply SOC-based limits ────────────────────────────────
        optimal_c_rate = _apply_soc_limits(optimal_c_rate, soc)

        # ── Apply temperature limits ──────────────────────────────
        optimal_c_rate = _apply_temp_limits(optimal_c_rate, temperature)

        # ── Apply SOH-based hard cap ──────────────────────────────
        if soh < SOH_DEGRADED:
            optimal_c_rate = min(optimal_c_rate, C_RATE_SLOW)

        # ── Build strategy label ──────────────────────────────────
        target_soc = _compute_target_soc(soh)
        strategy, reasoning = _build_strategy_text(
            optimal_c_rate, soc, temperature, soh, target_soc, deg_result
        )

        output = _build_output(
            relay_action=RELAY_ON,
            recommended_c_rate=round(optimal_c_rate, 2),
            target_soc=target_soc,
            strategy=strategy,
            reasoning=reasoning,
            degradation_result=deg_result,
            deg_model_note=deg_result.get("model_note", ""),
        )

        logger.debug(
            f"[Charging Agent] C-rate={optimal_c_rate:.2f} | "
            f"Strategy={strategy} | Relay={relay_action}"
        )
        return {**state, "charging_agent_output": output}

    except Exception as exc:
        logger.error(f"[Charging Agent] Error: {exc}", exc_info=True)
        return {
            **state,
            "charging_agent_output": {
                "relay_action": RELAY_ON,
                "recommended_c_rate": C_RATE_NORMAL,
                "target_soc": 80.0,
                "strategy": "NORMAL",
                "reasoning": "Charging agent unavailable – using safe defaults.",
                "error": str(exc),
            },
        }


# ── Helper functions ───────────────────────────────────────────────

def _safety_gate(soc: float, temperature: float, soh: float) -> tuple[str, str]:
    """Hard safety checks that override all other logic."""
    if temperature >= TEMP_HOT:
        return RELAY_OFF, (
            f"Temperature {temperature:.1f}°C exceeds safe limit ({TEMP_HOT}°C). "
            "Charging paused until temperature drops."
        )
    if soc >= 99.5:
        return RELAY_OFF, "Battery fully charged (SOC ≥ 99.5%). Charging stopped."
    if soh < 20.0:
        return RELAY_OFF, (
            f"Battery SOH critically low ({soh:.1f}%). "
            "Charging disabled – replace battery immediately."
        )
    return RELAY_ON, "Safety checks passed."


def _apply_soc_limits(c_rate: float, soc: float) -> float:
    """Reduce C-rate as battery approaches full charge."""
    if soc >= SOC_HIGH:       # > 90%
        return min(c_rate, C_RATE_SLOW)
    elif soc >= SOC_OPTIMAL_HIGH:  # > 80%
        return min(c_rate, C_RATE_NORMAL * 0.6)
    return c_rate


def _apply_temp_limits(c_rate: float, temperature: float) -> float:
    """Cold or warm temperatures require rate reduction."""
    if temperature <= TEMP_COLD:
        return min(c_rate, C_RATE_SLOW)
    elif temperature >= TEMP_OPTIMAL_HIGH:
        return min(c_rate, C_RATE_NORMAL)
    return c_rate


def _compute_target_soc(soh: float) -> float:
    """
    Optimal charge target – healthy batteries can go to 80%,
    degraded batteries benefit from stopping at 70%.
    """
    if soh >= 80.0:
        return 80.0
    elif soh >= 60.0:
        return 75.0
    else:
        return 70.0


def _build_strategy_text(
    c_rate: float,
    soc: float,
    temperature: float,
    soh: float,
    target_soc: float,
    deg_result: dict,
) -> tuple[str, str]:
    if c_rate <= C_RATE_SLOW:
        label = "SLOW_CHARGE"
    elif c_rate <= C_RATE_NORMAL:
        label = "NORMAL_CHARGE"
    elif c_rate <= C_RATE_FAST:
        label = "FAST_CHARGE"
    else:
        label = "RAPID_CHARGE"

    savings = deg_result.get("savings_percent", 0.0)
    deg_current = deg_result.get("degradation_rate", 0.0)

    reasoning = (
        f"Recommended charging at {c_rate:.1f}C ({label.replace('_', ' ').title()}). "
        f"Target SOC: {target_soc:.0f}%. "
        f"Current degradation rate: {deg_current:.4f}%/cycle. "
    )
    if savings > 5:
        reasoning += (
            f"Slowing charge rate saves {savings:.1f}% degradation per cycle. "
        )
    if temperature > 35.0:
        reasoning += f"Charging rate reduced due to elevated temperature ({temperature:.1f}°C). "
    if soh < 70.0:
        reasoning += f"Slow charging enforced due to degraded SOH ({soh:.1f}%). "

    return label, reasoning


def _build_output(
    relay_action: str,
    recommended_c_rate: float,
    target_soc: float,
    strategy: str,
    reasoning: str,
    degradation_result: dict,
    deg_model_note: str,
) -> dict:
    return {
        "relay_action": relay_action,
        "recommended_c_rate": recommended_c_rate,
        "target_soc": target_soc,
        "strategy": strategy,
        "reasoning": reasoning,
        "degradation_prediction": degradation_result,
        "model_note": deg_model_note,
    }
