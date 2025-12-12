from django.contrib import admin
from .models import ChefProfile


@admin.register(ChefProfile)
class ChefProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'default_pay_rate', 'calendar_color', 'is_active']
    list_filter = ['membership__organization', 'membership__is_active']
    search_fields = ['membership__user__email', 'membership__user__first_name']
    
    def user(self, obj):
        return obj.user.full_name
    
    def organization(self, obj):
        return obj.organization.name
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
