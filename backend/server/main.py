import fastapi

from server.api.v1.auth import SECRET, fastapi_users, google_oauth_client, cookie_backend
from server.api.v1.router import v1_app
from server.api.v1.users import UserRead, UserUpdate, UserCreate

app = fastapi.FastAPI()


app.include_router(v1_app, prefix="/api/v1")

app.include_router(
    fastapi_users.get_auth_router(cookie_backend), prefix="/auth/jwt", tags=["auth"]
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
app.include_router(
    fastapi_users.get_oauth_router(google_oauth_client, cookie_backend, SECRET),
    prefix="/auth/google",
    tags=["auth"],
)


@app.get("/")
def hello():
    return "hello"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
