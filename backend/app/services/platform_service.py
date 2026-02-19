from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.platform import Platform
from app.schemas.platform import PlatformCreate, PlatformUpdate


async def get_all(db: AsyncSession, user_id: int) -> list[Platform]:
    result = await db.execute(
        select(Platform)
        .where(Platform.user_id == user_id)
        .order_by(Platform.name)
    )
    return list(result.scalars().all())


async def get_by_id(db: AsyncSession, platform_id: int) -> Platform | None:
    return await db.get(Platform, platform_id)


async def create(db: AsyncSession, data: PlatformCreate, user_id: int) -> Platform:
    platform = Platform(**data.model_dump(), user_id=user_id)
    db.add(platform)
    await db.commit()
    await db.refresh(platform)
    return platform


async def update(
    db: AsyncSession, platform: Platform, data: PlatformUpdate
) -> Platform:
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(platform, field, value)
    await db.commit()
    await db.refresh(platform)
    return platform


async def delete(db: AsyncSession, platform: Platform) -> None:
    await db.delete(platform)
    await db.commit()
