from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class WatchlistItemSlim(BaseModel):
    """Lightweight watchlist item for discovery sections."""
    id: int
    title: str
    type: str
    status: str
    platform_name: str | None
    poster_url: str | None
    added_at: datetime

    model_config = {"from_attributes": True}


class PlatformBreakdown(BaseModel):
    platform_name: str
    color: str
    is_subscribed: bool
    total: int
    watched: int
    watching: int
    want_to_watch: int


class WatchlistStats(BaseModel):
    total_items: int
    watched: int
    watching: int
    want_to_watch: int
    total_platforms: int
    subscribed_platforms: int
    estimated_hours_remaining: float  # movies ~2h, shows ~0.75h per item


class DiscoveryOut(BaseModel):
    continue_watching: list[WatchlistItemSlim]    # status=watching
    up_next: list[WatchlistItemSlim]              # status=want_to_watch, limit 10
    recently_completed: list[WatchlistItemSlim]   # status=watched, limit 5
    stats: WatchlistStats
    platform_breakdown: list[PlatformBreakdown]   # sorted by total desc
