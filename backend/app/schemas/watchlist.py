from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

ContentType = Literal["movie", "show"]
WatchStatus = Literal["want_to_watch", "watching", "watched"]


class WatchlistItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: ContentType = "movie"
    status: WatchStatus = "want_to_watch"
    platform_name: str | None = None
    poster_url: str | None = None
    notes: str | None = None


class WatchlistItemCreate(WatchlistItemBase):
    pass


class WatchlistItemUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    type: ContentType | None = None
    status: WatchStatus | None = None
    platform_name: str | None = None
    poster_url: str | None = None
    notes: str | None = None


class WatchlistItemOut(WatchlistItemBase):
    id: int
    added_at: datetime

    model_config = {"from_attributes": True}
