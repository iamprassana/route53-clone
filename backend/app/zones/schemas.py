from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

zoneType = Literal["public", "private"]

class HostedZoneCreate(BaseModel):
    name: str = Field(min_length=1)
    comment: str = ""
    zone_type: zoneType = "public"
    tags: list[str] = Field(default_factory=list)


class HostedZoneUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    comment: str | None = None
    zone_type: zoneType | None = None
    tags: list[str] | None = None


class HostedZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    comment: str
    zone_type: str
    private_zone: bool
    tags: list[str]
    created_at: datetime
