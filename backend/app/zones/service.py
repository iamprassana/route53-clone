from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.schema.schema import HostedZone
from app.zones.schemas import HostedZoneCreate, HostedZoneUpdate


def get_zone(zone_id: int, user_id: int, db: Session) -> HostedZone:
    try:
        zone = (
            db.query(HostedZone)
            .filter(
                HostedZone.id == zone_id,
                HostedZone.user_id == user_id,
            )
            .first()
        )
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )

    if zone is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hosted zone not found.",
        )

    return zone


def list_hosted_zones(
    search: str | None,
    page: int,
    page_size: int,
    user_id: int,
    db: Session,
):
    try:
        query = db.query(HostedZone).filter(
            HostedZone.user_id == user_id
        )

        if search:
            query = query.filter(
                HostedZone.name.ilike(f"%{search}%")
            )

        return (
            query.order_by(HostedZone.name)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def create_hosted_zone(
    data: HostedZoneCreate,
    user_id: int,
    db: Session,
):
    zone = HostedZone(
        user_id=user_id,
        name=data.name.rstrip(".") + ".",
        comment=data.comment,
        zone_type=data.zone_type,
        private_zone=data.zone_type == "private",
        tags=data.tags,
    )

    try:
        db.add(zone)
        db.commit()
        db.refresh(zone)
        return zone

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A hosted zone with these details already exists.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def update_hosted_zone(
    zone_id: int,
    data: HostedZoneUpdate,
    user_id: int,
    db: Session,
):
    zone = get_zone(zone_id, user_id, db)

    updates = data.model_dump(exclude_unset=True)

    if updates.get("name") is not None:
        updates["name"] = updates["name"].rstrip(".") + "."

    for field, value in updates.items():
        setattr(zone, field, value)

    if "zone_type" in updates:
        zone.private_zone = updates["zone_type"] == "private"

    try:
        db.commit()
        db.refresh(zone)
        return zone

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A hosted zone with these details already exists.",
        )

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def delete_hosted_zone(
    zone_id: int,
    user_id: int,
    db: Session,
):
    zone = get_zone(zone_id, user_id, db)

    try:
        db.delete(zone)
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database operation failed.",
        )


def get_hosted_zone(
    zone_id: int,
    user_id: int,
    db: Session,
) -> HostedZone:
    return get_zone(zone_id, user_id, db)