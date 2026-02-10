import json
import redis.asyncio as redis
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.from_url("redis://localhost:6379", decode_responses=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    def disconnect(self, websocket: WebSocket, room: str):
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)

    async def broadcast(self, message: dict, room: str):
        message['timestamp'] = time.time()
        print(message)
        msg_key = f"chat_msg:{room}:{message['timestamp']}"
        await r.setex(msg_key, message['seconds'], json.dumps(message))
        
        if room in self.active_connections:
            for connection in self.active_connections[room]:
                await connection.send_json(message)



manager = ConnectionManager()

@app.get("/rooms")
async def get_rooms():
    rooms = await r.smembers("chat_rooms")
    return list(rooms)

@app.post("/rooms/{room}")
async def create_room(room: str):
    await r.sadd("chat_rooms", room)
    return {"room": room}

@app.delete("/rooms/{room}")
async def delete_room(room: str):
    await r.srem("chat_rooms", room)
    keys = await r.keys(f"chat_msg:{room}:*")
    if keys:
        await r.delete(*keys)
    return {"deleted": room}

@app.get("/history/{room}")
async def get_history(room: str):
    keys = await r.keys(f"chat_msg:{room}:*")
    messages = []
    for key in keys:
        msg = await r.get(key)
        if msg:
            messages.append(json.loads(msg))
    return sorted(messages, key=lambda x: x['timestamp'])

@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    await manager.connect(websocket, room)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data, room)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)
