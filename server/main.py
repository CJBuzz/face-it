from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database.database import ResponseMessage
from database.imgfs import init_img_filesystem
from routers import FRroutes

@asynccontextmanager
async def lifespan(app:FastAPI):
    """
    Lifespan events:
    - Anything before yield is code to be executed before app starts receiving requests
    - Anything after yield is code to be executed after app shuts down
    """

    #initialize SQLite database
    init_img_filesystem()
    yield

app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PATCH', 'DELETE'],
    allow_headers=['*']
)

app.include_router(FRroutes.router)

@app.get("/health", status_code=status.HTTP_200_OK)
async def health() -> ResponseMessage:
    return ResponseMessage(
        type='info',
        message='Health ok'
    )