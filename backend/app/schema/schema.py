from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)
    username = Column(String, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    hosted_zones = relationship(
        "HostedZone",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False,unique=True)
    comment = Column(String, nullable=True, default="")
    zone_type = Column(String, nullable=False, default="public")
    private_zone = Column(Boolean, nullable=False, default=False)
    tags = Column(JSON, nullable=False, default=list)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    user = relationship("User", back_populates="hosted_zones")
    records = relationship(
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan",
    )


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("hosted_zones.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    record_type = Column(String, nullable=False, index=True)
    ttl = Column(Integer, nullable=False, default=300)
    values = Column(JSON, nullable=False, default=list)
    routing_policy = Column(String, nullable=False, default="simple")
    alias_target = Column(String, nullable=True)
    health_check_id = Column(String, nullable=True)
    hosted_zone = relationship("HostedZone", back_populates="records")