import io
import logging
import threading

import numpy as np
import torch
from PIL import Image
from transformers import CLIPModel, CLIPProcessor
from ultralytics import YOLO

from app.config import get_settings

logger = logging.getLogger("ai-service.pipeline")

_PERSON_CLASS_ID = 0
_EMBEDDING_DIM = 512

_lock = threading.Lock()
_yolo_model: YOLO | None = None
_clip_model: CLIPModel | None = None
_clip_processor: CLIPProcessor | None = None


def load_models() -> None:
    """Load YOLOv8n (detection) and CLIP ViT-B/32 (embedding) once at startup."""
    global _yolo_model, _clip_model, _clip_processor

    settings = get_settings()
    torch.set_num_threads(settings.torch_threads)

    logger.info("Loading YOLOv8n detection model")
    _yolo_model = YOLO("yolov8n.pt")

    logger.info("Loading fashion-clip embedding model")
    _clip_model = CLIPModel.from_pretrained("patrickjohncyh/fashion-clip")
    _clip_model.eval()
    _clip_processor = CLIPProcessor.from_pretrained("patrickjohncyh/fashion-clip")

    logger.info("Model loading complete")


def is_ready() -> bool:
    return _yolo_model is not None and _clip_model is not None and _clip_processor is not None


def _downscale(image: Image.Image, max_side: int) -> Image.Image:
    width, height = image.size
    longest = max(width, height)
    if longest <= max_side:
        return image
    scale = max_side / longest
    return image.resize((max(1, int(width * scale)), max(1, int(height * scale))), Image.LANCZOS)


def _detect_and_crop(image: Image.Image) -> tuple[Image.Image, bool, float | None]:
    settings = get_settings()
    results = _yolo_model.predict(
        source=image,
        classes=[_PERSON_CLASS_ID],
        conf=settings.detection_confidence,
        verbose=False,
    )

    boxes = results[0].boxes
    if boxes is None or len(boxes) == 0:
        return image, False, None

    confidences = boxes.conf.tolist()
    best_index = int(np.argmax(confidences))
    best_score = float(confidences[best_index])
    x1, y1, x2, y2 = boxes.xyxy[best_index].tolist()

    width, height = image.size
    box_width = x2 - x1
    box_height = y2 - y1
    pad_x = box_width * settings.detection_padding_ratio
    pad_y = box_height * settings.detection_padding_ratio

    x1 = max(0, int(x1 - pad_x))
    y1 = max(0, int(y1 - pad_y))
    x2 = min(width, int(x2 + pad_x))
    y2 = min(height, int(y2 + pad_y))

    if x2 <= x1 or y2 <= y1:
        return image, False, None

    return image.crop((x1, y1, x2, y2)), True, best_score


def _embed(image: Image.Image) -> list[float]:
    inputs = _clip_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = _clip_model.get_image_features(**inputs)
    vector = features[0].numpy()
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return vector.astype(float).tolist()


def embed_image_bytes(raw_bytes: bytes) -> tuple[list[float], bool, float | None]:
    """Detect and crop the garment, then compute an L2-normalized CLIP embedding."""
    settings = get_settings()
    image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    image = _downscale(image, settings.max_image_side)

    with _lock:
        cropped_image, was_cropped, detection_score = _detect_and_crop(image)
        embedding = _embed(cropped_image)

    if len(embedding) != _EMBEDDING_DIM:
        raise ValueError(f"Expected {_EMBEDDING_DIM}-dim embedding, got {len(embedding)}")

    return embedding, was_cropped, detection_score
