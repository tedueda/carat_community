from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

class VisibilityEnum(str, Enum):
    public = "public"
    members = "members"
    followers = "followers"
    private = "private"

class ReactionTypeEnum(str, Enum):
    like = "like"
    love = "love"
    support = "support"
    respect = "respect"

class UserBase(BaseModel):
    email: EmailStr
    display_name: str

class UserCreate(UserBase):
    password: str
    phone_number: Optional[str] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None

class User(UserBase):
    id: int
    membership_type: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    handle: str
    bio: Optional[str] = None
    orientation_id: Optional[int] = 1
    gender_id: Optional[int] = 1
    pronoun_id: Optional[int] = 1
    birthday: Optional[date] = None
    location: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_profile_public: bool = False
    show_orientation: bool = False
    show_gender: bool = False
    show_pronoun: bool = False
    show_birthday: bool = False
    show_location: bool = False

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    handle: Optional[str] = None
    bio: Optional[str] = None
    orientation_id: Optional[int] = None
    gender_id: Optional[int] = None
    pronoun_id: Optional[int] = None
    birthday: Optional[date] = None
    location: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_profile_public: Optional[bool] = None
    show_orientation: Optional[bool] = None
    show_gender: Optional[bool] = None
    show_pronoun: Optional[bool] = None
    show_birthday: Optional[bool] = None
    show_location: Optional[bool] = None

class Profile(ProfileBase):
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PostTypeEnum(str, Enum):
    post = "post"
    blog = "blog"
    tourism = "tourism"

class PostStatusEnum(str, Enum):
    draft = "draft"
    published = "published"

class PostBase(BaseModel):
    title: Optional[str] = None
    body: str
    visibility: VisibilityEnum = VisibilityEnum.public
    youtube_url: Optional[str] = None
    media_id: Optional[int] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    post_type: PostTypeEnum = PostTypeEnum.post
    slug: Optional[str] = None
    status: PostStatusEnum = PostStatusEnum.published
    og_image_url: Optional[str] = None
    excerpt: Optional[str] = None
    # Funding用フィールド
    goal_amount: Optional[int] = 0
    current_amount: Optional[int] = 0
    deadline: Optional[date] = None

class PostTourismDetails(BaseModel):
    prefecture: Optional[str] = None
    event_datetime: Optional[datetime] = None
    meet_place: Optional[str] = None
    meet_address: Optional[str] = None
    tour_content: Optional[str] = None
    fee: Optional[int] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    deadline: Optional[datetime] = None
    attachment_pdf_url: Optional[str] = None

class PostCreate(PostBase):
    media_ids: Optional[List[int]] = None
    tourism_details: Optional[PostTourismDetails] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    visibility: Optional[VisibilityEnum] = None
    youtube_url: Optional[str] = None
    media_id: Optional[int] = None
    media_ids: Optional[List[int]] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    post_type: Optional[PostTypeEnum] = None
    slug: Optional[str] = None
    status: Optional[PostStatusEnum] = None
    og_image_url: Optional[str] = None
    excerpt: Optional[str] = None
    tourism_details: Optional[PostTourismDetails] = None
    # Funding用フィールド
    goal_amount: Optional[int] = None
    current_amount: Optional[int] = None
    deadline: Optional[date] = None

class Post(PostBase):
    id: int
    user_id: int
    media_url: Optional[str] = None
    media_urls: Optional[List[str]] = None
    tourism_details: Optional[PostTourismDetails] = None
    created_at: datetime
    updated_at: datetime
    like_count: Optional[int] = 0
    comment_count: Optional[int] = 0
    user_display_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    body: str
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    post_id: int

class CommentUpdate(BaseModel):
    body: Optional[str] = None

class Comment(CommentBase):
    id: int
    post_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ReactionCreate(BaseModel):
    target_type: str
    target_id: int
    reaction_type: ReactionTypeEnum

class Reaction(BaseModel):
    id: int
    user_id: int
    target_type: str
    target_id: int
    reaction_type: ReactionTypeEnum
    created_at: datetime
    
    class Config:
        from_attributes = True

class FollowCreate(BaseModel):
    followee_user_id: int

class Follow(BaseModel):
    follower_user_id: int
    followee_user_id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool

class Notification(BaseModel):
    id: int
    user_id: int
    type: str
    payload: Optional[dict] = None
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PhoneVerificationRequest(BaseModel):
    phone_number: str

class PhoneVerificationConfirm(BaseModel):
    phone_number: str
    verification_code: str

class UserRegistrationStep1(BaseModel):
    phone_number: str
    email: EmailStr
    password: str
    display_name: str

class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
