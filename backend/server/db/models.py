import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text, CHAR
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy_easy_softdelete.mixin import generate_soft_delete_mixin_class

from .database import Base


# Create a Class that inherits from our class builder
class SoftDeleteMixin(generate_soft_delete_mixin_class()):
    # type hint for autocomplete IDE support
    deleted_at: datetime


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    created: Mapped[datetime] = mapped_column(default=datetime.utcnow)


class Scene(Base, SoftDeleteMixin):
    __tablename__ = "scenes"
    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(String(512), server_default="")
    created: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped[User] = relationship()
    revisions: Mapped[list["SceneRevision"]] = relationship(back_populates="scene")

    __table_args__ = (
        Index(None, name),
        Index(None, created.desc()),
        Index(None, updated.desc()),
    )


class SceneRevision(Base):
    __tablename__ = "scenes_revisions"
    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    scene_id: Mapped[str] = mapped_column(ForeignKey("scenes.id"))
    scene: Mapped[Scene] = relationship(back_populates="revisions")
    picture: Mapped[str] = mapped_column(Text)
    data: Mapped[str] = mapped_column(Text)
    commiter_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    commiter: Mapped[User] = relationship()

    __table_args__ = (Index(None, created.desc()),)


class File(Base):
    __tablename__ = "scene_files"
    id: Mapped[str] = mapped_column(
        CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    name: Mapped[str] = mapped_column(String(50))
    data: Mapped[str] = mapped_column(Text)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    owner: Mapped[User] = relationship()
    revision_id: Mapped[str] = mapped_column(ForeignKey("scenes_revisions.id"))
    revision: Mapped[SceneRevision] = relationship()
