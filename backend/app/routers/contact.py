from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, EmailStr
import os
import logging

from app.database import get_db

logger = logging.getLogger(__name__)

CONTACT_RECIPIENT = os.getenv("CONTACT_EMAIL", "ted@carat-community.com")

router = APIRouter(
    prefix="/api/contact",
    tags=["contact"],
)


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("")
def submit_contact(
    payload: ContactRequest,
    db: Session = Depends(get_db),
):
    try:
        db.execute(
            text(
                """
                INSERT INTO contact_inquiries (name, email, subject, message)
                VALUES (:name, :email, :subject, :message)
                """
            ),
            {
                "name": payload.name,
                "email": payload.email,
                "subject": payload.subject,
                "message": payload.message,
            },
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to save contact inquiry: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save inquiry")

    try:
        _send_notification_email(payload)
    except Exception as e:
        logger.warning("Email notification skipped: %s", e)

    return {"ok": True}


def _send_notification_email(payload: ContactRequest) -> None:
    import boto3
    from botocore.exceptions import ClientError

    region = os.getenv("AWS_REGION", "ap-northeast-1")
    sender = os.getenv("SES_SENDER", CONTACT_RECIPIENT)

    client = boto3.client("ses", region_name=region)
    subject_map = {
        "service": "サービスについて",
        "account": "アカウントについて",
        "payment": "決済・お支払いについて",
        "bug": "不具合・バグ報告",
        "other": "その他",
    }
    subject_label = subject_map.get(payload.subject, payload.subject)

    client.send_email(
        Source=sender,
        Destination={"ToAddresses": [CONTACT_RECIPIENT]},
        Message={
            "Subject": {"Data": f"[Carat お問い合わせ] {subject_label}", "Charset": "UTF-8"},
            "Body": {
                "Text": {
                    "Data": (
                        f"名前: {payload.name}\n"
                        f"メール: {payload.email}\n"
                        f"件名: {subject_label}\n\n"
                        f"{payload.message}"
                    ),
                    "Charset": "UTF-8",
                }
            },
        },
    )
