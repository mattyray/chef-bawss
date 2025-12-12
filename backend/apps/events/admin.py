from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'client', 'chef_name', 'date', 'status', 'client_pay', 'is_deleted']
    list_filter = ['status', 'is_deleted', 'organization', 'date']
    search_fields = ['name', 'client__name']
    date_hierarchy = 'date'
    
    def chef_name(self, obj):
        return obj.chef.user.full_name if obj.chef else '-'
    chef_name.short_description = 'Chef'
