"""
Professional HTML & Plain-Text Email Templates for TaskFlow Enterprise.
Designed with inline CSS, responsive email tables, brand typography, and dark-mode safe styling.
"""

from typing import Optional

def _base_html_layout(title: str, preheader: str, content_html: str) -> str:
    """Standardized enterprise HTML email wrapper with responsive styling."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
    }}
    .email-wrapper {{
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }}
    .email-header {{
      background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
      padding: 28px 32px;
      text-align: center;
      color: #ffffff;
    }}
    .email-header h1 {{
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .email-header p {{
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #c7d2fe;
    }}
    .email-body {{
      padding: 32px;
    }}
    .otp-box {{
      background-color: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }}
    .otp-code {{
      font-family: 'Courier New', Courier, monospace;
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #4f46e5;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }}
    .badge-urgent {{ background-color: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }}
    .badge-high {{ background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }}
    .badge-medium {{ background-color: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }}
    .badge-low {{ background-color: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }}
    .badge-status {{ background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }}
    .info-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }}
    .info-table td {{
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }}
    .info-table td.label {{
      color: #64748b;
      font-weight: 500;
      width: 35%;
    }}
    .info-table td.value {{
      font-weight: 600;
      color: #0f172a;
    }}
    .cta-button {{
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      margin: 20px 0;
    }}
    .email-footer {{
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>TaskFlow Enterprise</h1>
      <p>Secure Workplace Management Platform</p>
    </div>
    <div class="email-body">
      {content_html}
    </div>
    <div class="email-footer">
      <p>This is an automated system notification from your TaskFlow organization workspace.</p>
      <p>&copy; TaskFlow Enterprise Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
"""

def render_otp_template(otp_code: str, purpose: str = "Login Verification") -> tuple[str, str, str]:
    """Template 1: Two-Factor / Login Verification Code."""
    subject = f"Your Verification Code: {otp_code} — TaskFlow"
    preheader = f"Use code {otp_code} to complete your {purpose}."

    content_html = f"""
      <h2 style="margin-top:0;font-size:18px;color:#0f172a;">Authentication Verification</h2>
      <p>Hello,</p>
      <p>A request was made to authenticate your account for <strong>{purpose}</strong>. Please use the single-use 6-digit code below to proceed:</p>
      
      <div class="otp-box">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Verification Code</div>
        <div class="otp-code">{otp_code}</div>
      </div>

      <p style="font-size:13px;color:#64748b;">
        ⏱️ <strong>This code will expire in 10 minutes.</strong><br>
        🔒 If you did not initiate this request, someone may be attempting to access your account. Please notify your workspace administrator immediately.
      </p>
    """

    plain_text = (
        f"TaskFlow Verification Code\n\n"
        f"Your verification code for {purpose} is: {otp_code}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this code, please contact your workspace administrator.\n\n"
        f"— TaskFlow Security"
    )

    return subject, plain_text, _base_html_layout(subject, preheader, content_html)

def render_password_reset_template(reset_token: str, expires_minutes: int = 60) -> tuple[str, str, str]:
    """Template 2: Password Recovery Instructions."""
    subject = "Reset Your TaskFlow Password"
    preheader = "Instructions to reset your workspace account password."

    content_html = f"""
      <h2 style="margin-top:0;font-size:18px;color:#0f172a;">Password Recovery Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset the password for your TaskFlow workspace account. Use the recovery token below to choose a new password:</p>

      <div class="otp-box">
        <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Recovery Token</div>
        <div style="font-family:monospace;font-size:14px;font-weight:700;word-break:break-all;color:#0f172a;">{reset_token}</div>
      </div>

      <p style="font-size:13px;color:#64748b;">
        ⏱️ This recovery token is valid for <strong>{expires_minutes} minutes</strong>.<br>
        If you did not request a password reset, you can safely disregard this email. Your existing password remains secure.
      </p>
    """

    plain_text = (
        f"TaskFlow Password Recovery\n\n"
        f"Your password recovery token is: {reset_token}\n\n"
        f"This token will expire in {expires_minutes} minutes.\n"
        f"If you did not request this reset, no action is required.\n\n"
        f"— TaskFlow Security"
    )

    return subject, plain_text, _base_html_layout(subject, preheader, content_html)

def render_task_assignment_template(
    assignee_name: str,
    task_key: str,
    task_title: str,
    priority: str,
    due_date: str | None = None
) -> tuple[str, str, str]:
    """Template 3: Task Assignment Notification."""
    subject = f"New Task Assigned: [{task_key}] {task_title}"
    preheader = f"You have been assigned to work on [{task_key}] {task_title}."

    p_badge_class = f"badge-{priority.lower()}" if priority.lower() in ("urgent", "high", "medium", "low") else "badge-medium"

    due_row = f'<tr><td class="label">Deadline</td><td class="value">{due_date}</td></tr>' if due_date else ''

    content_html = f"""
      <h2 style="margin-top:0;font-size:18px;color:#0f172a;">Task Assignment Notification</h2>
      <p>Hello <strong>{assignee_name}</strong>,</p>
      <p>A new work item has been assigned to you in your organization workspace:</p>

      <table class="info-table">
        <tr>
          <td class="label">Task Identifier</td>
          <td class="value"><span style="font-family:monospace;font-weight:700;">{task_key}</span></td>
        </tr>
        <tr>
          <td class="label">Title</td>
          <td class="value">{task_title}</td>
        </tr>
        <tr>
          <td class="label">Priority</td>
          <td class="value"><span class="badge {p_badge_class}">{priority}</span></td>
        </tr>
        {due_row}
      </table>

      <p style="margin-top:24px;">Please review the task specifications and update the status as you start progress.</p>
    """

    plain_text = (
        f"New Task Assigned: [{task_key}] {task_title}\n\n"
        f"Hello {assignee_name},\n\n"
        f"A new task has been assigned to you:\n"
        f"Task: {task_key}\n"
        f"Title: {task_title}\n"
        f"Priority: {priority}\n"
        f"{f'Deadline: {due_date}' if due_date else ''}\n\n"
        f"Please log in to your workspace to review requirements.\n\n"
        f"— TaskFlow Workspace"
    )

    return subject, plain_text, _base_html_layout(subject, preheader, content_html)

def render_status_update_template(
    task_key: str,
    task_title: str,
    old_status: str,
    new_status: str,
    updated_by: Optional[str] = None,
) -> tuple[str, str, str]:
    """Template 4: Task Status Transition Notification."""
    subject = f"Status Updated: [{task_key}] -> {new_status}"
    preheader = f"Task [{task_key}] transitioned to {new_status}."

    updater_row = f'<tr><td class="label">Updated By</td><td class="value">{updated_by}</td></tr>' if updated_by else ""
    updater_text = f"Updated by: {updated_by}\n" if updated_by else ""

    content_html = f"""
      <h2 style="margin-top:0;font-size:18px;color:#0f172a;">Task Lifecycle Transition</h2>
      <p>Hello,</p>
      <p>The lifecycle status for task <strong>[{task_key}]</strong> has been updated:</p>

      <table class="info-table">
        <tr>
          <td class="label">Task Identifier</td>
          <td class="value"><span style="font-family:monospace;font-weight:700;">{task_key}</span></td>
        </tr>
        <tr>
          <td class="label">Title</td>
          <td class="value">{task_title}</td>
        </tr>
        <tr>
          <td class="label">Previous Status</td>
          <td class="value"><span style="color:#64748b;">{old_status}</span></td>
        </tr>
        <tr>
          <td class="label">New Status</td>
          <td class="value"><span class="badge badge-status">{new_status}</span></td>
        </tr>
        {updater_row}
      </table>
    """

    plain_text = (
        f"Task Status Updated: [{task_key}] {task_title}\n\n"
        f"Status transitioned: {old_status} -> {new_status}\n"
        f"{updater_text}\n"
        f"— TaskFlow Workspace"
    )

    return subject, plain_text, _base_html_layout(subject, preheader, content_html)

def render_welcome_user_template(
    full_name: str,
    email: str,
    temporary_password: str,
    role: str
) -> tuple[str, str, str]:
    """Template 5: Welcome / Account Provisioning Invitation."""
    subject = "Welcome to TaskFlow — Your Workspace Account Details"
    preheader = f"Your TaskFlow organization account has been created for {email}."

    content_html = f"""
      <h2 style="margin-top:0;font-size:18px;color:#0f172a;">Welcome to TaskFlow!</h2>
      <p>Hello <strong>{full_name}</strong>,</p>
      <p>An administrator has created an account for you in your organization workspace. Here are your credentials:</p>

      <table class="info-table">
        <tr>
          <td class="label">Login Email</td>
          <td class="value">{email}</td>
        </tr>
        <tr>
          <td class="label">Assigned Role</td>
          <td class="value">{role}</td>
        </tr>
        <tr>
          <td class="label">Initial Password</td>
          <td class="value"><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#4f46e5;font-weight:700;">{temporary_password}</code></td>
        </tr>
      </table>

      <p style="font-size:13px;color:#64748b;">
        🔒 <strong>Security Notice:</strong> For your security, we recommend signing in and updating your password immediately.
      </p>
    """

    plain_text = (
        f"Welcome to TaskFlow\n\n"
        f"Hello {full_name},\n\n"
        f"Your workspace account has been created:\n"
        f"Email: {email}\n"
        f"Role: {role}\n"
        f"Initial Password: {temporary_password}\n\n"
        f"Please log in and update your password.\n\n"
        f"— TaskFlow Workspace"
    )

    return subject, plain_text, _base_html_layout(subject, preheader, content_html)
