from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemOut, WatchlistItemUpdate
from app.services import watchlist_service

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("/", response_model=list[WatchlistItemOut])
async def list_watchlist(
    status: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    return await watchlist_service.get_all(db, status=status)


@router.post("/", response_model=WatchlistItemOut, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    data: WatchlistItemCreate, db: AsyncSession = Depends(get_db)
):
    return await watchlist_service.create(db, data)


@router.patch("/{item_id}", response_model=WatchlistItemOut)
async def update_watchlist_item(
    item_id: int, data: WatchlistItemUpdate, db: AsyncSession = Depends(get_db)
):
    item = await watchlist_service.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return await watchlist_service.update(db, item, data)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_watchlist(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await watchlist_service.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    await watchlist_service.delete(db, item)
