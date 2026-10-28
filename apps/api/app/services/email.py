import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger("contractflow.email")

def send_notification_email(
    recipient_email: str,
    subject: str,
    message_text: str,
    link_url: str | None = None
) -> dict:
    """
    Sends notification email via SMTP (SendGrid, Amazon SES, or custom).
    Falls back to console mode if SMTP is disabled or credentials not set.
    """
    full_body = f"{message_text}\n\nAccess ContractFlow: {link_url or 'http://localhost:5185'}"

    # If SMTP is not enabled or credentials not supplied, simulate in dev/console mode
    if not settings.SMTP_ENABLED or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.info(
            f"[EMAIL PREVIEW] To: {recipient_email} | Subject: {subject} | Body: {message_text}"
        )
        return {
            "sent": False,
            "mode": "console_preview",
            "recipient": recipient_email,
            "subject": subject
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[ContractFlow] {subject}"
        msg["From"] = settings.SMTP_FROM
        msg["To"] = recipient_email

        html_body = f"""
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
              <h2 style="color: #38bdf8; margin-top: 0;">ContractFlow CLM Notification</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #e2e8f0;">{message_text}</p>
              {f'<div style="margin-top: 24px;"><a href="{link_url}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open ContractFlow</a></div>' if link_url else ''}
              <hr style="border: none; border-top: 1px solid #334155; margin-top: 32px;" />
              <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">This is an automated notification from ContractFlow Enterprise Governance.</p>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(full_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [recipient_email], msg.as_string())

        logger.info(f"Email successfully delivered to {recipient_email}")
        return {
            "sent": True,
            "mode": "smtp_live",
            "recipient": recipient_email,
            "subject": subject
        }
    except Exception as exc:
        logger.error(f"Failed to deliver email to {recipient_email}: {exc}")
        return {
            "sent": False,
            "mode": "error",
            "recipient": recipient_email,
            "error": str(exc)
        }
