from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from server.api.dependencies import (
    pagination_params_dependency,
    scene_controller_dependency,
)
from server.controllers.scenes import (
    BaseSceneWithRevision,
    CursorPage,
    EnrichedSceneWithRevision,
    SceneFile,
    SceneFileWithId,
    SceneSummary,
)

from .auth import user_dependency

router = APIRouter()


@router.get("/scenes/")
async def get_scenes(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    pagination_params: pagination_params_dependency,
    name_filter: Annotated[str, Query()] = None,
) -> CursorPage[SceneSummary]:
    return await scene_controller.get_scenes(
        user=user,
        name_filter=name_filter,
        limit=pagination_params.limit,
        from_timestamp=pagination_params.cursor,
    )


@router.post("/scenes/")
async def create_scene(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    scene: BaseSceneWithRevision,
) -> EnrichedSceneWithRevision:
    return await scene_controller.create_scene_with_revision(user, scene)


@router.get("/scenes/{scene_id}")
async def get_scene(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    scene_id: str,
) -> EnrichedSceneWithRevision:
    try:
        return await scene_controller.get_scene_with_latest_revision(user, scene_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.put("/scenes/{scene_id}")
async def update_scene(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    scene_id: str,
    scene: BaseSceneWithRevision,
) -> EnrichedSceneWithRevision:
    try:
        return await scene_controller.update_scene(user, scene_id, scene)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.delete("/scenes/{scene_id}")
async def delete_scene(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    scene_id: str,
) -> None:
    try:
        await scene_controller.delete_scene(user, scene_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.post("/scene-files/")
async def add_scene_file(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    revision_id: str,
    file: SceneFile,
) -> SceneFileWithId:
    return await scene_controller.add_file_to_scene(user, revision_id, file)


@router.get("/scene-files/{file_id}")
async def get_scene_file(
    user: user_dependency,
    scene_controller: scene_controller_dependency,
    file_id: str,
) -> SceneFileWithId:
    try:
        return await scene_controller.get_scene_file(user, file_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
