from django.db import models
from django.utils import timezone
from apps.organizations.models import Organization
from apps.clients.models import Client
from apps.chefs.models import ChefProfile


class Event(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='events')
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='events')
    chef = models.ForeignKey(
        ChefProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='events'
    )
    
    name = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    
    location = models.TextField(blank=True)
    guest_count = models.PositiveIntegerField()
    allergies = models.TextField(blank=True)
    menu_notes = models.TextField(blank=True)
    
    client_pay = models.DecimalField(max_digits=10, decimal_places=2)
    chef_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_received = models.BooleanField(default=False)
    payment_received = models.BooleanField(default=False)
    
    internal_notes = models.TextField(blank=True, help_text='Admin only')
    chef_notes = models.TextField(blank=True, help_text='Editable by assigned chef')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return self.display_name
    
    @property
    def display_name(self):
        if self.name:
            return self.name
        return f'{self.client.name} Event'
    
    @property
    def profit(self):
        if self.chef_pay:
            return self.client_pay - self.chef_pay
        return self.client_pay
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def save(self, *args, **kwargs):
        if not self.location and self.client.address:
            self.location = self.client.address
        super().save(*args, **kwargs)
