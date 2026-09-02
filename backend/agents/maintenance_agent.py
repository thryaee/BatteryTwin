"""
agents/maintenance_agent.py
----------------------------
Maintenance & Recommendation Agent.

Responsibility:
  - Aggregate outputs from SOH, RUL, and Charging agents.
  - Generate a prioritised list of maintenance actions.
  - Flag any anomalies (sudden voltage drop, thermal runaway risk, etc.).
  - Produce a final maintenance schedule recommendation.

This agent is purely rule-based – no ML model required.
Rules are explicit and auditable, which is good for a project demo.
"""

from utils.logger import get_logger
from utils.constants import (
    SOH_HEALTHY, SOH_DEGRADED, SOH_CRITICAL,
    RUL_HEALTHY_CYCLES, RUL_WARNING_CYCLES, RUL_CRITICAL_CYCLES,
    TEMP_OPTIMAL_HIGH, TEMP_HOT, TEMP_COLD,
    SOC_CRITICAL_LOW,
)

logger = get_logger(__name__)

# Priority levels (for sorting / display)
P_INFO = "INFO"
P_LOW = "LOW"
P_NORMAL = "NORMAL"
P_HIGH = "HIGH"
P_CRITICAL = "CRITICAL"


def maintenance_agent_node(state: dict) -> dict:
    """
    LangGraph node function for maintenance recommendations.
    Reads soh_agent_output, rul_agent_output, charging_agent_output from state.
    """
    try:
        soh_out = state.get("soh_agent_output", {})
        rul_out = state.get("rul_agent_output", {})
        charging_out = state.get("charging_agent_output", {})

        soh = soh_out.get("soh_percent", state.get("soh_percent", 100.0))
        rul = rul_out.get("rul_cycles", 500.0)
        temperature = state.get("temperature_c", 25.0)
        soc = state.get("soc_percent", 50.0)
        voltage = state.get("voltage_v", 3.7)
        cycle_count = state.get("cycle_count", 0)

        # ── Collect all applicable recommendations ────────────────
        actions: list[dict] = []

        actions.extend(_check_soh(soh))
        actions.extend(_check_rul(rul))
        actions.extend(_check_temperature(temperature))
        actions.extend(_check_soc(soc))
        actions.extend(_check_voltage(voltage, soc))
        actions.extend(_check_cycle_milestones(cycle_count))
        actions.extend(_check_charging_strategy(charging_out))

        # ── Sort by priority (CRITICAL first) ────────────────────
        priority_order = {P_CRITICAL: 0, P_HIGH: 1, P_NORMAL: 2, P_LOW: 3, P_INFO: 4}
        actions.sort(key=lambda a: priority_order.get(a["priority"], 5))

        # ── Derive overall system priority ────────────────────────
        overall_priority = actions[0]["priority"] if actions else P_INFO

        # ── Summary message ───────────────────────────────────────
        summary = _build_summary(actions, soh, rul, temperature)

        output = {
            "actions": actions,
            "action_count": len(actions),
            "overall_priority": overall_priority,
            "summary": summary,
            "next_service_cycles": _estimate_next_service(soh, rul, cycle_count),
        }

        logger.debug(
            f"[Maintenance Agent] {len(actions)} actions | "
            f"Priority: {overall_priority}"
        )
        return {**state, "maintenance_agent_output": output}

    except Exception as exc:
        logger.error(f"[Maintenance Agent] Error: {exc}", exc_info=True)
        return {
            **state,
            "maintenance_agent_output": {
                "actions": [],
                "action_count": 0,
                "overall_priority": P_INFO,
                "summary": "Maintenance analysis unavailable.",
                "error": str(exc),
            },
        }


# ── Rule checkers ─────────────────────────────────────────────────

def _check_soh(soh: float) -> list[dict]:
    actions = []
    if soh < SOH_CRITICAL:
        actions.append({
            "code": "SOH_CRITICAL",
            "priority": P_CRITICAL,
            "category": "Battery Health",
            "action": "Replace battery immediately",
            "detail": f"SOH {soh:.1f}% is below critical threshold ({SOH_CRITICAL}%). "
                      "Risk of sudden failure.",
        })
    elif soh < SOH_DEGRADED:
        actions.append({
            "code": "SOH_DEGRADED",
            "priority": P_HIGH,
            "category": "Battery Health",
            "action": "Plan battery replacement within 30 days",
            "detail": f"SOH {soh:.1f}% indicates significant degradation. "
                      "Reduce charge rate to extend remaining life.",
        })
    elif soh < SOH_HEALTHY:
        actions.append({
            "code": "SOH_LOW",
            "priority": P_NORMAL,
            "category": "Battery Health",
            "action": "Monitor battery health closely",
            "detail": f"SOH {soh:.1f}% is below healthy threshold ({SOH_HEALTHY}%). "
                      "Use conservative charging settings.",
        })
    else:
        actions.append({
            "code": "SOH_OK",
            "priority": P_INFO,
            "category": "Battery Health",
            "action": "No action required",
            "detail": f"SOH {soh:.1f}% – battery health is good.",
        })
    return actions


def _check_rul(rul: float) -> list[dict]:
    actions = []
    if rul <= RUL_CRITICAL_CYCLES:
        actions.append({
            "code": "RUL_CRITICAL",
            "priority": P_CRITICAL,
            "category": "Remaining Life",
            "action": f"Order replacement battery NOW ({int(rul)} cycles remaining)",
            "detail": "Battery is approaching end-of-life. Unexpected failure is possible.",
        })
    elif rul <= RUL_WARNING_CYCLES:
        actions.append({
            "code": "RUL_WARNING",
            "priority": P_HIGH,
            "category": "Remaining Life",
            "action": f"Schedule battery replacement ({int(rul)} cycles remaining)",
            "detail": "Start procurement process for a replacement battery.",
        })
    elif rul <= RUL_HEALTHY_CYCLES:
        actions.append({
            "code": "RUL_MONITOR",
            "priority": P_LOW,
            "category": "Remaining Life",
            "action": f"Monitor RUL trend ({int(rul)} cycles remaining)",
            "detail": "Battery still has reasonable life. Check again in 50 cycles.",
        })
    return actions


def _check_temperature(temperature: float) -> list[dict]:
    actions = []
    if temperature >= TEMP_HOT:
        actions.append({
            "code": "TEMP_HOT",
            "priority": P_CRITICAL,
            "category": "Thermal",
            "action": "Stop charging – thermal safety risk",
            "detail": f"Cell temperature {temperature:.1f}°C exceeds {TEMP_HOT}°C limit. "
                      "Charging suspended. Improve ventilation.",
        })
    elif temperature >= TEMP_OPTIMAL_HIGH:
        actions.append({
            "code": "TEMP_ELEVATED",
            "priority": P_HIGH,
            "category": "Thermal",
            "action": "Reduce charge rate – elevated temperature",
            "detail": f"Temperature {temperature:.1f}°C is above optimal range. "
                      "Reduce C-rate to 0.3C or below.",
        })
    elif temperature <= TEMP_COLD:
        actions.append({
            "code": "TEMP_COLD",
            "priority": P_HIGH,
            "category": "Thermal",
            "action": "Reduce charge rate – cold temperature (lithium plating risk)",
            "detail": f"Temperature {temperature:.1f}°C is below {TEMP_COLD}°C. "
                      "Charge at 0.1–0.2C max until warm.",
        })
    return actions


def _check_soc(soc: float) -> list[dict]:
    actions = []
    if soc <= SOC_CRITICAL_LOW:
        actions.append({
            "code": "SOC_CRITICAL",
            "priority": P_HIGH,
            "category": "State of Charge",
            "action": "Charge immediately – critically low SOC",
            "detail": f"SOC {soc:.1f}% is dangerously low. "
                      "Deep discharge causes permanent capacity loss.",
        })
    return actions


def _check_voltage(voltage: float, soc: float) -> list[dict]:
    actions = []
    # Detect voltage-SOC mismatch (possible cell imbalance or sensor fault)
    expected_low = 2.8 + soc / 100.0 * 1.2
    expected_high = 3.1 + soc / 100.0 * 1.1
    if voltage < expected_low - 0.3:
        actions.append({
            "code": "VOLTAGE_LOW_ANOMALY",
            "priority": P_HIGH,
            "category": "Electrical",
            "action": "Investigate voltage anomaly",
            "detail": f"Voltage {voltage:.3f}V is lower than expected for SOC {soc:.1f}%. "
                      "Possible cell degradation or sensor fault.",
        })
    return actions


def _check_cycle_milestones(cycle_count: float) -> list[dict]:
    """Recommend a calibration cycle at regular intervals."""
    actions = []
    if cycle_count > 0 and int(cycle_count) % 50 == 0:
        actions.append({
            "code": "CALIBRATION_DUE",
            "priority": P_LOW,
            "category": "Calibration",
            "action": f"Perform full charge-discharge calibration (cycle #{int(cycle_count)})",
            "detail": "A full cycle (charge to 100%, discharge to 15%) helps recalibrate "
                      "SOC estimation accuracy.",
        })
    return actions


def _check_charging_strategy(charging_out: dict) -> list[dict]:
    actions = []
    strategy = charging_out.get("strategy", "")
    if strategy == "STOP":
        reason = charging_out.get("reasoning", "")
        actions.append({
            "code": "CHARGING_STOPPED",
            "priority": P_HIGH,
            "category": "Charging",
            "action": "Charging has been paused by safety system",
            "detail": reason,
        })
    return actions


def _build_summary(actions: list[dict], soh: float, rul: float, temp: float) -> str:
    critical_count = sum(1 for a in actions if a["priority"] == P_CRITICAL)
    high_count = sum(1 for a in actions if a["priority"] == P_HIGH)

    if critical_count > 0:
        return (
            f"⚠️ CRITICAL: {critical_count} critical issue(s) require immediate attention. "
            f"SOH={soh:.1f}% RUL={int(rul)} cycles Temp={temp:.1f}°C"
        )
    elif high_count > 0:
        return (
            f"⚡ HIGH PRIORITY: {high_count} issue(s) need attention soon. "
            f"SOH={soh:.1f}% RUL={int(rul)} cycles Temp={temp:.1f}°C"
        )
    else:
        return (
            f"✅ Battery operating normally. "
            f"SOH={soh:.1f}% RUL={int(rul)} cycles Temp={temp:.1f}°C"
        )


def _estimate_next_service(soh: float, rul: float, cycle_count: float) -> int:
    """Return cycles until next recommended service check."""
    if soh < SOH_CRITICAL or rul < RUL_CRITICAL_CYCLES:
        return 0     # immediate
    elif soh < SOH_DEGRADED or rul < RUL_WARNING_CYCLES:
        return 10
    elif soh < SOH_HEALTHY or rul < RUL_HEALTHY_CYCLES:
        return 25
    else:
        return 50
