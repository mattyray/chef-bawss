from django.db import models
from apps.organizations.models import OrganizationMembership


CALENDAR_COLORS = [
    '#4A90D9',
    '#7B68EE',
    '#E57373',
    '#4DB6AC',
    '#FFB74D',
    '#81C784',
    '#F06292',
    '#64B5F6',
]


class ChefProfile(models.Model):
    membership = models.OneToOneField(
        OrganizationMembership, 
        on_delete=models.CASCADE, 
        related_name='chef_profile'
    )
    address = models.TextField(blank=True)
    default_pay_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calendar_color = models.CharField(max_length=7, blank=True)
    notes = models.TextField(blank=True, help_text='Admin-only private notes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.calendar_color:
            self.calendar_color = self._assign_color()
        super().save(*args, **kwargs)
    
    def _assign_color(self):
        org = self.membership.organization
        used_colors = ChefProfile.objects.filter(
            membership__organization=org
        ).values_list('calendar_color', flat=True)
        
        for color in CALENDAR_COLORS:
            if color not in used_colors:
                return color
        
        count = ChefProfile.objects.filter(membership__organization=org).count()
        return CALENDAR_COLORS[count % len(CALENDAR_COLORS)]
    
    @property
    def user(self):
        return self.membership.user
    
    @property
    def organization(self):
        return self.membership.organization
    
    @property
    def is_active(self):
        return self.membership.is_active
    
    def __str__(self):
        return f'{self.user.full_name} - {self.organization.name}'
