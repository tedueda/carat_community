"""
SMS Service stub module
Phone authentication is disabled via PHONE_AUTH_ENABLED flag
This module provides stub implementations for import compatibility
"""

class SMSService:
    """Stub SMS service for phone authentication (disabled)"""
    
    def validate_phone_number(self, phone_number: str) -> bool:
        """Validate phone number format (stub)"""
        return False
    
    def format_phone_number(self, phone_number: str) -> str:
        """Format phone number (stub)"""
        return phone_number
    
    def send_verification_code(self, phone_number: str, code: str) -> bool:
        """Send verification code via SMS (stub)"""
        return False

sms_service = SMSService()
