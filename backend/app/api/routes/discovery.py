from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.discovery import DiscoveryOut
from app.services import discovery_service

router = APIRouter(prefix="/discovery", tags=["discovery"])


@router.get("/", response_model=DiscoveryOut)
async def get_discovery(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await discovery_service.compute_discovery(db, current_user.id)
