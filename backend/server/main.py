import fastapi


from server.api.v1.router import v1_app

app = fastapi.FastAPI()


app.include_router(v1_app, prefix="/api/v1")


@app.get("/")
def hello():
    return "hello"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
