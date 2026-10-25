from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, AssistantMessage
from app.auth import get_current_user_optional, get_current_user
from app.services.assistant_service import AssistantService
from app.schemas import ChatMessageIn, ChatMessageOut

router = APIRouter(prefix="/api/assistant", tags=["AI Nutrition Assistant"])

@router.post("/chat", response_model=ChatMessageOut)
async def chat_with_assistant(
    chat_in: ChatMessageIn,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not chat_in.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if not current_user:
        current_user = db.query(User).filter(User.is_demo == True).first()
        if not current_user:
            current_user = db.query(User).first()

    # Save user message
    user_msg = AssistantMessage(
        user_id=current_user.id,
        role="user",
        content=chat_in.message.strip(),
        timestamp=datetime.utcnow()
    )
    db.add(user_msg)
    db.commit()

    # Generate assistant grounded response
    result = await AssistantService.generate_response(db, current_user, chat_in.message)

    # Save assistant message
    asst_msg = AssistantMessage(
        user_id=current_user.id,
        role="assistant",
        content=result["content"],
        timestamp=datetime.utcnow()
    )
    db.add(asst_msg)
    db.commit()

    return {
        "role": "assistant",
        "content": result["content"],
        "timestamp": asst_msg.timestamp,
        "suggested_followups": result.get("suggested_followups", [])
    }

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    if not current_user:
        return {"messages": []}

    msgs = db.query(AssistantMessage).filter(
        AssistantMessage.user_id == current_user.id
    ).order_by(AssistantMessage.timestamp.asc()).limit(50).all()

    return {
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp
            } for m in msgs
        ]
    }
