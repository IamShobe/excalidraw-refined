from fastapi import APIRouter

from . import scenes
from . import auth

v1_app = APIRouter()
v1_app.include_router(scenes.router)
v1_app.include_router(auth.router)
