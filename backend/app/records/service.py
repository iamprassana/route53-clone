from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.app.records.schemas import RecordCreate, RecordUpdate
from backend.app.schema.schema import DNSRecord, User
from backend.app.zones.service import get_zone


def list_records(
    zone_id: int,
    search: str | None,
    record_type: str | None,
    page: int,
    page_size: int,
    current_user: User,
    db: Session,
):
    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, current_user.id, db)
    
    query = db.query(DNSRecord).filter(DNSRecord.zone_id == zone_id)

    if search:
        query = query.filter(DNSRecord.name.ilike(f"%{search}%"))
    
    if record_type:
        query = query.filter(DNSRecord.record_type == record_type.upper())
    
    return query.order_by(DNSRecord.name, DNSRecord.record_type).offset((page - 1) * page_size).limit(page_size).all()


def create_record(zone_id: int, data: RecordCreate, current_user: User, db: Session):

    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, current_user.id, db)

    record = DNSRecord(zone_id=zone_id, **data.model_dump())

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
        return record
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed",
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create record: {str(e)}",
        )


def get_record(zone_id: int, record_id: int, current_user: User, db: Session):

    # Validate that the zone exists and belongs to the current user.
    get_zone(zone_id, current_user.id, db)
    
    record = db.query(DNSRecord).filter(
        DNSRecord.id == record_id,
        DNSRecord.zone_id == zone_id,
    ).first()
    
    if record is None:
        raise HTTPException(status_code=404, detail="DNS record not found")
    
    return record


def update_record(
    zone_id: int,
    record_id: int,
    data: RecordUpdate,
    current_user: User,
    db: Session,
):
    
    record = get_record(zone_id, record_id, current_user, db)
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    try:
        db.commit()
        db.refresh(record)
        return record
    
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update record: {str(e)}",
        )


def delete_record(zone_id: int, record_id: int, current_user: User, db: Session):
    
    record = get_record(zone_id, record_id, current_user, db)

    try:
        db.delete(record)
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed",
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete record: {str(e)}",
        )