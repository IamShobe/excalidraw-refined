import dataclasses
from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from server.controllers.scenes import SceneController
from server.db.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


def get_scene_controller(db: db_dependency):
    return SceneController(db)


scene_controller_dependency = Annotated[SceneController, Depends(get_scene_controller)]


@dataclasses.dataclass
class PageParams:
    cursor: str
    limit: int


def get_pagination_params(
    cursor: Annotated[str, Query()] = None,
    limit: Annotated[int, Query()] = 10,
):
    return PageParams(cursor=cursor, limit=limit)


pagination_params_dependency = Annotated[PageParams, Depends(get_pagination_params)]
