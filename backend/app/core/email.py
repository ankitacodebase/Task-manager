import logging
from email.message import EmailMessage
from typing import Optional, Any
import aiosmtplib
from app.core.config import get_settings
from app.core.enums import TaskStatus
from app.core.email_templates import (
    render_otp_template,
    render_password_reset_template,
    render_task_assignment_template,
    render_status_update_template,
    render_welcome_user_template,
)

logger = logging.getLogger("taskflow.email")
settings = get_settings()

class EmailService:
    """Enterprise asynchronous email service with rich responsive HTML and plain-text templates."""

    _sent_emails_dev_log: list[dict[str, Any]] = []

    @classmethod
    async def send_email(
        cls,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """Sends email via SMTP or logs to development console if credentials are empty."""
        msg = EmailMessage()
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.set_content(body_text)

        if body_html:
            msg.add_alternative(body_html, subtype="html")

        # Record in dev log for testing and auditing
        record = {
            "to": to_email,
            "subject": subject,
            "body": body_text,
            "html": body_html,
        }
        cls._sent_emails_dev_log.append(record)

        # If SMTP is not configured, log to server console
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info(
                "\n[DEV EMAIL DISPATCHED via SMTP Mock]\nTo: %s\nSubject: %s\nText Content:\n%s\n---------------------------",
                to_email,
                subject,
                body_text,
            )
            return True

        # Send through live SMTP server
        try:
            await aiosmtplib.send(
                msg,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER,
                password=settings.SMTP_PASSWORD,
                start_tls=True,
            )
            logger.info("Email delivered to %s [Subject: %s]", to_email, subject)
            return True
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e))
            return False

    @classmethod
    async def send_otp(cls, to_email: str, otp_code: str, purpose: str = "Login Verification") -> bool:
        """Dispatches 6-digit numeric OTP with responsive HTML card template."""
        subject, text_body, html_body = render_otp_template(otp_code, purpose)
        return await cls.send_email(to_email, subject, text_body, html_body)

    @classmethod
    async def send_password_reset(cls, to_email: str, reset_token: str, expires_minutes: int = 60) -> bool:
        """Dispatches password recovery instructions with branded token card template."""
        subject, text_body, html_body = render_password_reset_template(reset_token, expires_minutes)
        return await cls.send_email(to_email, subject, text_body, html_body)

    @classmethod
    async def send_task_assignment(
        cls,
        to_email: str,
        assignee_name: str,
        task_key: str,
        task_title: str,
        priority: str = "MEDIUM",
        due_date: Optional[str] = None,
    ) -> bool:
        """Notifies employee upon new task assignment with styled badge table template."""
        subject, text_body, html_body = render_task_assignment_template(
            assignee_name=assignee_name,
            task_key=task_key,
            task_title=task_title,
            priority=priority,
            due_date=due_date,
        )
        return await cls.send_email(to_email, subject, text_body, html_body)

    @classmethod
    async def send_status_update(
        cls,
        to_email: str,
        task_key: str,
        task_title: str,
        old_status: TaskStatus,
        new_status: TaskStatus,
        updated_by: Optional[str] = None,
    ) -> bool:
        """Notifies relevant team member or admin of task status transition with state change template."""
        subject, text_body, html_body = render_status_update_template(
            task_key=task_key,
            task_title=task_title,
            old_status=old_status.value,
            new_status=new_status.value,
            updated_by=updated_by,
        )
        return await cls.send_email(to_email, subject, text_body, html_body)

    @classmethod
    async def send_welcome_user(
        cls,
        to_email: str,
        full_name: str,
        temporary_password: str,
        role: str,
    ) -> bool:
        """Dispatches welcome onboarding email with login credentials."""
        subject, text_body, html_body = render_welcome_user_template(
            full_name=full_name,
            email=to_email,
            temporary_password=temporary_password,
            role=role,
        )
        return await cls.send_email(to_email, subject, text_body, html_body)

    @classmethod
    def get_sent_emails(cls) -> list[dict[str, Any]]:
        return cls._sent_emails_dev_log
