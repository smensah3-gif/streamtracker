from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.insights import InsightsOut
from app.services import insights_service

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/", response_model=InsightsOut)
async def get_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await insights_service.compute_insights(db, current_user.id)
