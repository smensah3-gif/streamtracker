from datetime import datetime

from pydantic import BaseModel, Field


class PlatformBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(default="#6366f1", pattern=r"^#[0-9a-fA-F]{6}$")
    monthly_cost: float = Field(default=0.0, ge=0)
    is_subscribed: bool = False


class PlatformCreate(PlatformBase):
    pass


class PlatformUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")
    monthly_cost: float | None = Field(default=None, ge=0)
    is_subscribed: bool | None = None


class PlatformOut(PlatformBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
