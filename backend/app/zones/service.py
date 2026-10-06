from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.schema.schema import HostedZone, User
from backend.app.zones.schemas import HostedZoneCreate, HostedZoneUpdate


def get_zone(zone_id: int, user_id: int, db: Session) -> HostedZone:

    zone = (
        db.query(HostedZone)
        .filter(HostedZone.id == zone_id, HostedZone.user_id == user_id)
        .first()
    )

    if zone is None:
        raise HTTPException(status_code=404, detail="Hosted zone not found")
    
    return zone


def list_hosted_zones(
    search: str | None,
    page: int,
    page_size: int,
    current_user: User,
    db: Session,
):
    
    query = db.query(HostedZone).filter(HostedZone.user_id == current_user.id)
    
    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    
    return query.order_by(HostedZone.name).offset((page - 1) * page_size).limit(page_size).all()


def create_hosted_zone(data: HostedZoneCreate, current_user: User, db: Session):
    
    zone = HostedZone(
        user_id=current_user.id,
        name=data.name.rstrip(".") + ".",
        comment=data.comment,
        zone_type=data.zone_type,
        private_zone=data.zone_type == "private",
        tags=data.tags,
    )
    
    db.add(zone)
    db.commit()
    db.refresh(zone)
    
    return zone


def update_hosted_zone(
    zone_id: int,
    data: HostedZoneUpdate,
    current_user: User,
    db: Session,
):
    
    zone = get_zone(zone_id, current_user.id, db)
    
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    if data.zone_type is not None:
        zone.private_zone = data.zone_type == "private"
    db.commit()
    db.refresh(zone)
    
    return zone


def delete_hosted_zone(zone_id: int, current_user: User, db: Session):
    
    zone = get_zone(zone_id, current_user.id, db)
    db.delete(zone)
    db.commit()


def get_hosted_zone(zone_id: int, current_user: User, db: Session):
    
    return get_zone(zone_id, current_user.id, db)
