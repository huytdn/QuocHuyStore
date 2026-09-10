import logging
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager

import requests
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.security import APIKeyHeader

from app import pipeline
from app.config import get_settings
from app.schemas import (
    EmbedBatchFailure,
    EmbedBatchRequest,
    EmbedBatchResponse,
    EmbedBatchResult,
    EmbedResponse,
    HealthResponse,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service.main")

_api_key_header = APIKeyHeader(name="X-Api-Key", auto_error=False)


@asynccontextmanager
async def lifespan(app: FastAPI):
    pipeline.load_models()
    yield


app = FastAPI(title="QuocHuyStore AI Image Search Service", lifespan=lifespan)


def require_api_key(provided_key: str | None = Depends(_api_key_header)) -> None:
    settings = get_settings()
    if provided_key != settings.api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API key")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", modelLoaded=pipeline.is_ready())


@app.post("/embed", response_model=EmbedResponse, dependencies=[Depends(require_api_key)])
def embed(file: UploadFile = File(...)) -> EmbedResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    raw_bytes = file.file.read()
    if not raw_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")

    try:
        embedding, cropped, detection_score = pipeline.embed_image_bytes(raw_bytes)
    except Exception as exc:
        logger.error("Failed to embed uploaded image: %s", exc)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Failed to process image")

    return EmbedResponse(embedding=embedding, cropped=cropped, detectionScore=detection_score)


@app.post("/embed-batch", response_model=EmbedBatchResponse, dependencies=[Depends(require_api_key)])
def embed_batch(request: EmbedBatchRequest) -> EmbedBatchResponse:
    settings = get_settings()
    results: list[EmbedBatchResult] = []
    failures: list[EmbedBatchFailure] = []

    if not request.items:
        return EmbedBatchResponse(results=[], failures=[])

    def fetch_image(item):
        try:
            resp = requests.get(item.imageUrl, timeout=min(settings.request_timeout_seconds, 6))
            resp.raise_for_status()
            return item, resp.content, None
        except Exception as exc:
            return item, None, exc

    max_workers = min(len(request.items), 8)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        downloaded = list(executor.map(fetch_image, request.items))

    for item, content, exc in downloaded:
        if exc is not None or not content:
            logger.warning("Failed to download batch item id=%s: %s", item.id, exc)
            failures.append(EmbedBatchFailure(id=item.id, error=str(exc)))
            continue

        try:
            embedding, cropped, _ = pipeline.embed_image_bytes(content)
            results.append(EmbedBatchResult(id=item.id, embedding=embedding, cropped=cropped))
        except Exception as exc:
            logger.warning("Failed to embed batch item id=%s: %s", item.id, exc)
            failures.append(EmbedBatchFailure(id=item.id, error=str(exc)))

    return EmbedBatchResponse(results=results, failures=failures)
