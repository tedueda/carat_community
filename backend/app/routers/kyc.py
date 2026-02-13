"""
KYC Router - Handles Stripe Identity verification (TEST mode only)
"""

import os
import stripe
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/kyc", tags=["kyc"])

# Stripe configuration (TEST mode)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


@router.post("/start")
async def start_kyc(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Start Stripe Identity verification session.
    Returns URL to redirect user to Stripe Identity flow.
    """
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Check if already verified
    if current_user.kyc_status == "verified":
        return {
            "alreadyVerified": True,
            "message": "KYC already verified"
        }
    
    try:
        # Create Stripe Identity VerificationSession
        verification_session = stripe.identity.VerificationSession.create(
            type="document",
            options={
                "document": {
                    "allowed_types": ["passport", "driving_license", "id_card"],
                    "require_matching_selfie": True
                }
            },
            metadata={
                "user_id": str(current_user.id)
            },
            return_url=f"{FRONTEND_ORIGIN}/kyc/return"
        )
        
        # Update user status
        current_user.kyc_status = "pending"
        current_user.stripe_identity_verification_session_id = verification_session.id
        db.commit()
        
        logger.info(f"KYC session created for user {current_user.id}: {verification_session.id}")
        
        return {
            "url": verification_session.url,
            "sessionId": verification_session.id
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe Identity error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user's KYC status."""
    return {
        "kyc_status": current_user.kyc_status,
        "kyc_verified_at": current_user.kyc_verified_at.isoformat() if current_user.kyc_verified_at else None,
        "session_id": current_user.stripe_identity_verification_session_id
    }
