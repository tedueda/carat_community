"""
Billing Router - Handles Stripe subscription checkout (TEST mode only)
Requires KYC verification before allowing checkout.
"""

import os
import stripe
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.auth import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/billing", tags=["billing"])

# Stripe configuration (TEST mode)
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PRICE_ID_MONTHLY = os.getenv("STRIPE_PRICE_ID_MONTHLY", "price_1Sy0PVAIFOpz52fjAk2kajfq")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY


def get_or_create_stripe_customer(db: Session, user: User) -> str:
    """Get existing Stripe customer or create a new one."""
    if user.stripe_customer_id:
        return user.stripe_customer_id
    
    customer = stripe.Customer.create(
        email=user.email,
        name=user.display_name,
        metadata={"user_id": str(user.id)}
    )
    
    user.stripe_customer_id = customer.id
    db.commit()
    
    return customer.id


@router.get("/status")
def get_billing_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's billing and membership status."""
    return {
        "premium": current_user.membership_type == "premium",
        "membership_type": current_user.membership_type,
        "membership_status": current_user.membership_status,
        "kyc_status": current_user.kyc_status,
        "stripe_customer_id": current_user.stripe_customer_id,
        "stripe_subscription_id": current_user.stripe_subscription_id
    }


@router.post("/checkout")
async def create_checkout_session(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create Stripe Checkout session for subscription.
    Requires KYC verification to be completed first.
    """
    if not STRIPE_SECRET_KEY or not STRIPE_PRICE_ID_MONTHLY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # CRITICAL: Check KYC status - must be verified
    if current_user.kyc_status != "verified":
        raise HTTPException(
            status_code=403,
            detail="KYC verification required before subscription. Please complete identity verification first."
        )
    
    # Check if already has active subscription
    if current_user.membership_status == "paid":
        raise HTTPException(
            status_code=400,
            detail="User already has an active subscription"
        )
    
    try:
        # Get or create Stripe customer
        customer_id = get_or_create_stripe_customer(db, current_user)
        
        # Create Stripe Checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": STRIPE_PRICE_ID_MONTHLY,
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"{FRONTEND_ORIGIN}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_ORIGIN}/billing/cancel",
            metadata={
                "user_id": str(current_user.id)
            },
            subscription_data={
                "metadata": {
                    "user_id": str(current_user.id)
                }
            }
        )
        
        logger.info(f"Checkout session created for user {current_user.id}: {checkout_session.id}")
        
        return {
            "url": checkout_session.url,
            "session_id": checkout_session.id
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
