from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_current_user
from backend.app.database import get_db
from backend.app.records.schemas import RecordCreate, RecordResponse, RecordUpdate
from backend.app.records.service import (
    create_record,
    delete_record,
    get_record,
    list_records,
    update_record,
)
from backend.app.schema.schema import User


router = APIRouter(prefix="/hosted-zones", tags=["DNS Records"])


@router.get("/{zone_id}/records", response_model=list[RecordResponse])
def list_records_endpoint(
    zone_id: int,
    search: str | None = Query(default=None),
    record_type: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return list_records(zone_id, search, record_type, page, page_size, current_user, db)


@router.post("/{zone_id}/records", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record_endpoint(
    zone_id: int,
    data: RecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_record(zone_id, data, current_user, db)


@router.get("/{zone_id}/records/{record_id}", response_model=RecordResponse)
def get_record_endpoint(
    zone_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_record(zone_id, record_id, current_user, db)


@router.patch("/{zone_id}/records/{record_id}", response_model=RecordResponse)
def update_record_endpoint(
    zone_id: int,
    record_id: int,
    data: RecordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_record(zone_id, record_id, data, current_user, db)


@router.delete("/{zone_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record_endpoint(
    zone_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    delete_record(zone_id, record_id, current_user, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
