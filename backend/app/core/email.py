import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str):
        if not settings.SMTP_USER:
            print(f"DEBUG: Email to {to_email} skipped (SMTP_USER not set)")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            return

        message = MIMEMultipart()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.SMTP_USER}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html"))

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
        except Exception as e:
            print(f"Error sending email: {e}")

    @classmethod
    def send_order_notification(cls, db, user_id: int, order_id: int, status: str):
        from app.models.models import User
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.email:
            return

        subjects = {
            "placed": "Order Placed Successfully",
            "processing": "Order is being Processed",
            "printed": "Customization Printed",
            "shipped": "Order Shipped",
            "out_for_delivery": "Order Out for Delivery",
            "delivered": "Order Delivered"
        }
        
        subject = subjects.get(status, f"Order Updated: {status}")
        body = f"""
        <h1>Hi {user.name},</h1>
        <p>Your order #{order_id} status has been updated to: <strong>{status}</strong></p>
        <p>Thank you for shopping with Artexa!</p>
        """
        cls.send_email(user.email, subject, body)

