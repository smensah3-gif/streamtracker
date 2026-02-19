from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform import Platform
from app.models.watchlist import WatchlistItem
from app.schemas.discovery import (
    DiscoveryOut,
    PlatformBreakdown,
    WatchlistItemSlim,
    WatchlistStats,
)

# Rough viewing time estimates (hours per item)
_HOURS = {"movie": 2.0, "show": 0.75}


async def compute_discovery(db: AsyncSession, user_id: int) -> DiscoveryOut:
    # ------------------------------------------------------------------ #
    # 1. Fetch watchlist sections
    # ------------------------------------------------------------------ #
    async def _fetch(status: str, limit: int | None = None):
        q = (
            select(WatchlistItem)
            .where(WatchlistItem.user_id == user_id, WatchlistItem.status == status)
            .order_by(WatchlistItem.added_at.desc())
        )
        if limit:
            q = q.limit(limit)
        result = await db.execute(q)
        return list(result.scalars().all())

    continue_watching = await _fetch("watching")
    up_next = await _fetch("want_to_watch", limit=10)
    recently_completed = await _fetch("watched", limit=5)

    # ------------------------------------------------------------------ #
    # 2. Aggregate stats
    # ------------------------------------------------------------------ #
    count_q = await db.execute(
        select(
            WatchlistItem.status,
            WatchlistItem.type,
            func.count().label("n"),
        )
        .where(WatchlistItem.user_id == user_id)
        .group_by(WatchlistItem.status, WatchlistItem.type)
    )
    rows = count_q.mappings().all()

    counts: dict[str, int] = {"watched": 0, "watching": 0, "want_to_watch": 0}
    hours_remaining = 0.0
    for row in rows:
        counts[row["status"]] = counts.get(row["status"], 0) + row["n"]
        if row["status"] in ("watching", "want_to_watch"):
            hours_remaining += row["n"] * _HOURS.get(row["type"], 1.0)

    total_items = sum(counts.values())

    platform_result = await db.execute(
        select(Platform).where(Platform.user_id == user_id)
    )
    all_platforms = list(platform_result.scalars().all())
    subscribed_count = sum(1 for p in all_platforms if p.is_subscribed)

    stats = WatchlistStats(
        total_items=total_items,
        watched=counts["watched"],
        watching=counts["watching"],
        want_to_watch=counts["want_to_watch"],
        total_platforms=len(all_platforms),
        subscribed_platforms=subscribed_count,
        estimated_hours_remaining=round(hours_remaining, 1),
    )

    # ------------------------------------------------------------------ #
    # 3. Per-platform breakdown
    # ------------------------------------------------------------------ #
    breakdown_q = await db.execute(
        select(
            func.lower(WatchlistItem.platform_name).label("pname"),
            WatchlistItem.status,
            func.count().label("n"),
        )
        .where(WatchlistItem.user_id == user_id, WatchlistItem.platform_name.isnot(None))
        .group_by(func.lower(WatchlistItem.platform_name), WatchlistItem.status)
    )
    breakdown_rows = breakdown_q.mappings().all()

    pdata: dict[str, dict] = {}
    for row in breakdown_rows:
        key = row["pname"]
        if key not in pdata:
            pdata[key] = {"watched": 0, "watching": 0, "want_to_watch": 0}
        pdata[key][row["status"]] = row["n"]

    platform_map = {p.name.lower(): p for p in all_platforms}

    breakdown: list[PlatformBreakdown] = []
    for pname, d in pdata.items():
        p = platform_map.get(pname)
        total = d["watched"] + d["watching"] + d["want_to_watch"]
        breakdown.append(
            PlatformBreakdown(
                platform_name=p.name if p else pname.title(),
                color=p.color if p else "#6366f1",
                is_subscribed=p.is_subscribed if p else False,
                total=total,
                watched=d["watched"],
                watching=d["watching"],
                want_to_watch=d["want_to_watch"],
            )
        )

    breakdown.sort(key=lambda x: x.total, reverse=True)

    # ------------------------------------------------------------------ #
    # 4. Build response
    # ------------------------------------------------------------------ #
    def slim(items: list[WatchlistItem]) -> list[WatchlistItemSlim]:
        return [WatchlistItemSlim.model_validate(i) for i in items]

    return DiscoveryOut(
        continue_watching=slim(continue_watching),
        up_next=slim(up_next),
        recently_completed=slim(recently_completed),
        stats=stats,
        platform_breakdown=breakdown,
    )
