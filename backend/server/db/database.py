import os

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base

SQLALCHEMY_DATABASE_URL = os.environ.get("DB_URL")
if SQLALCHEMY_DATABASE_URL is None:
    raise ValueError("DB_URL environment variable must be set")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


Base = declarative_base()
