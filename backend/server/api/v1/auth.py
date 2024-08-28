import uuid
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPBearer
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    Transport,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from httpx_oauth.clients.google import GoogleOAuth2
from pydantic_settings import BaseSettings, SettingsConfigDict

from server.api.dependencies import get_user_db
from server.db.models import User


class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    google_client_id: str
    google_client_secret: str
    jwt_secret: str


settings = AuthSettings()

SECRET = settings.jwt_secret

google_oauth_client = GoogleOAuth2(
    settings.google_client_id, settings.google_client_secret
)


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


class HTTPBearerScheme(HTTPBearer):
    async def __call__(self, request: Request):
        token = await super().__call__(request)
        if token is None:
            return None

        return token.credentials


class BearerTokenOnlyTransport(Transport):
    scheme: HTTPBearerScheme

    def __init__(self):
        self.scheme = HTTPBearerScheme()


bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
# this was added only for interactive docs
token_only_transport = BearerTokenOnlyTransport()


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

auth_backend2 = AuthenticationBackend(
    name="token_only",
    transport=token_only_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager, [auth_backend, auth_backend2]
)

current_active_user = fastapi_users.current_user(active=True)


router = APIRouter()

user_dependency = Annotated[User, Depends(current_active_user)]


@router.get("/protected")
async def protected(user: user_dependency):
    return user
