import re
from datetime import datetime, timedelta
from django.core.mail import send_mail, EmailMessage
from django.conf import settings

TIMEZONE = 'America/New_York'


def _ics_escape(text):
    text = str(text).replace('\\', '\\\\')
    text = text.replace(';', '\\;').replace(',', '\\,')
    text = re.sub(r'\r?\n', '\\\\n', text)
    return text


def generate_ics(event, organization, attendee_email):
    from datetime import time
    dtstart = datetime.combine(event.date, time(9, 0))
    dtend = dtstart + timedelta(hours=3)

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com')
    summary = _ics_escape(event.display_name)
    location = _ics_escape(event.location or 'TBD')
    description = _ics_escape(f"{event.display_name} - {event.guest_count} guests")
    org_name = _ics_escape(organization.name)

    return (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        f"PRODID:-//{org_name}//Chef Bawss//EN\r\n"
        "METHOD:REQUEST\r\n"
        "BEGIN:VEVENT\r\n"
        f"UID:event-{event.id}@chefbawss.com\r\n"
        f"DTSTART;TZID={TIMEZONE}:{dtstart.strftime('%Y%m%dT%H%M%S')}\r\n"
        f"DTEND;TZID={TIMEZONE}:{dtend.strftime('%Y%m%dT%H%M%S')}\r\n"
        f"SUMMARY:{summary}\r\n"
        f"LOCATION:{location}\r\n"
        f"DESCRIPTION:{description}\r\n"
        f"ORGANIZER;CN={org_name}:mailto:{from_email}\r\n"
        f"ATTENDEE;RSVP=TRUE:mailto:{attendee_email}\r\n"
        "STATUS:CONFIRMED\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )


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

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com')
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=from_email,
        to=[chef_user.email],
    )
    email.content_subtype = 'html'
    ics = generate_ics(event, organization, chef_user.email)
    email.attach('event.ics', ics, 'text/calendar; method=REQUEST')
    email.send(fail_silently=True)


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
