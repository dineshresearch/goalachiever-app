"""
SQLAlchemy database models
Supports both PostgreSQL (UUID, JSONB) and SQLite (String, JSON) backends.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, Date, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base
from app.config import settings

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    total_days = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="goals")
    day_plans = relationship("DayPlan", back_populates="goal", cascade="all, delete-orphan")

class DayPlan(Base):
    __tablename__ = "day_plans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    goal_id = Column(String(36), ForeignKey("goals.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True)
    
    topic = Column(String, nullable=True) # High level topic for the day
    content = Column(JSON, nullable=True) # Detailed AI generated content for the day
    
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    goal = relationship("Goal", back_populates="day_plans")
    notes = relationship("Note", back_populates="day_plan", cascade="all, delete-orphan")

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    day_plan_id = Column(String(36), ForeignKey("day_plans.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    day_plan = relationship("DayPlan", back_populates="notes")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    session_id = Column(String(36), nullable=False, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    context_topic = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    user = relationship("User", back_populates="chat_messages")
