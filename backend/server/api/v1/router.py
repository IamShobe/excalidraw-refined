from fastapi import APIRouter

from . import scenes

v1_app = APIRouter()
v1_app.include_router(scenes.router)
