from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ActionType = Literal["keep", "review", "cancel"]
ConfidenceLevel = Literal["high", "medium"]


class PlatformFeatures(BaseModel):
    """Raw (pre-normalization) features for one platform — returned for transparency."""

    platform_id: int
    platform_name: str
    platform_color: str
    monthly_cost: float

    # Raw counts
    total_items: int
    watched_count: int
    watching_count: int
    want_count: int
    movie_count: int
    show_count: int
    days_since_last_activity: int  # 365 if platform has no watchlist items

    # Derived pre-normalization features
    completion_rate: float = Field(ge=0.0, le=1.0)
    engagement_rate: float = Field(ge=0.0, le=1.0)
    recency_score: float = Field(ge=0.0, le=1.0)
    content_volume_raw: int
    cost_efficiency_raw: float


class Recommendation(BaseModel):
    """One recommendation per subscribed platform, sorted by churn_risk descending."""

    platform_id: int
    platform_name: str
    platform_color: str
    monthly_cost: float

    value_score: float = Field(ge=0.0, le=100.0)
    churn_risk: float = Field(ge=0.0, le=1.0)
    action: ActionType
    confidence: ConfidenceLevel

    # Weighted per-feature contribution to the 0–1 score (for the breakdown UI)
    feature_contributions: dict[str, float]

    reason: str


class InsightsOut(BaseModel):
    """Top-level response for GET /api/v1/insights/"""

    generated_at: datetime
    total_monthly_spend: float
    subscribed_platform_count: int
    data_coverage_note: str | None

    recommendations: list[Recommendation]
    platform_features: list[PlatformFeatures]
