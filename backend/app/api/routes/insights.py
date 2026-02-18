from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.insights import InsightsOut
from app.services import insights_service

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/", response_model=InsightsOut)
async def get_insights(db: AsyncSession = Depends(get_db)):
    """
    Compute churn risk and subscription recommendations for all subscribed platforms.

    Scores are derived from watchlist engagement data (completion rate, activity
    recency, cost efficiency) using MinMaxScaler-normalized weighted features.
    Recomputed fresh on every call — no caching needed at MVP scale.
    """
    return await insights_service.compute_insights(db)
