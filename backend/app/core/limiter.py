from slowapi import Limiter
from starlette.requests import Request


def _get_real_ip(request: Request) -> str:
    """Returns the real client IP, using CF-Connecting-IP when behind Cloudflare."""
    return (
        request.headers.get("CF-Connecting-IP")
        or (request.client.host if request.client else "unknown")
    )


limiter = Limiter(key_func=_get_real_ip)
