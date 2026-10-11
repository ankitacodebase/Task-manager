import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token
from app.core.ws_manager import ws_manager

from typing import Optional

logger = logging.getLogger("taskflow.websocket")
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    # Allow token from query param or HttpOnly cookie
    auth_token = token or websocket.cookies.get("access_token")
    if not auth_token:
        logger.warning("WebSocket connection attempted without token or cookie.")
        await websocket.close(code=1008)
        return

    try:
        payload = decode_token(auth_token)
        tenant_id = payload.get("tid")
        user_id = payload.get("sub")
        if not tenant_id or not user_id:
            await websocket.close(code=1008)
            return
    except Exception as e:
        logger.warning(f"WebSocket auth failed: {e}")
        await websocket.close(code=1008)
        return

    await ws_manager.connect(tenant_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(tenant_id, websocket)
    except Exception as e:
        logger.debug(f"WebSocket disconnected: {e}")
        await ws_manager.disconnect(tenant_id, websocket)
