import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("taskflow.websocket")

class ConnectionManager:
    def __init__(self):
        # tenant_id -> set of active WebSocket instances
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(self, tenant_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self._lock:
            if tenant_id not in self.active_connections:
                self.active_connections[tenant_id] = set()
            self.active_connections[tenant_id].add(websocket)
        logger.info(f"WebSocket client connected to tenant {tenant_id}. Total connections: {len(self.active_connections[tenant_id])}")

    async def disconnect(self, tenant_id: str, websocket: WebSocket):
        async with self._lock:
            if tenant_id in self.active_connections:
                self.active_connections[tenant_id].discard(websocket)
                if not self.active_connections[tenant_id]:
                    del self.active_connections[tenant_id]
        logger.info(f"WebSocket client disconnected from tenant {tenant_id}")

    async def broadcast_to_tenant(self, tenant_id: str, message: dict):
        if tenant_id not in self.active_connections:
            return
        payload = json.dumps(message)
        dead_sockets = set()
        sockets = list(self.active_connections.get(tenant_id, []))
        for connection in sockets:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message over WebSocket: {e}")
                dead_sockets.add(connection)
        
        if dead_sockets:
            async with self._lock:
                if tenant_id in self.active_connections:
                    self.active_connections[tenant_id].difference_update(dead_sockets)

ws_manager = ConnectionManager()
