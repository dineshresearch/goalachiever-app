"""
Pydantic schemas for API request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, Any, Dict

# ==================== Auth Schemas ====================
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==================== Goal Schemas ====================
class GoalCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, description="Detailed description of the goal")
    total_days: int = Field(..., ge=1, le=365)
    start_date: Optional[str] = Field(None)

class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    total_days: int
    start_date: Any
    created_at: datetime
    class Config:
        from_attributes = True

# ==================== Day Plan Schemas ====================
class DayPlanResponse(BaseModel):
    id: str
    goal_id: str
    day_number: int
    date: Any
    topic: Optional[str] = None
    content: Optional[Dict] = None
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    dynamic: Optional[bool] = False
    class Config:
        from_attributes = True

class DayPlanUpdateRequest(BaseModel):
    completed: Optional[bool] = None

# ==================== Note Schemas ====================
class NoteCreateRequest(BaseModel):
    content: str = Field(..., min_length=1)

class NoteResponse(BaseModel):
    id: str
    day_plan_id: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# ==================== Chat Schemas ====================
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    history: Optional[list] = []
    context_topic: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: str

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    context_topic: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatMessageResponse]
