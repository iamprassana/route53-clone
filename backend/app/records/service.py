from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.records.schemas import RecordCreate, RecordUpdate
from app.schema.schema import DNSRecord
from app.zones.service import get_zone


def list_records(
    zone_id: int,
    search: str | None,
    record_type: str | None,
    page: int,
    page_size: int,
    user_id: int,
    db: Session,
):
    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, user_id, db)

    try:
        query = db.query(DNSRecord).filter(
            DNSRecord.zone_id == zone_id
        )

        if search:
            query = query.filter(
                DNSRecord.name.ilike(f"%{search}%")
            )

        if record_type:
            query = query.filter(
                DNSRecord.record_type == record_type.upper()
            )

        return (
            query.order_by(
                DNSRecord.name,
                DNSRecord.record_type,
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def create_record(
    zone_id: int,
    data: RecordCreate,
    user_id: int,
    db: Session,
):
    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, user_id, db)

    record = DNSRecord(
        zone_id=zone_id,
        **data.model_dump(),
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record conflicts with an existing database constraint.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def get_record(
    zone_id: int,
    record_id: int,
    user_id: int,
    db: Session,
):
    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, user_id, db)

    try:
        record = (
            db.query(DNSRecord)
            .filter(
                DNSRecord.id == record_id,
                DNSRecord.zone_id == zone_id,
            )
            .first()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )

    # Keep this outside the try block so the 404 isn't caught accidentally.
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="DNS record not found.",
        )

    return record


def update_record(
    zone_id: int,
    record_id: int,
    data: RecordUpdate,
    user_id: int,
    db: Session,
):
    record = get_record(zone_id, record_id, user_id, db)

    updates = data.model_dump(exclude_unset=True)

    if updates.get("record_type"):
        updates["record_type"] = updates["record_type"].upper()

    for field, value in updates.items():
        setattr(record, field, value)

    try:
        db.commit()
        db.refresh(record)
        return record

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record conflicts with an existing database constraint.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def delete_record(
    zone_id: int,
    record_id: int,
    user_id: int,
    db: Session,
):
    record = get_record(zone_id, record_id, user_id, db)

    try:
        db.delete(record)
        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record cannot be deleted because of a database constraint.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )