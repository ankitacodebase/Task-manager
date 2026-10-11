from slowapi import Limiter
from slowapi.util import get_remote_address

# Sliding-window rate limiter utilizing client IP address as key
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000/minute"],
    headers_enabled=True,
    storage_uri="memory://",
)
