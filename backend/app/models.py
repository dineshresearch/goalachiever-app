"""
SQLAlchemy database models
Supports both PostgreSQL (UUID, JSONB) and SQLite (String, JSON) backends.
"""
import uuid
import json
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Date, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.config import settings

# Use simple String UUIDs for SQLite compatibility
IS_SQLITE = settings.DATABASE_URL.startswith("sqlite")


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(email='{self.email}')>"


class Goal(Base):
    """Goal model representing a user's learning goal"""
    __tablename__ = "goals"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    total_days = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    day_plans = relationship("DayPlan", back_populates="goal", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Goal(title='{self.title}', days={self.total_days})>"


class DayPlan(Base):
    """Daily plan with DSA, System Design, and GenAI content"""
    __tablename__ = "day_plans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    goal_id = Column(String(36), ForeignKey("goals.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True)
    
    # JSON content for each section
    dsa = Column(JSON, nullable=True)
    system_design = Column(JSON, nullable=True)
    genai = Column(JSON, nullable=True)
    
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    goal = relationship("Goal", back_populates="day_plans")
    notes = relationship("Note", back_populates="day_plan", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DayPlan(date='{self.date}', day={self.day_number})>"


class Note(Base):
    """User notes for a specific day"""
    __tablename__ = "notes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    day_plan_id = Column(String(36), ForeignKey("day_plans.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    day_plan = relationship("DayPlan", back_populates="notes")
    
    def __repr__(self):
        return f"<Note(id={self.id})>"


class ChatMessage(Base):
    """Chat messages for interactive LLM practice"""
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    session_id = Column(String(36), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    context_topic = Column(String(200), nullable=True)  # e.g. "DSA: Two Sum"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")
    
    def __repr__(self):
        return f"<ChatMessage(role='{self.role}', session='{self.session_id}')>"
