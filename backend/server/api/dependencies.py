import dataclasses
from typing import Annotated, AsyncGenerator

from fastapi import Depends, Query
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from server.db.models import OAuthAccount, User
from sqlalchemy.ext.asyncio import AsyncSession

from server.controllers.scenes import SceneController
from server.db.database import async_session_maker




async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)


def get_scene_controller(session: AsyncSession = Depends(get_async_session)):
    return SceneController(session)


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
