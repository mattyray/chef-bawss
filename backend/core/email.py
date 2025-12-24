from django.core.mail import send_mail
from django.conf import settings


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


def send_event_assignment_email(chef_user, event, organization):
    """Send email to chef when they're assigned to a new event."""
    event_url = f"{settings.FRONTEND_URL}/events/{event.id}/chef-view"

    subject = f"New Event Assignment: {event.display_name}"

    message = f"""
Hi {chef_user.first_name},

You've been assigned to a new event with {organization.name}!

Event: {event.display_name}
Client: {event.client.name}
Date: {event.date.strftime('%A, %B %d, %Y')}
Time: {event.start_time.strftime('%I:%M %p')}
Location: {event.location or 'TBD'}
Guests: {event.guest_count}
Your Pay: ${event.chef_pay or 'TBD'}

View event details: {event_url}

Best,
{organization.name}
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .details {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>New Event Assignment</h2>
        <p>Hi {chef_user.first_name},</p>
        <p>You've been assigned to a new event with <strong>{organization.name}</strong>!</p>
        <div class="details">
            <p><strong>Event:</strong> {event.display_name}</p>
            <p><strong>Client:</strong> {event.client.name}</p>
            <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y')}</p>
            <p><strong>Time:</strong> {event.start_time.strftime('%I:%M %p')}</p>
            <p><strong>Location:</strong> {event.location or 'TBD'}</p>
            <p><strong>Guests:</strong> {event.guest_count}</p>
            <p><strong>Your Pay:</strong> ${event.chef_pay or 'TBD'}</p>
        </div>
        <a href="{event_url}" class="button">View Event Details</a>
        <div class="footer">
            <p>Sent from {organization.name} via Chef Bawss</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[chef_user.email],
        html_message=html_message,
        fail_silently=True,  # Don't fail the request if email fails
    )


def send_event_update_email(chef_user, event, organization, changes=None):
    """Send email to chef when their assigned event is updated."""
    event_url = f"{settings.FRONTEND_URL}/events/{event.id}/chef-view"

    subject = f"Event Updated: {event.display_name}"

    changes_text = ""
    if changes:
        changes_text = "\n\nChanges made:\n" + "\n".join(f"- {c}" for c in changes)

    message = f"""
Hi {chef_user.first_name},

An event you're assigned to has been updated.{changes_text}

Event: {event.display_name}
Client: {event.client.name}
Date: {event.date.strftime('%A, %B %d, %Y')}
Time: {event.start_time.strftime('%I:%M %p')}
Location: {event.location or 'TBD'}
Guests: {event.guest_count}

View event details: {event_url}

Best,
{organization.name}
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .details {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .changes {{ background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Event Updated</h2>
        <p>Hi {chef_user.first_name},</p>
        <p>An event you're assigned to has been updated.</p>
        {'<div class="changes"><strong>Changes:</strong><ul>' + "".join(f"<li>{c}</li>" for c in (changes or [])) + '</ul></div>' if changes else ''}
        <div class="details">
            <p><strong>Event:</strong> {event.display_name}</p>
            <p><strong>Client:</strong> {event.client.name}</p>
            <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y')}</p>
            <p><strong>Time:</strong> {event.start_time.strftime('%I:%M %p')}</p>
            <p><strong>Location:</strong> {event.location or 'TBD'}</p>
            <p><strong>Guests:</strong> {event.guest_count}</p>
        </div>
        <a href="{event_url}" class="button">View Event Details</a>
        <div class="footer">
            <p>Sent from {organization.name} via Chef Bawss</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[chef_user.email],
        html_message=html_message,
        fail_silently=True,
    )


def send_password_reset_email(user, token):
    """Send password reset email."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    subject = "Reset Your Password - Chef Bawss"

    message = f"""
Hi {user.first_name},

We received a request to reset your password for your Chef Bawss account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.

Best,
The Chef Bawss Team
"""

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
        <h2>Reset Your Password</h2>
        <p>Hi {user.first_name},</p>
        <p>We received a request to reset your password for your Chef Bawss account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="{reset_url}" class="button">Reset Password</a>
        <p>Or copy this link: {reset_url}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
            <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
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
