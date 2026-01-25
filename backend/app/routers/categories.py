from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Category, Subcategory
from pydantic import BaseModel

router = APIRouter(prefix="/api/categories", tags=["categories"])


# === Pydantic スキーマ ===

class SubcategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    order_index: int
    
    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None
    icon: str | None
    order_index: int
    subcategories: List[SubcategoryResponse] = []
    
    class Config:
        from_attributes = True


# === エンドポイント ===

@router.get("", response_model=List[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db)):
    """
    全カテゴリーとサブカテゴリーを取得
    """
    categories = db.query(Category).order_by(Category.order_index).all()
    
    # サブカテゴリーを order_index でソート
    for category in categories:
        category.subcategories = sorted(
            category.subcategories,
            key=lambda x: x.order_index
        )
    
    return categories


@router.get("/{category_slug}", response_model=CategoryResponse)
def get_category_by_slug(category_slug: str, db: Session = Depends(get_db)):
    """
    特定のカテゴリーとそのサブカテゴリーを取得
    """
    category = db.query(Category).filter(Category.slug == category_slug).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="カテゴリーが見つかりません")
    
    # サブカテゴリーを order_index でソート
    category.subcategories = sorted(
        category.subcategories,
        key=lambda x: x.order_index
    )
    
    return category


@router.get("/{category_slug}/subcategories", response_model=List[SubcategoryResponse])
def get_subcategories_by_category(category_slug: str, db: Session = Depends(get_db)):
    """
    特定のカテゴリーのサブカテゴリー一覧を取得
    """
    category = db.query(Category).filter(Category.slug == category_slug).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="カテゴリーが見つかりません")
    
    subcategories = (
        db.query(Subcategory)
        .filter(Subcategory.category_id == category.id)
        .order_by(Subcategory.order_index)
        .all()
    )
    
    return subcategories
