from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]


class RecordCreate(BaseModel):
    name: str = Field(min_length=1)
    record_type: RecordType
    ttl: int = Field(default=300, ge=0)
    values: list[str] = Field(min_length=1)
    routing_policy: str = "simple"
    alias_target: str | None = None
    health_check_id: str | None = None


class RecordUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    record_type: RecordType | None = None
    ttl: int | None = Field(default=None, ge=0)
    values: list[str] | None = Field(default=None, min_length=1)
    routing_policy: str | None = None
    alias_target: str | None = None
    health_check_id: str | None = None


class RecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    zone_id: int
    name: str
    record_type: str
    ttl: int
    values: list[str]
    routing_policy: str
    alias_target: str | None
    health_check_id: str | None
