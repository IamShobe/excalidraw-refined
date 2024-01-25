from datetime import datetime
from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased, defer

from server.db.models import File, Scene, SceneRevision


class BaseSceneWithRevision(BaseModel):
    name: str
    description: str
    picture: str
    data: str


class EnrichedSceneWithRevision(BaseSceneWithRevision):
    id: str
    revision_id: str
    files_ids: list[str] = Field(default_factory=list)


class SceneSummary(BaseModel):
    id: str
    created: datetime
    last_updated: datetime
    revision_id: str
    name: str
    description: str
    picture: str


class SceneFile(BaseModel):
    name: str
    data: str


class SceneFileWithId(SceneFile):
    id: str


T = TypeVar("T", bound=BaseModel)


class Page(BaseModel, Generic[T]):
    items: list[T]
    limit: int
    total: int
    count: int


class CursorPage(Page[T], Generic[T]):
    next_cursor: Optional[str]


class SceneController:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def get_scene_with_latest_revision(
        self, scene_id: str
    ) -> EnrichedSceneWithRevision:
        query = (
            select(
                SceneRevision,
                Scene,
            )
            .join(Scene)
            .distinct(Scene.id)
            .order_by(
                Scene.id,
                SceneRevision.created.desc(),
            )
            .where(Scene.id == scene_id)
        )

        result = self.db_session.execute(query).first()
        if result is None:
            raise ValueError(f"Scene with id {scene_id} not found")

        revision, scene = result.tuple()

        files_ids = (
            self.db_session.query(File.id)
            .where(
                File.revision_id == revision.id,
            )
            .all()
        )

        return EnrichedSceneWithRevision(
            id=scene.id,
            revision_id=revision.id,
            name=scene.name,
            description=scene.description,
            picture=revision.picture,
            data=revision.data,
            files_ids=[file_id for (file_id,) in files_ids],
        )

    def get_scene_file(self, file_id: str) -> SceneFileWithId:
        found_file = self.db_session.query(File).where(File.id == file_id).first()
        if found_file is None:
            raise ValueError(f"File with id {file_id} not found")

        return SceneFileWithId(
            id=found_file.id,
            name=found_file.name,
            data=found_file.data,
        )

    def add_file_to_scene(self, revision_id: str, file: SceneFile) -> SceneFile:
        file = File(name=file.name, data=file.data, revision_id=revision_id, owner_id=0)
        self.db_session.add(file)
        self.db_session.commit()
        self.db_session.refresh(file)
        return SceneFileWithId(
            id=file.id,
            name=file.name,
            data=file.data,
        )

    def get_scenes(
        self,
        name_filter: str = None,
        from_timestamp: Optional[str] = None,
        limit=10,
    ) -> CursorPage[SceneSummary]:
        # select all scenes and also create a subquery to get the latest revision for each scene
        latest_revision_by_scene_subquery = (
            select(
                SceneRevision,
                Scene,
            )
            .options(defer(SceneRevision.data))
            .join(Scene)
            .distinct(Scene.id)
            .order_by(
                Scene.id,
                SceneRevision.created.desc(),
            )
        )

        if name_filter is not None:
            latest_revision_by_scene_subquery = latest_revision_by_scene_subquery.where(
                Scene.name.ilike(f"%{name_filter}%")
            )

        latest_revision_by_scene_subquery = latest_revision_by_scene_subquery.subquery()

        scene_alias = aliased(Scene, latest_revision_by_scene_subquery, name="scene")
        revision_alias = aliased(
            SceneRevision, latest_revision_by_scene_subquery, name="revision"
        )

        query = select(scene_alias, revision_alias).order_by(scene_alias.created.desc())

        total = self.db_session.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar()

        query = query.limit(limit)
        if from_timestamp is not None:
            # this will basically the offset based on the timestamp (cursor pagination)
            datetime_from_timestamp = datetime.fromisoformat(from_timestamp)
            query = query.where(Scene.created < datetime_from_timestamp)

        results = self.db_session.execute(query).all()

        items: list[SceneSummary] = []
        for row in results:
            scene, revision = row.tuple()
            items.append(
                SceneSummary(
                    id=scene.id,
                    created=scene.created,
                    last_updated=revision.created,
                    revision_id=revision.id,
                    name=scene.name,
                    description=scene.description,
                    picture=revision.picture,
                )
            )

        next_cursor: Optional[str] = None
        if len(items) > 0 and total > limit:
            next_cursor = items[-1].created.isoformat()

        return CursorPage(
            items=items,
            count=len(items),
            limit=limit,
            total=total,
            next_cursor=next_cursor,
        )

    def create_scene_with_revision(
        self, wanted_scene: BaseSceneWithRevision
    ) -> EnrichedSceneWithRevision:
        scene = Scene(
            name=wanted_scene.name, description=wanted_scene.description, owner_id=0
        )
        revision = SceneRevision(
            scene=scene,
            data=wanted_scene.data,
            picture=wanted_scene.picture,
            commiter_id=0,
        )
        self.db_session.add(scene, revision)
        self.db_session.commit()
        self.db_session.refresh(scene)
        self.db_session.refresh(revision)
        return EnrichedSceneWithRevision(
            id=scene.id,
            revision_id=revision.id,
            name=scene.name,
            description=scene.description,
            picture=revision.picture,
            data=revision.data,
        )

    def update_scene(
        self, scene_id: str, wanted_scene: BaseSceneWithRevision
    ) -> EnrichedSceneWithRevision:
        scene = self.db_session.query(Scene).where(Scene.id == scene_id).first()
        if scene is None:
            raise ValueError(f"Scene with id {scene_id} not found")

        revision = SceneRevision(
            scene=scene,
            data=wanted_scene.data,
            picture=wanted_scene.picture,
            commiter_id=0,
        )
        scene.name = wanted_scene.name
        scene.description = wanted_scene.description
        self.db_session.add(revision)
        self.db_session.commit()
        self.db_session.refresh(scene)
        self.db_session.refresh(revision)

        return EnrichedSceneWithRevision(
            id=scene.id,
            revision_id=revision.id,
            name=scene.name,
            description=scene.description,
            picture=revision.picture,
            data=revision.data,
        )

    def delete_scene(self, scene_id: str) -> None:
        scene = self.db_session.query(Scene).where(Scene.id == scene_id).first()
        if scene is None:
            raise ValueError(f"Scene with id {scene_id} not found")

        scene.delete()
        self.db_session.commit()
