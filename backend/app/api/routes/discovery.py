from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.discovery import DiscoveryOut
from app.services import discovery_service

router = APIRouter(prefix="/discovery", tags=["discovery"])


@router.get("/", response_model=DiscoveryOut)
async def get_discovery(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated discovery data: continue watching, up next,
    recently completed, watchlist stats, and per-platform breakdown.
    """
    return await discovery_service.compute_discovery(db)
