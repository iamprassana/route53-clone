from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.app.auth.auth_helper import get_current_user
from backend.app.database import get_db
from backend.app.schema.schema import User
from backend.app.zones.schemas import (
    HostedZoneCreate,
    HostedZoneResponse,
    HostedZoneUpdate,
)
from backend.app.zones.service import (
    create_hosted_zone,
    delete_hosted_zone,
    get_hosted_zone,
    list_hosted_zones,
    update_hosted_zone,
)


router = APIRouter(prefix="/hosted-zones", tags=["Hosted Zones"])


@router.get("", response_model=list[HostedZoneResponse])
def list_hosted_zones_endpoint(
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_hosted_zones(search, page, page_size, current_user, db)


@router.post("", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone_endpoint(
    data: HostedZoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return create_hosted_zone(data, current_user, db)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone_endpoint(
    zone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_hosted_zone(zone_id, current_user, db)


@router.patch("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone_endpoint(
    zone_id: int,
    data: HostedZoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    
    return update_hosted_zone(zone_id, data, current_user, db)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone_endpoint(
    zone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_hosted_zone(zone_id, current_user, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
