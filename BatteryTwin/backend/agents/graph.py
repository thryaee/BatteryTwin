"""
agents/graph.py
---------------
LangGraph multi-agent pipeline definition.

Graph topology (sequential, deterministic):

    START
      │
      ▼
  soh_agent        ← estimates State of Health
      │
      ▼
  rul_agent        ← predicts Remaining Useful Life (reads SOH output)
      │
      ▼
  charging_agent   ← optimises charging strategy (reads SOH + RUL)
      │
      ▼
  maintenance_agent ← generates maintenance actions (reads all above)
      │
      ▼
  coordinator_agent ← resolves conflicts, produces final recommendation
      │
      ▼
    END

Why sequential (not parallel)?
  - Each agent enriches the shared state for the next.
  - RUL accuracy improves with SOH. Charging optimisation uses both.
  - LangGraph supports conditional branching; we keep it sequential
    for determinism and debuggability. Parallelism can be added later.

Swap in an LLM:
  - Replace any node function body with a call to an LLM chain.
  - The state schema and graph topology stay unchanged.
"""

from typing import TypedDict, Optional, Any
from langgraph.graph import StateGraph, START, END

from agents.soh_agent import soh_agent_node
from agents.rul_agent import rul_agent_node
from agents.charging_agent import charging_agent_node
from agents.maintenance_agent import maintenance_agent_node
from agents.coordinator_agent import coordinator_agent_node
from utils.logger import get_logger

logger = get_logger(__name__)


# ── Shared state schema ────────────────────────────────────────────

class BatteryAgentState(TypedDict, total=False):
    """
    Shared state passed through the LangGraph pipeline.
    `total=False` means all keys are optional (the graph merges dicts).
    """
    # ── Input: current twin readings ──────────────────────────────
    battery_id: str
    voltage_v: float
    current_a: float
    temperature_c: float
    soc_percent: float
    soh_percent: float          # last known value (seed for agents)
    rul_cycles: float
    degradation_rate: float
    cycle_count: float
    power_w: float
    data_source: str

    # ── Agent outputs (set by each node) ─────────────────────────
    soh_agent_output: dict
    rul_agent_output: dict
    charging_agent_output: dict
    maintenance_agent_output: dict
    coordinator_output: dict


# ── Build the compiled graph ───────────────────────────────────────

def _build_graph():
    """Construct and compile the LangGraph StateGraph."""
    builder = StateGraph(BatteryAgentState)

    # Register nodes
    builder.add_node("soh_agent", soh_agent_node)
    builder.add_node("rul_agent", rul_agent_node)
    builder.add_node("charging_agent", charging_agent_node)
    builder.add_node("maintenance_agent", maintenance_agent_node)
    builder.add_node("coordinator_agent", coordinator_agent_node)

    # Sequential edges
    builder.add_edge(START, "soh_agent")
    builder.add_edge("soh_agent", "rul_agent")
    builder.add_edge("rul_agent", "charging_agent")
    builder.add_edge("charging_agent", "maintenance_agent")
    builder.add_edge("maintenance_agent", "coordinator_agent")
    builder.add_edge("coordinator_agent", END)

    graph = builder.compile()
    logger.info("LangGraph agent pipeline compiled successfully.")
    return graph


# ── Compiled graph singleton ───────────────────────────────────────
_graph = None


def get_agent_graph():
    """Return the compiled graph (lazy init)."""
    global _graph
    if _graph is None:
        _graph = _build_graph()
    return _graph


# ── Pipeline runner (called by twin_engine) ────────────────────────

def run_agent_pipeline(twin_state_dict: dict) -> dict:
    """
    Execute the full multi-agent pipeline synchronously.

    This function is called from twin_engine.py via run_in_executor
    (so it runs in a thread, not the asyncio event loop).

    Parameters
    ----------
    twin_state_dict : dict
        The current TwinState serialised as a dict (from TwinState.to_dict()).

    Returns
    -------
    dict
        The coordinator_output dict from the final agent node.
        Returns an empty dict on failure (twin engine has a fallback).
    """
    try:
        graph = get_agent_graph()

        # Build the initial graph state from the twin dict
        initial_state: BatteryAgentState = {
            "battery_id": twin_state_dict.get("battery_id", "BATTERY_01"),
            "voltage_v": twin_state_dict.get("voltage_v", 3.7),
            "current_a": twin_state_dict.get("current_a", 0.0),
            "temperature_c": twin_state_dict.get("temperature_c", 25.0),
            "soc_percent": twin_state_dict.get("soc_percent", 50.0),
            "soh_percent": twin_state_dict.get("soh_percent", 100.0),
            "rul_cycles": twin_state_dict.get("rul_cycles", 500.0),
            "degradation_rate": twin_state_dict.get("degradation_rate", 0.0),
            "cycle_count": twin_state_dict.get("cycle_count", 0.0),
            "power_w": twin_state_dict.get("power_w", 0.0),
            "data_source": twin_state_dict.get("data_source", "SIMULATOR"),
        }

        # Run the graph
        final_state = graph.invoke(initial_state)

        # Return only the coordinator output
        result = final_state.get("coordinator_output", {})
        logger.debug(f"Agent pipeline complete | Priority={result.get('priority', '?')}")
        return result

    except Exception as exc:
        logger.error(f"Agent pipeline failed: {exc}", exc_info=True)
        return {}
