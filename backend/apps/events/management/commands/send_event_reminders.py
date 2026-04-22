import logging
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.mail import EmailMessage
from django.conf import settings
from django.utils import timezone
from apps.events.models import Event
from core.email import generate_ics

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Send reminder emails to chefs for events happening tomorrow'

    def handle(self, *args, **options):
        tomorrow = timezone.now().date() + timedelta(days=1)
        events = Event.objects.filter(
            date=tomorrow,
            status=Event.Status.UPCOMING,
            chef__isnull=False,
            is_deleted=False,
        ).select_related('chef__membership__user', 'client', 'organization')

        sent = 0
        for event in events:
            chef_user = event.chef.user
            try:
                subject = f"Reminder: {event.display_name} — Tomorrow"
                body = f"""
<html><body>
<h2>Event Reminder</h2>
<p>Hi {chef_user.first_name},</p>
<p>Reminder: you have an event <strong>tomorrow</strong>.</p>
<div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
    <p><strong>Event:</strong> {event.display_name}</p>
    <p><strong>Client:</strong> {event.client.name}</p>
    <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y')}</p>
    <p><strong>Location:</strong> {event.location or 'TBD'}</p>
    <p><strong>Guests:</strong> {event.guest_count}</p>
</div>
<p style="font-size:12px;color:#666;">Sent from {event.organization.name} via Chef Bawss</p>
</body></html>"""

                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com')
                email = EmailMessage(subject=subject, body=body, from_email=from_email, to=[chef_user.email])
                email.content_subtype = 'html'
                ics = generate_ics(event, event.organization, chef_user.email)
                email.attach('event.ics', ics, 'text/calendar; method=REQUEST')
                email.send(fail_silently=False)
                sent += 1
            except Exception:
                logger.exception('Failed to send reminder for event %s to %s', event.pk, chef_user.email)

        self.stdout.write(f'Sent {sent} reminder(s) for {tomorrow}')
