from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user, get_current_active_admin as get_current_admin
from app.models import models
from app.schemas import message as message_schema
from datetime import datetime
import json
from urllib.parse import unquote

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {} # user_id -> list of websockets
        self.admin_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int = None, is_admin: bool = False):
        await websocket.accept()
        if is_admin:
            self.admin_connections.append(websocket)
        elif user_id:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = []
            self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int = None, is_admin: bool = False):
        if is_admin:
            if websocket in self.admin_connections:
                self.admin_connections.remove(websocket)
        elif user_id and user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

    async def broadcast_to_admins(self, message: dict):
        for connection in self.admin_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@router.get("/history/{user_id}", response_model=List[message_schema.Message])
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = db.query(models.Message).filter(models.Message.user_id == user_id).order_by(models.Message.timestamp.asc()).all()
    return messages

@router.get("/conversations", response_model=List[message_schema.ConversationSummary])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    from sqlalchemy import func
    users_with_messages = db.query(models.User).join(models.Message, models.User.id == models.Message.user_id).distinct().all()
    
    summaries = []
    for user in users_with_messages:
        last_msg = db.query(models.Message).filter(models.Message.user_id == user.id).order_by(models.Message.timestamp.desc()).first()
        unread_count = db.query(models.Message).filter(
            models.Message.user_id == user.id, 
            models.Message.is_read == False,
            models.Message.sender == "user"
        ).count()
        
        summaries.append({
            "user_id": user.id,
            "user_name": user.name or user.email,
            "last_message": last_msg.message if last_msg else None,
            "timestamp": last_msg.timestamp if last_msg else datetime.utcnow(),
            "is_read": unread_count == 0,
            "unread_count": unread_count
        })
    
    summaries.sort(key=lambda x: x["timestamp"], reverse=True)
    return summaries

@router.post("/read/{user_id}")
def mark_as_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_admin)
):
    db.query(models.Message).filter(
        models.Message.user_id == user_id,
        models.Message.sender == "user",
        models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success"}

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    token = unquote(token)
    try:
        if ":" in token:
            user_id_str, role = token.split(":")
            user_id = int(user_id_str)
            is_admin = role == "admin"
        else:
            user_id = int(token)
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if not user:
                await websocket.close(code=1008)
                return
            is_admin = user.role == "admin"
    except Exception as e:
        print(f"WS Auth Error: {e}")
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id, is_admin)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            target_user_id = message_data.get("target_user_id") if is_admin else user_id
            
            db_msg = models.Message(
                user_id=target_user_id,
                message=message_data.get("message"),
                attachment_2d=message_data.get("attachment_2d"),
                attachment_3d=message_data.get("attachment_3d"),
                sender="admin" if is_admin else "user",
                timestamp=datetime.utcnow(),
                is_read=False
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)
            
            msg_to_send = {
                "id": db_msg.id,
                "user_id": db_msg.user_id,
                "message": db_msg.message,
                "attachment_2d": db_msg.attachment_2d,
                "attachment_3d": db_msg.attachment_3d,
                "sender": db_msg.sender,
                "timestamp": db_msg.timestamp.isoformat(),
                "is_read": db_msg.is_read
            }
            
            if is_admin:
                await manager.send_personal_message(msg_to_send, target_user_id)
                await manager.broadcast_to_admins(msg_to_send)
            else:
                await manager.broadcast_to_admins(msg_to_send)
                await manager.send_personal_message(msg_to_send, user_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id, is_admin)
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket, user_id, is_admin)
