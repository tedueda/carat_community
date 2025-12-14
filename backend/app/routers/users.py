from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Post
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/{user_id}")
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user information by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "membership_type": user.membership_type,
        "carats": user.carats or 0,
        "created_at": user.created_at
    }

@router.get("/me/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user statistics including carat points"""
    
    # Count posts created by user
    posts_count = db.query(Post).filter(Post.user_id == current_user.id).count()
    
    # Count likes received on user's posts
    from app.models import Reaction
    likes_received = db.query(func.count(Reaction.id)).join(
        Post, Reaction.target_id == Post.id
    ).filter(
        Post.user_id == current_user.id,
        Reaction.target_type == 'post',
        Reaction.reaction_type == 'like'
    ).scalar() or 0
    
    # Calculate total carat points: 1pt per like + 5pt per post
    total_points = likes_received + (posts_count * 5)
    
    return {
        "posts_count": posts_count,
        "likes_received": likes_received,
        "total_points": total_points
    }
