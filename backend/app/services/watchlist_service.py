from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemUpdate


async def get_all(db: AsyncSession, status: str | None = None) -> list[WatchlistItem]:
    query = select(WatchlistItem).order_by(WatchlistItem.added_at.desc())
    if status:
        query = query.where(WatchlistItem.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, item_id: int) -> WatchlistItem | None:
    return await db.get(WatchlistItem, item_id)


async def create(db: AsyncSession, data: WatchlistItemCreate) -> WatchlistItem:
    item = WatchlistItem(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update(
    db: AsyncSession, item: WatchlistItem, data: WatchlistItemUpdate
) -> WatchlistItem:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


async def delete(db: AsyncSession, item: WatchlistItem) -> None:
    await db.delete(item)
    await db.commit()
