from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool


class EmbedResponse(BaseModel):
    embedding: list[float] = Field(min_length=512, max_length=512)
    cropped: bool
    detectionScore: float | None = None


class EmbedBatchItem(BaseModel):
    id: int
    imageUrl: str


class EmbedBatchRequest(BaseModel):
    items: list[EmbedBatchItem]


class EmbedBatchResult(BaseModel):
    id: int
    embedding: list[float]
    cropped: bool


class EmbedBatchFailure(BaseModel):
    id: int
    error: str


class EmbedBatchResponse(BaseModel):
    results: list[EmbedBatchResult]
    failures: list[EmbedBatchFailure]
