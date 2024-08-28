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

router = APIRouter()


@router.get("/scenes/")
async def get_scenes(
    scene_controller: scene_controller_dependency,
    pagination_params: pagination_params_dependency,
    name_filter: Annotated[str, Query()] = None,
) -> CursorPage[SceneSummary]:
    return await scene_controller.get_scenes(
        name_filter=name_filter,
        limit=pagination_params.limit,
        from_timestamp=pagination_params.cursor,
    )


@router.post("/scenes/")
async def create_scene(
    scene_controller: scene_controller_dependency,
    scene: BaseSceneWithRevision,
) -> EnrichedSceneWithRevision:
    return await scene_controller.create_scene_with_revision(scene)


@router.get("/scenes/{scene_id}")
async def get_scene(
    scene_controller: scene_controller_dependency,
    scene_id: str,
) -> EnrichedSceneWithRevision:
    try:
        return await scene_controller.get_scene_with_latest_revision(scene_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.put("/scenes/{scene_id}")
async def update_scene(
    scene_controller: scene_controller_dependency,
    scene_id: str,
    scene: BaseSceneWithRevision,
) -> EnrichedSceneWithRevision:
    try:
        return await scene_controller.update_scene(scene_id, scene)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.delete("/scenes/{scene_id}")
async def delete_scene(
    scene_controller: scene_controller_dependency,
    scene_id: str,
) -> None:
    try:
        await scene_controller.delete_scene(scene_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="Scene not found")


@router.post("/scene-files/")
async def add_scene_file(
    scene_controller: scene_controller_dependency,
    revision_id: str,
    file: SceneFile,
) -> SceneFileWithId:
    return await scene_controller.add_file_to_scene(revision_id, file)


@router.get("/scene-files/{file_id}")
async def get_scene_file(
    scene_controller: scene_controller_dependency,
    file_id: str,
) -> SceneFileWithId:
    try:
        return await scene_controller.get_scene_file(file_id)

    except ValueError:
        raise HTTPException(status_code=404, detail="File not found")
