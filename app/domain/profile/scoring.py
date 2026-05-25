from typing import Dict


def compute_pressure_score(rule_results: Dict[str, dict]) -> dict:
    """
    Compute a pressure score by accumulating numeric rule scores (floats).

    Each rule's numeric score (if > 0) contributes to the running pressure total.
    The returned `pressure_score` is an integer (rounded), `pressure_label` maps
    that integer into the configured bands, `overall` is the normalized average
    across rules (0.0-1.0), and `breakdown` preserves per-rule float scores.
    """
    total_pressure = 0.0
    breakdown: Dict[str, float] = {}
    count = 0

    for name, res in rule_results.items():
        raw = res.get("score", 0)
        try:
            s = float(raw)
        except Exception:
            s = 0.0
        breakdown[name] = s
        if s > 0:
            total_pressure += s
        count += 1

    # Round total pressure to integer for label mapping
    pressure_score = int(round(total_pressure))

    if pressure_score <= 2:
        label = "low"
    elif 3 <= pressure_score <= 4:
        label = "medium"
    elif 5 <= pressure_score <= 6:
        label = "high"
    else:
        label = "critical"

    overall = 0.0
    if count > 0:
        overall = sum(breakdown.values()) / float(count)

    return {
        "pressure_score": int(pressure_score),
        "pressure_label": label,
        "overall": round(float(overall), 4),
        "breakdown": breakdown,
    }
