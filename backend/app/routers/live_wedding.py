from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/api/live-wedding", tags=["live-wedding"])

class LiveWeddingApplication(BaseModel):
    applicant1Name: str
    applicant1Kana: str
    applicant2Name: str
    applicant2Kana: str
    email: EmailStr
    phone: str
    preferredDate1: str
    preferredDate2: Optional[str] = None
    preferredDate3: Optional[str] = None
    guestCount: str
    venue: Optional[str] = None
    backgroundPreference: Optional[str] = None
    message: Optional[str] = None

@router.post("/application")
async def submit_application(application: LiveWeddingApplication):
    """
    Live Wedding申込みフォームの送信
    """
    try:
        # メール本文を作成
        email_body = f"""
Live Wedding お申し込み

【お申込者情報】
お名前（1）: {application.applicant1Name} ({application.applicant1Kana})
お名前（2）: {application.applicant2Name} ({application.applicant2Kana})

【連絡先情報】
メールアドレス: {application.email}
電話番号: {application.phone}

【挙式希望日】
第1希望: {application.preferredDate1}
第2希望: {application.preferredDate2 or '未記入'}
第3希望: {application.preferredDate3 or '未記入'}

【挙式詳細】
参加予定人数: {application.guestCount}
会場: {application.venue or 'スタジオQ'}
背景のご希望: {application.backgroundPreference or '未記入'}

【ご要望・ご質問】
{application.message or '未記入'}

---
このメールは自動送信されました。
        """

        # 環境変数からメール設定を取得（本番環境用）
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")

        # 開発環境ではメール送信をスキップ（ログのみ）
        if not smtp_user or not smtp_password:
            print("=== Live Wedding Application ===")
            print(email_body)
            print("================================")
            return {
                "status": "success",
                "message": "お申し込みを受け付けました（開発モード）"
            }

        # メール送信（本番環境）
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = admin_email
        msg['Subject'] = f"Live Wedding お申し込み - {application.applicant1Name}様"
        msg.attach(MIMEText(email_body, 'plain', 'utf-8'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)

        # 申込者への確認メール
        confirmation_body = f"""
{application.applicant1Name} 様

この度は、Live Weddingにお申し込みいただき、誠にありがとうございます。

以下の内容でお申し込みを受け付けました。
担当者より3営業日以内にご連絡させていただきます。

【お申込内容】
挙式希望日（第1希望）: {application.preferredDate1}
参加予定人数: {application.guestCount}

ご不明な点がございましたら、お気軽にお問い合わせください。

---
カラット Live Wedding事務局
        """

        confirmation_msg = MIMEMultipart()
        confirmation_msg['From'] = smtp_user
        confirmation_msg['To'] = application.email
        confirmation_msg['Subject'] = "Live Wedding お申し込み受付完了"
        confirmation_msg.attach(MIMEText(confirmation_body, 'plain', 'utf-8'))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(confirmation_msg)

        return {
            "status": "success",
            "message": "お申し込みを受け付けました"
        }

    except Exception as e:
        print(f"Error sending email: {e}")
        raise HTTPException(status_code=500, detail="メール送信に失敗しました")
