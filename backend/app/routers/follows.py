from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Follow
from app.schemas import Follow as FollowSchema, FollowCreate
from app.auth import get_current_active_user

router = APIRouter(prefix="/api/follows", tags=["follows"])

@router.post("/", response_model=FollowSchema)
async def create_follow(
    follow: FollowCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if follow.followee_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    existing_follow = db.query(Follow).filter(
        Follow.follower_user_id == current_user.id,
        Follow.followee_user_id == follow.followee_user_id
    ).first()
    
    if existing_follow:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    db_follow = Follow(
        follower_user_id=current_user.id,
        followee_user_id=follow.followee_user_id,
        status="accepted"
    )
    db.add(db_follow)
    db.commit()
    db.refresh(db_follow)
    
    return db_follow

@router.delete("/{followee_user_id}")
async def unfollow_user(
    followee_user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    follow = db.query(Follow).filter(
        Follow.follower_user_id == current_user.id,
        Follow.followee_user_id == followee_user_id
    ).first()
    
    if follow is None:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    db.delete(follow)
    db.commit()
    return {"message": "Unfollowed successfully"}

@router.get("/followers", response_model=List[FollowSchema])
async def get_followers(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    followers = db.query(Follow).filter(
        Follow.followee_user_id == current_user.id,
        Follow.status == "accepted"
    ).all()
    return followers

@router.get("/following", response_model=List[FollowSchema])
async def get_following(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    following = db.query(Follow).filter(
        Follow.follower_user_id == current_user.id,
        Follow.status == "accepted"
    ).all()
    return following
