"""
ML-based subscription churn prediction and recommendation service.

Approach:
  - Extract 5 features per subscribed platform from existing watchlist data
  - Normalize with MinMaxScaler (scikit-learn) so platforms are compared fairly
  - Compute a weighted value score and churn risk
  - Produce keep / review / cancel recommendations with natural-language reasons

No external training data or model persistence is needed — the feature space is
tiny (≤50 items/platform) and recomputed fresh on each request.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform import Platform
from app.models.watchlist import WatchlistItem
from app.schemas.insights import (
    ActionType,
    ConfidenceLevel,
    InsightsOut,
    PlatformFeatures,
    Recommendation,
)

# ---------------------------------------------------------------------------
# Weights for the five features (must sum to 1.0)
# ---------------------------------------------------------------------------
FEATURE_NAMES = [
    "completion_rate",
    "engagement_rate",
    "recency_score",
    "content_volume",
    "cost_efficiency",
]
WEIGHTS = np.array([0.30, 0.25, 0.20, 0.10, 0.15], dtype=np.float64)

# Churn risk thresholds
CANCEL_THRESHOLD = 0.70
REVIEW_THRESHOLD = 0.45
REVIEW_VALUE_MAX = 40.0  # even with lower churn risk, low value → review


# ---------------------------------------------------------------------------
# Step 1: Fetch raw aggregates
# ---------------------------------------------------------------------------

async def _fetch_aggregates(db: AsyncSession) -> dict[str, dict[str, Any]]:
    """
    Query watchlist table, group by lower(platform_name), and return raw counts.
    Returns dict keyed by lowercase platform name.
    """
    stmt = (
        select(
            func.lower(WatchlistItem.platform_name).label("pname"),
            func.count().label("total_items"),
            func.count(case((WatchlistItem.status == "watched", 1))).label("watched_count"),
            func.count(case((WatchlistItem.status == "watching", 1))).label("watching_count"),
            func.count(case((WatchlistItem.status == "want_to_watch", 1))).label("want_count"),
            func.count(case((WatchlistItem.type == "movie", 1))).label("movie_count"),
            func.count(case((WatchlistItem.type == "show", 1))).label("show_count"),
            func.max(WatchlistItem.added_at).label("most_recent_added"),
        )
        .where(WatchlistItem.platform_name.isnot(None))
        .group_by(func.lower(WatchlistItem.platform_name))
    )
    result = await db.execute(stmt)
    rows = result.mappings().all()

    return {
        row["pname"]: {
            "total_items": row["total_items"],
            "watched_count": row["watched_count"],
            "watching_count": row["watching_count"],
            "want_count": row["want_count"],
            "movie_count": row["movie_count"],
            "show_count": row["show_count"],
            "most_recent_added": row["most_recent_added"],
        }
        for row in rows
    }


# ---------------------------------------------------------------------------
# Step 2: Compute raw (pre-normalization) features per platform
# ---------------------------------------------------------------------------

def _compute_raw_features(
    platform: Platform,
    agg: dict[str, Any],
    now: datetime,
) -> PlatformFeatures:
    total = agg["total_items"]
    watched = agg["watched_count"]
    watching = agg["watching_count"]
    want = agg["want_count"]
    movie_count = agg["movie_count"]
    show_count = agg["show_count"]
    most_recent: datetime | None = agg["most_recent_added"]

    # Completion rate: of consumed content, how much is finished
    consumed = watched + watching
    completion_rate = watched / consumed if consumed > 0 else 0.0

    # Engagement rate: fraction of total watchlist that is active/done
    engagement_rate = consumed / total if total > 0 else 0.0

    # Recency: how recently was content added/interacted with
    if most_recent is not None:
        # Ensure timezone-aware comparison
        if most_recent.tzinfo is None:
            most_recent = most_recent.replace(tzinfo=timezone.utc)
        days_since = max(0, (now - most_recent).days)
    else:
        days_since = 365
    recency_score = max(0.0, 1.0 - (days_since / 365.0))

    # Cost efficiency: watched items per dollar (or free-platform bonus)
    cost = platform.monthly_cost
    if cost > 0:
        cost_efficiency_raw = watched / cost
    else:
        cost_efficiency_raw = float(watched) * 2.0  # free platforms rewarded

    return PlatformFeatures(
        platform_id=platform.id,
        platform_name=platform.name,
        platform_color=platform.color,
        monthly_cost=cost,
        total_items=total,
        watched_count=watched,
        watching_count=watching,
        want_count=want,
        movie_count=movie_count,
        show_count=show_count,
        days_since_last_activity=days_since,
        completion_rate=round(completion_rate, 4),
        engagement_rate=round(engagement_rate, 4),
        recency_score=round(recency_score, 4),
        content_volume_raw=total,
        cost_efficiency_raw=round(cost_efficiency_raw, 4),
    )


# ---------------------------------------------------------------------------
# Step 3: Build and scale the feature matrix
# ---------------------------------------------------------------------------

def _build_feature_matrix(features: list[PlatformFeatures]) -> np.ndarray:
    """Assembles (N, 5) float64 matrix: [completion, engagement, recency, volume, cost_eff]"""
    rows = []
    for f in features:
        rows.append([
            f.completion_rate,
            f.engagement_rate,
            f.recency_score,
            float(f.content_volume_raw),
            f.cost_efficiency_raw,
        ])
    return np.array(rows, dtype=np.float64)


def _safe_scale(matrix: np.ndarray) -> np.ndarray:
    """
    MinMaxScaler column-wise.  Zero-variance columns become 0.0 (not NaN).
    Single-row case: bypass scaler — use the clamped [0,1] values directly
    for features that are already bounded, or 0.0 for volume/cost_eff.
    """
    n = matrix.shape[0]
    if n == 0:
        return matrix

    if n == 1:
        # Can't scale a single row; return clamped values
        scaled = matrix.copy()
        scaled[0, 3] = 0.0  # content_volume: unknown relative size
        scaled[0, 4] = 0.0  # cost_efficiency: unknown relative size
        return np.clip(scaled, 0.0, 1.0)

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(matrix)

    # Guard: replace NaN (zero-variance columns) with 0.0
    scaled = np.where(np.isnan(scaled), 0.0, scaled)
    return scaled


# ---------------------------------------------------------------------------
# Step 4: Score one platform
# ---------------------------------------------------------------------------

def _score_platform(
    scaled_row: np.ndarray,
    platform: Platform,
    raw: PlatformFeatures,
    max_subscribed_cost: float,
) -> tuple[float, float, dict[str, float]]:
    """Returns (value_score 0-100, churn_risk 0-1, feature_contributions dict)."""

    contributions = {
        name: float(round(scaled_row[i] * WEIGHTS[i], 4))
        for i, name in enumerate(FEATURE_NAMES)
    }
    weighted = float(np.dot(scaled_row, WEIGHTS))
    value_score = round(min(100.0, max(0.0, weighted * 100)), 1)

    base_risk = 1.0 - weighted

    # Cost penalty: expensive platform with little engagement
    cost_penalty = 0.0
    if platform.monthly_cost > 0 and raw.engagement_rate < 0.25:
        norm_cost = platform.monthly_cost / max_subscribed_cost if max_subscribed_cost > 0 else 0.0
        cost_penalty = norm_cost * 0.15

    churn_risk = round(min(1.0, base_risk + cost_penalty), 3)

    return value_score, churn_risk, contributions


def _get_action(value_score: float, churn_risk: float) -> ActionType:
    if churn_risk >= CANCEL_THRESHOLD:
        return "cancel"
    if churn_risk >= REVIEW_THRESHOLD or value_score < REVIEW_VALUE_MAX:
        return "review"
    return "keep"


def _get_confidence(action: ActionType, value_score: float, churn_risk: float) -> ConfidenceLevel:
    if action == "cancel" and churn_risk >= 0.85:
        return "high"
    if action == "keep" and value_score >= 70.0:
        return "high"
    return "medium"


def _generate_reason(
    action: ActionType,
    raw: PlatformFeatures,
    churn_risk: float,
    value_score: float,
) -> str:
    name = raw.platform_name
    cost_str = f"${raw.monthly_cost:.2f}/mo" if raw.monthly_cost > 0 else "free"

    if raw.total_items == 0:
        return f"No watchlist items recorded for {name} — add content to improve this score."

    pct_watched = int(raw.completion_rate * 100)
    pct_engaged = int(raw.engagement_rate * 100)
    days = raw.days_since_last_activity

    if action == "cancel":
        if days >= 180:
            return (
                f"No activity in {days} days and {pct_engaged}% engagement at {cost_str} "
                f"— strong cancel signal."
            )
        if raw.engagement_rate < 0.15:
            return (
                f"Only {pct_engaged}% of your {name} content has been watched or is in progress "
                f"({cost_str}) — not worth the cost."
            )
        return (
            f"Low value score ({value_score:.0f}/100) relative to {cost_str} cost "
            f"— consider cancelling."
        )

    if action == "review":
        if raw.watched_count == 0 and raw.total_items > 0:
            return (
                f"You have {raw.total_items} items queued on {name} but haven't watched any yet "
                f"— worth keeping if you plan to watch soon."
            )
        if raw.completion_rate < 0.30 and raw.monthly_cost > 0:
            return (
                f"{pct_watched}% completion rate on {name} ({cost_str}) "
                f"— decent queue but low follow-through."
            )
        return (
            f"Mixed signals: {pct_engaged}% engaged, {pct_watched}% completed "
            f"on {name} ({cost_str}) — monitor usage before renewing."
        )

    # keep
    if raw.completion_rate >= 0.7:
        return (
            f"Excellent — {pct_watched}% of {name} content completed"
            + (f" at {cost_str}" if raw.monthly_cost > 0 else " (free)")
            + "."
        )
    recent_str = "recently" if days < 14 else f"within {days} days"
    return (
        f"Solid engagement ({pct_engaged}% active, {pct_watched}% completed) "
        f"with content added {recent_str} — good value."
    )


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

async def compute_insights(db: AsyncSession) -> InsightsOut:
    now = datetime.now(timezone.utc)

    # Fetch all platforms
    from sqlalchemy import select as sa_select
    result = await db.execute(sa_select(Platform).order_by(Platform.name))
    all_platforms: list[Platform] = list(result.scalars().all())

    subscribed = [p for p in all_platforms if p.is_subscribed]
    if not subscribed:
        return InsightsOut(
            generated_at=now,
            total_monthly_spend=0.0,
            subscribed_platform_count=0,
            data_coverage_note="No subscribed platforms. Mark platforms as subscribed to see insights.",
            recommendations=[],
            platform_features=[],
        )

    # Fetch watchlist aggregates (all platforms, for scaler breadth)
    aggregates = await _fetch_aggregates(db)

    # Build raw features for each subscribed platform
    raw_features: list[PlatformFeatures] = []
    for platform in subscribed:
        key = platform.name.lower()
        agg = aggregates.get(key, {
            "total_items": 0,
            "watched_count": 0,
            "watching_count": 0,
            "want_count": 0,
            "movie_count": 0,
            "show_count": 0,
            "most_recent_added": None,
        })
        raw_features.append(_compute_raw_features(platform, agg, now))

    # Build and scale feature matrix
    matrix = _build_feature_matrix(raw_features)
    scaled = _safe_scale(matrix)

    # Cost denominator for penalty computation
    max_cost = max((p.monthly_cost for p in subscribed), default=0.0)

    # Score each platform
    recommendations: list[Recommendation] = []
    for i, (platform, raw) in enumerate(zip(subscribed, raw_features)):
        value_score, churn_risk, contributions = _score_platform(
            scaled[i], platform, raw, max_cost
        )
        action = _get_action(value_score, churn_risk)
        confidence = _get_confidence(action, value_score, churn_risk)
        reason = _generate_reason(action, raw, churn_risk, value_score)

        recommendations.append(
            Recommendation(
                platform_id=platform.id,
                platform_name=platform.name,
                platform_color=platform.color,
                monthly_cost=platform.monthly_cost,
                value_score=value_score,
                churn_risk=churn_risk,
                action=action,
                confidence=confidence,
                feature_contributions=contributions,
                reason=reason,
            )
        )

    # Sort highest churn risk first
    recommendations.sort(key=lambda r: r.churn_risk, reverse=True)

    # Data coverage note
    platforms_with_data = sum(1 for f in raw_features if f.total_items > 0)
    total_sub = len(subscribed)
    coverage_note: str | None = None
    if platforms_with_data < total_sub:
        missing = total_sub - platforms_with_data
        coverage_note = (
            f"{platforms_with_data} of {total_sub} subscribed platforms have watchlist data. "
            f"Add content for the other {missing} to improve accuracy."
        )
    if len(subscribed) == 1:
        note = "Only 1 subscribed platform — scores are absolute (no relative comparison)."
        coverage_note = (coverage_note + " " + note) if coverage_note else note

    total_spend = sum(p.monthly_cost for p in subscribed)

    return InsightsOut(
        generated_at=now,
        total_monthly_spend=round(total_spend, 2),
        subscribed_platform_count=total_sub,
        data_coverage_note=coverage_note,
        recommendations=recommendations,
        platform_features=raw_features,
    )
