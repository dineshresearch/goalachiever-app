"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, Any


# ==================== Auth Schemas ====================

class UserRegisterRequest(BaseModel):
    """Request schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLoginRequest(BaseModel):
    """Request schema for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response schema for user data"""
    id: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response schema for JWT token"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== Goal Schemas ====================

class GoalCreateRequest(BaseModel):
    """Request schema for creating a goal"""
    title: str = Field(..., min_length=1, max_length=200)
    total_days: int = Field(..., ge=1, le=365, description="Number of days (1-365)")
    start_date: Optional[str] = Field(None, description="Start date (YYYY-MM-DD), defaults to today")
    focuses: Optional[list[str]] = Field(["dsa", "system_design", "genai"], description="Focus areas")
    use_ai: bool = Field(False, description="Use AI for plan generation")


class GoalResponse(BaseModel):
    """Response schema for goal data"""
    id: str
    user_id: str
    title: str
    total_days: int
    start_date: Any  # date or datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Day Plan Schemas ====================

class DSAContent(BaseModel):
    """DSA problem content"""
    problem: str
    difficulty: str
    solution: Optional[str] = None
    explanation: Optional[str] = None


class SystemDesignContent(BaseModel):
    """System design topic content"""
    topic: str
    notes: Optional[str] = None
    tradeoffs: Optional[list[str]] = None


class GenAIContent(BaseModel):
    """Generative AI question content"""
    question: str
    answer: Optional[str] = None
    resources: Optional[list[str]] = None


class DayPlanResponse(BaseModel):
    """Response schema for day plan"""
    id: str
    goal_id: str
    day_number: int
    date: Any  # date or datetime
    dsa: Optional[dict] = None
    system_design: Optional[dict] = None
    genai: Optional[dict] = None
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DayPlanUpdateRequest(BaseModel):
    """Request schema for updating a day plan"""
    completed: Optional[bool] = None


# ==================== Note Schemas ====================

class NoteCreateRequest(BaseModel):
    """Request schema for creating a note"""
    content: str = Field(..., min_length=1)


class NoteResponse(BaseModel):
    """Response schema for note data"""
    id: str
    day_plan_id: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ==================== Chat Schemas ====================

class ChatRequest(BaseModel):
    """Request schema for sending a chat message"""
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    context_topic: Optional[str] = None  # e.g. "DSA: Two Sum"

class ChatResponse(BaseModel):
    """Response schema for a chat reply"""
    reply: str
    session_id: str

class ChatMessageResponse(BaseModel):
    """Response schema for a stored chat message"""
    id: str
    role: str
    content: str
    context_topic: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    """Response schema for chat history"""
    session_id: str
    messages: list[ChatMessageResponse]
