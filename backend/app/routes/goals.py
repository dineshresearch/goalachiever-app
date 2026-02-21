"""
Goal routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from app.database import get_db
from app.models import User, Goal, DayPlan
from app.schemas import GoalCreateRequest, GoalResponse
from app.auth import get_current_user
from app.services.ai_generator import AIPlanGenerator

router = APIRouter()
ai_generator = AIPlanGenerator()

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new goal and generate the daily outline.
    """
    start_date = date.fromisoformat(goal_data.start_date) if goal_data.start_date else date.today()
    
    new_goal = Goal(
        user_id=current_user.id,
        title=goal_data.title,
        description=goal_data.description,
        total_days=goal_data.total_days,
        start_date=start_date
    )
    
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    # Generate daily outline
    topics = []
    if goal_data.use_ai:
        try:
            topics = await ai_generator.generate_goal_outline(new_goal.title, new_goal.description, new_goal.total_days)
        except Exception as e:
            print(f"Goal outline generation failed: {e}")

    # Fallback to defaults
    if not topics or len(topics) < new_goal.total_days:
        topics = [f"Daily progress for {new_goal.title}" for i in range(new_goal.total_days)]

    for i in range(new_goal.total_days):
        day_date = start_date + timedelta(days=i)
        topic = topics[i]
        
        day_plan = DayPlan(
            goal_id=new_goal.id,
            day_number=i + 1,
            date=day_date,
            topic=topic,
            content=None,
            completed=False
        )
        db.add(day_plan)
        
    db.commit()
    return new_goal

@router.get("", response_model=list[GoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all goals for current user"""
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.created_at.desc()).all()
    return goals
