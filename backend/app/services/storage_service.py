import asyncio
import os
import uuid

import httpx
import boto3
from botocore.config import Config

R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY")
R2_BUCKET = os.getenv("R2_BUCKET", "lumera-media")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "https://pub-17942d0d8c344adba336bffbba501af9.r2.dev")

STREAM_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "d880f24bbaf1e775a6d1c971dbecef54")
STREAM_API_TOKEN = os.getenv("CLOUDFLARE_STREAM_TOKEN")

_CLOUDFLARE_READY = bool(R2_ENDPOINT and R2_ACCESS_KEY_ID and STREAM_API_TOKEN)

IMAGE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _r2_client():
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _put_r2(content: bytes, key: str, content_type: str) -> str:
    _r2_client().put_object(
        Bucket=R2_BUCKET,
        Key=key,
        Body=content,
        ContentType=content_type,
    )
    return f"{R2_PUBLIC_URL}/{key}"


async def upload_image(content: bytes, content_type: str) -> str:
    ext = IMAGE_EXTENSIONS.get(content_type, ".jpg")
    key = f"{uuid.uuid4()}{ext}"
    return await asyncio.to_thread(_put_r2, content, key, content_type)


async def upload_video(content: bytes, original_filename: str) -> str:
    async with httpx.AsyncClient(timeout=600.0) as client:
        resp = await client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{STREAM_ACCOUNT_ID}/stream",
            headers={"Authorization": f"Bearer {STREAM_API_TOKEN}"},
            files={"file": (original_filename, content, "video/mp4")},
        )
        resp.raise_for_status()
        video_id = resp.json()["result"]["uid"]
        return f"https://iframe.cloudflarestream.com/{video_id}"


def cloudflare_ready() -> bool:
    return _CLOUDFLARE_READY
