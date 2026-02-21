"""
Day Plan routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List
import uuid

from app.database import get_db
from app.models import User, Goal, DayPlan, Note, ChatMessage
from app.schemas import DayPlanResponse, DayPlanUpdateRequest, NoteCreateRequest, NoteResponse
from app.auth import get_current_user
from app.services.ai_generator import AIPlanGenerator

router = APIRouter()
ai_generator = AIPlanGenerator()

@router.get("/date/{plan_date}", response_model=DayPlanResponse)
async def get_plan_by_date(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        target_date = date.fromisoformat(plan_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )

    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.date == target_date,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No plan found for date {plan_date}"
        )

    return plan

@router.get("/date/{plan_date}/dynamic", response_model=DayPlanResponse)
async def get_dynamic_plan_content(
    plan_date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get day plan. LLM content is now pre-generated at Goal Creation, 
    so this just fetches the DB record.
    """
    try:
        target_date = date.fromisoformat(plan_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format"
        )

    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.date == target_date,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No plan found for date {plan_date}"
        )

    result = {
        "id": plan.id,
        "goal_id": plan.goal_id,
        "day_number": plan.day_number,
        "date": str(plan.date),
        "topic": plan.topic,
        "content": plan.content,
        "completed": plan.completed,
        "completed_at": plan.completed_at,
        "created_at": plan.created_at,
        "dynamic": bool(plan.content)
    }
    
    return result

@router.post("/{plan_id}/complete", response_model=DayPlanResponse)
async def mark_plan_complete(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.id == plan_id,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan.completed = True
    plan.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(plan)
    
    return plan

@router.post("/{plan_id}/notes", response_model=NoteResponse)
async def add_note(
    plan_id: str,
    note_data: NoteCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.id == plan_id,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    note = Note(
        day_plan_id=plan.id,
        content=note_data.content
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return note

@router.get("/{plan_id}/notes", response_model=List[NoteResponse])
async def get_notes(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.id == plan_id,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    return plan.notes

@router.post("/{plan_id}/topic-chat")
async def plan_topic_chat(
    plan_id: str,
    chat_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Contextual chat within a day plan for doubt clarification."""
    plan = db.query(DayPlan).join(DayPlan.goal).filter(
        DayPlan.id == plan_id,
        Goal.user_id == current_user.id
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    message = chat_data.get("message", "")
    history = chat_data.get("history", [])

    if not message.strip():
        raise HTTPException(status_code=400, detail="Empty message")

    goal = db.query(Goal).filter(Goal.id == plan.goal_id).first()

    context_parts = [
        f"Goal: {goal.title}",
        f"Today is Day {plan.day_number}.",
        f"Topic: {plan.topic}"
    ]
    if plan.content:
        context_parts.append(f"Content: {plan.content}")

    plan_context = "\\n".join(context_parts)

    conv_parts = [f"{'User' if m.get('role') == 'user' else 'Assistant'}: {m.get('content')}" for m in history[-10:]]
    conv_parts.append(f"User: {message}")
    conversation_text = "\\n".join(conv_parts)

    prompt = f"""You are an expert AI coach helping a user with their goal.{' (e.g., losing weight, learning skills, etc.)'}
Context for today:
{plan_context}

Your role:
- Answer doubts related to today's topic and content.
- Be encouraging, practical, and clear.
- Use markdown formatting.

Conversation:
{conversation_text}

Provide a helpful response:"""

    try:
        reply = await ai_generator._call_gemini_api(prompt)
    except Exception as e:
        print(f"Topic chat failed: {e}")
        reply = "I'm having trouble connecting right now."

    session_id = chat_data.get("session_id", str(uuid.uuid4()))
    
    # Save the conversation
    db.add(ChatMessage(user_id=current_user.id, session_id=session_id, role="user", content=message, context_topic=plan.topic))
    db.add(ChatMessage(user_id=current_user.id, session_id=session_id, role="assistant", content=reply, context_topic=plan.topic))
    db.commit()

    return {"reply": reply, "session_id": session_id}
