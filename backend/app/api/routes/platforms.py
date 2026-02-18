from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.platform import PlatformCreate, PlatformOut, PlatformUpdate
from app.services import platform_service

router = APIRouter(prefix="/platforms", tags=["platforms"])


@router.get("/", response_model=list[PlatformOut])
async def list_platforms(db: AsyncSession = Depends(get_db)):
    return await platform_service.get_all(db)


@router.post("/", response_model=PlatformOut, status_code=status.HTTP_201_CREATED)
async def create_platform(data: PlatformCreate, db: AsyncSession = Depends(get_db)):
    return await platform_service.create(db, data)


@router.patch("/{platform_id}", response_model=PlatformOut)
async def update_platform(
    platform_id: int, data: PlatformUpdate, db: AsyncSession = Depends(get_db)
):
    platform = await platform_service.get_by_id(db, platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return await platform_service.update(db, platform, data)


@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform(platform_id: int, db: AsyncSession = Depends(get_db)):
    platform = await platform_service.get_by_id(db, platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    await platform_service.delete(db, platform)
