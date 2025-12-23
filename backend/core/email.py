from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_chef_invitation_email(user, organization, token):
    """Send invitation email to a newly invited chef."""
    invite_url = f"{settings.FRONTEND_URL}/accept-invite?token={token}"

    subject = f"You've been invited to join {organization.name} on Chef Bawss"

    # Plain text version
    message = f"""
Hi {user.first_name},

You've been invited to join {organization.name} as a chef on Chef Bawss.

Click the link below to set your password and access your account:
{invite_url}

This link will expire in 7 days.

If you didn't expect this invitation, you can ignore this email.

Best,
The Chef Bawss Team
"""

    # HTML version (optional, for nicer emails)
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Welcome to Chef Bawss!</h2>
        <p>Hi {user.first_name},</p>
        <p>You've been invited to join <strong>{organization.name}</strong> as a chef on Chef Bawss.</p>
        <p>Click the button below to set your password and access your account:</p>
        <a href="{invite_url}" class="button">Accept Invitation</a>
        <p>Or copy this link: {invite_url}</p>
        <p>This link will expire in 7 days.</p>
        <div class="footer">
            <p>If you didn't expect this invitation, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
