from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.events.models import Event


class Command(BaseCommand):
    help = 'Mark upcoming events as completed once their date has passed'

    def handle(self, *args, **options):
        yesterday = timezone.now().date() - timezone.timedelta(days=1)
        updated = Event.objects.filter(
            status=Event.Status.UPCOMING,
            date__lte=yesterday,
            is_deleted=False,
        ).update(status=Event.Status.COMPLETED)

        self.stdout.write(f'Marked {updated} event(s) as completed')
