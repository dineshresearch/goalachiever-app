"""
Chat routes - Interactive LLM-based practice conversations
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ChatMessage
from app.schemas import ChatRequest, ChatResponse, ChatHistoryResponse, ChatMessageResponse
from app.auth import get_current_user
from app.services.ai_generator import AIPlanGenerator

router = APIRouter()

# Shared AI instance
_ai = AIPlanGenerator()


@router.post("", response_model=ChatResponse)
async def send_chat_message(
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to the AI tutor and get an interactive response.
    Supports context-aware conversations about DSA, System Design, and GenAI.
    """
    session_id = chat_data.session_id or str(uuid.uuid4())

    # Load recent conversation history for context (last 10 messages)
    history = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()

    history.reverse()  # chronological order

    # Build conversation context
    conversation_parts = []
    for msg in history:
        conversation_parts.append(f"{'User' if msg.role == 'user' else 'Assistant'}: {msg.content}")
    conversation_parts.append(f"User: {chat_data.message}")
    conversation_text = "\n".join(conversation_parts)

    # Build prompt
    context_hint = ""
    if chat_data.context_topic:
        context_hint = f"\nThe user is currently studying: {chat_data.context_topic}. Tailor your response to this topic."

    prompt = f"""You are an expert AI tutor specializing in technical interview preparation covering Data Structures & Algorithms (DSA), System Design, and Generative AI.

Your role:
- Explain concepts clearly with examples
- When asked about DSA, provide Python code solutions with step-by-step explanations
- When asked about System Design, discuss architecture, tradeoffs, and scalability
- When asked about GenAI, explain LLM concepts, transformers, RAG, fine-tuning, etc.
- Give constructive feedback on the user's answers
- Ask follow-up questions to deepen understanding
- Keep responses concise but thorough
- Use code blocks for any code snippets{context_hint}

Conversation so far:
{conversation_text}

Provide a helpful, encouraging response as the AI tutor:"""

    try:
        reply = await _ai._call_gemini_api(prompt)
    except Exception as e:
        print(f"Chat AI failed: {e}")
        reply = "I'm having trouble connecting to the AI service right now. Please try again in a moment."

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        content=chat_data.message,
        context_topic=chat_data.context_topic
    )
    db.add(user_msg)

    # Save assistant reply
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        session_id=session_id,
        role="assistant",
        content=reply,
        context_topic=chat_data.context_topic
    )
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(reply=reply, session_id=session_id)


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for a session"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[ChatMessageResponse.model_validate(m) for m in messages]
    )


@router.get("/sessions", response_model=list[dict])
async def list_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all chat sessions for the current user"""
    from sqlalchemy import func, distinct

    sessions = db.query(
        ChatMessage.session_id,
        ChatMessage.context_topic,
        func.min(ChatMessage.created_at).label("started_at"),
        func.count(ChatMessage.id).label("message_count")
    ).filter(
        ChatMessage.user_id == current_user.id
    ).group_by(
        ChatMessage.session_id, ChatMessage.context_topic
    ).order_by(
        func.max(ChatMessage.created_at).desc()
    ).limit(20).all()

    return [
        {
            "session_id": s.session_id,
            "context_topic": s.context_topic,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "message_count": s.message_count
        }
        for s in sessions
    ]
