from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.auth.auth_helper import getId
from app.database import get_db
from app.records.schemas import RecordCreate, RecordResponse, RecordUpdate
from app.records.service import (
    create_record,
    delete_record,
    get_record,
    list_records,
    update_record,
)

router = APIRouter(prefix="/hosted-zones", tags=["DNS Records"])


@router.get("/{zone_id}/records", response_model=list[RecordResponse])
def list_records_endpoint(
    zone_id: int,
    search: str | None = Query(default=None),
    record_type: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    return list_records(zone_id, search, record_type, page, page_size, user_id, db)


@router.post("/{zone_id}/records", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record_endpoint(
    zone_id: int,
    data: RecordCreate,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    return create_record(zone_id, data, user_id, db)


@router.get("/{zone_id}/records/{record_id}", response_model=RecordResponse)
def get_record_endpoint(
    zone_id: int,
    record_id: int,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    return get_record(zone_id, record_id, user_id, db)


@router.patch("/{zone_id}/records/{record_id}", response_model=RecordResponse)
def update_record_endpoint(
    zone_id: int,
    record_id: int,
    data: RecordUpdate,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    return update_record(zone_id, record_id, data, user_id, db)


@router.delete("/{zone_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record_endpoint(
    zone_id: int,
    record_id: int,
    user_id: int = Depends(getId),
    db: Session = Depends(get_db),
):
    delete_record(zone_id, record_id, user_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
