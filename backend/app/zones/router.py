from fastapi import APIRouter, Depends, Query, Response, status, Request, HTTPException
from sqlalchemy.orm import Session

from app.auth.auth_helper import get_current_user
from app.database import get_db
from app.schema.schema import User
from app.zones.schemas import (
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
)
from app.zones.service import (
    create_hosted_zone,
    delete_hosted_zone,
    get_hosted_zone,
    list_hosted_zones,
    update_hosted_zone,
)

from app.auth.auth_helper import getId


router = APIRouter(prefix="/hosted-zones", tags=["Hosted Zones"])


@router.get("", response_model=list[HostedZoneResponse])
def list_hosted_zones_endpoint(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    user_id: int = Depends(getId),   
    db: Session = Depends(get_db)
):
    
    return list_hosted_zones(search, page, page_size, user_id, db)


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone_endpoint(
    data: HostedZoneCreate,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    
    return create_hosted_zone(data, user_id, db)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone_endpoint(
    zone_id: int,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):

    return get_hosted_zone(zone_id, user_id, db)


@router.patch("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone_endpoint(
    zone_id: int,
    data: HostedZoneUpdate,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    return update_hosted_zone(zone_id, data, user_id, db)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone_endpoint(
    zone_id: int,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):

    delete_hosted_zone(zone_id, user_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)