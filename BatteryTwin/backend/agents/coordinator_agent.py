"""
agents/coordinator_agent.py
----------------------------
Coordinator Agent — final node in the LangGraph pipeline.

Responsibility:
  - Receive the fully enriched state (all four agent outputs present).
  - Resolve any conflicts between agents (e.g. charging agent says go
    fast but maintenance agent says slow down due to temperature).
  - Produce ONE final consolidated recommendation.
  - Determine the overall system priority.
  - Package everything for the Digital Twin broadcast.

Conflict resolution rules (highest precedence first):
  1. Safety (temperature / SOH critical) → always wins.
  2. Maintenance critical → overrides charging optimisation.
  3. RUL urgent → enforce slow charge.
  4. Charging agent recommendation → base strategy.
  5. Maintenance low/info → advisory only.
"""

from utils.logger import get_logger
from utils.constants import SOH_DEGRADED

logger = get_logger(__name__)

PRIORITY_RANK = {"CRITICAL": 4, "HIGH": 3, "NORMAL": 2, "LOW": 1, "INFO": 0}


def coordinator_agent_node(state: dict) -> dict:
    """
    LangGraph node – final coordinator.
    Must be the last node in the graph.
    """
    try:
        soh_out = state.get("soh_agent_output", {})
        rul_out = state.get("rul_agent_output", {})
        charging_out = state.get("charging_agent_output", {})
        maint_out = state.get("maintenance_agent_output", {})

        # ── Extract key values ────────────────────────────────────
        soh = soh_out.get("soh_percent", state.get("soh_percent", 100.0))
        rul = rul_out.get("rul_cycles", 500.0)
        rul_urgency = rul_out.get("rul_urgency", "OK")
        soh_severity = soh_out.get("soh_severity", "OK")
        charging_relay = charging_out.get("relay_action", "ON")
        charging_c_rate = charging_out.get("recommended_c_rate", 0.5)
        charging_strategy = charging_out.get("strategy", "NORMAL_CHARGE")
        maint_priority = maint_out.get("overall_priority", "INFO")
        maint_summary = maint_out.get("summary", "")
        maint_actions = maint_out.get("actions", [])

        # ── Conflict resolution ───────────────────────────────────
        final_relay, final_c_rate, override_reason = _resolve_conflicts(
            soh=soh,
            soh_severity=soh_severity,
            rul_urgency=rul_urgency,
            charging_relay=charging_relay,
            charging_c_rate=charging_c_rate,
            maint_priority=maint_priority,
            temperature=state.get("temperature_c", 25.0),
        )

        # ── Overall priority ──────────────────────────────────────
        priorities = [
            soh_severity,
            rul_urgency,
            maint_priority,
            "CRITICAL" if final_relay == "OFF" else "INFO",
        ]
        overall_priority = _highest_priority(priorities)

        # ── Build final recommendation text ───────────────────────
        recommendation = _build_recommendation(
            soh_out=soh_out,
            rul_out=rul_out,
            charging_out=charging_out,
            maint_summary=maint_summary,
            final_relay=final_relay,
            final_c_rate=final_c_rate,
            override_reason=override_reason,
            overall_priority=overall_priority,
        )

        # ── Top N actions for the dashboard ───────────────────────
        top_actions = maint_actions[:5]  # show at most 5 in dashboard

        coordinator_output = {
            # Final values written back to the twin
            "soh_percent": soh,
            "rul_cycles": rul,
            "degradation_rate": (
                charging_out.get("degradation_prediction", {}).get("degradation_rate", 0.0)
            ),
            "cycle_count": state.get("cycle_count", 0.0),

            # Relay decision
            "relay_action": final_relay,
            "relay_reason": override_reason or charging_out.get("reasoning", ""),
            "recommended_c_rate": final_c_rate,
            "charging_strategy": charging_strategy if final_relay == "ON" else "STOPPED",
            "target_soc": charging_out.get("target_soc", 80.0),

            # Recommendation
            "recommendation": recommendation,
            "priority": overall_priority,

            # Agent summaries (for dashboard detail panel)
            "soh_summary": {
                "soh_percent": soh,
                "severity": soh_severity,
                "assessment": soh_out.get("soh_assessment", ""),
            },
            "rul_summary": {
                "rul_cycles": rul,
                "urgency": rul_urgency,
                "message": rul_out.get("rul_message", ""),
            },
            "charging_summary": {
                "relay": final_relay,
                "c_rate": final_c_rate,
                "strategy": charging_strategy,
                "reasoning": charging_out.get("reasoning", ""),
            },
            "maintenance_summary": {
                "priority": maint_priority,
                "summary": maint_summary,
                "top_actions": top_actions,
                "next_service_cycles": maint_out.get("next_service_cycles", 50),
            },

            # Metadata
            "model_notes": [
                soh_out.get("model_note", ""),
                rul_out.get("model_note", ""),
                charging_out.get("model_note", ""),
            ],
        }

        logger.debug(
            f"[Coordinator] Priority={overall_priority} | "
            f"Relay={final_relay} | C-rate={final_c_rate:.2f} | "
            f"SOH={soh:.1f}% | RUL={rul:.0f}"
        )

        return {**state, "coordinator_output": coordinator_output}

    except Exception as exc:
        logger.error(f"[Coordinator] Error: {exc}", exc_info=True)
        return {
            **state,
            "coordinator_output": {
                "soh_percent": state.get("soh_percent", 100.0),
                "rul_cycles": state.get("rul_cycles", 500.0),
                "degradation_rate": 0.0,
                "relay_action": "ON",
                "relay_reason": "Coordinator error – safe defaults applied.",
                "recommended_c_rate": 0.5,
                "charging_strategy": "NORMAL_CHARGE",
                "recommendation": "AI coordinator unavailable. Operating on safe defaults.",
                "priority": "NORMAL",
                "error": str(exc),
            },
        }


# ── Conflict resolution ────────────────────────────────────────────

def _resolve_conflicts(
    soh: float,
    soh_severity: str,
    rul_urgency: str,
    charging_relay: str,
    charging_c_rate: float,
    maint_priority: str,
    temperature: float,
) -> tuple[str, float, str]:
    """
    Returns (relay_action, c_rate, override_reason).
    override_reason is empty string if no override occurred.
    """
    from utils.constants import TEMP_HOT, TEMP_COLD, SOH_CRITICAL

    # Rule 1: Temperature safety
    if temperature >= TEMP_HOT:
        return "OFF", 0.0, f"SAFETY OVERRIDE: Temperature {temperature:.1f}°C exceeds limit."

    # Rule 2: SOH critical
    if soh <= SOH_CRITICAL:
        return "OFF", 0.0, f"SAFETY OVERRIDE: Battery SOH {soh:.1f}% is critically low."

    # Rule 3: Charging agent said stop
    if charging_relay == "OFF":
        return "OFF", 0.0, ""  # charging agent already set the reason

    # Rule 4: RUL urgent – force slow charge
    if rul_urgency in ("URGENT", "CRITICAL"):
        capped = min(charging_c_rate, 0.2)
        return "ON", capped, f"RUL override: {rul_urgency} – charge rate capped at 0.2C."

    # Rule 5: Maintenance critical
    if maint_priority == "CRITICAL":
        capped = min(charging_c_rate, 0.3)
        return "ON", capped, "Maintenance override: critical issue – charge rate reduced."

    # No override
    return charging_relay, charging_c_rate, ""


def _highest_priority(priorities: list[str]) -> str:
    """Return the highest severity string from a list."""
    return max(priorities, key=lambda p: PRIORITY_RANK.get(p, 0))


# ── Recommendation text builder ────────────────────────────────────

def _build_recommendation(
    soh_out: dict,
    rul_out: dict,
    charging_out: dict,
    maint_summary: str,
    final_relay: str,
    final_c_rate: float,
    override_reason: str,
    overall_priority: str,
) -> str:
    soh = soh_out.get("soh_percent", 100.0)
    rul = rul_out.get("rul_cycles", 500.0)
    rul_days = rul_out.get("rul_days_estimate", 500.0)

    lines = []

    if overall_priority == "CRITICAL":
        lines.append("🚨 CRITICAL ALERT")
    elif overall_priority == "HIGH":
        lines.append("⚡ HIGH PRIORITY")
    elif overall_priority == "NORMAL":
        lines.append("ℹ️ RECOMMENDATION")
    else:
        lines.append("✅ STATUS OK")

    # Charging decision
    if final_relay == "OFF":
        lines.append(f"Charging: PAUSED — {override_reason or charging_out.get('reasoning', '')}")
    else:
        lines.append(
            f"Charging: ACTIVE at {final_c_rate:.1f}C "
            f"({charging_out.get('strategy', 'NORMAL').replace('_', ' ').title()})"
        )
        if override_reason:
            lines.append(f"  Note: {override_reason}")

    # Health snapshot
    lines.append(
        f"Battery Health: SOH {soh:.1f}%  |  "
        f"RUL {int(rul)} cycles (~{int(rul_days)} days)"
    )

    # Maintenance summary
    if maint_summary:
        lines.append(f"Maintenance: {maint_summary}")

    return "\n".join(lines)
