from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'organization', 'is_deleted', 'created_at']
    list_filter = ['organization', 'is_deleted']
    search_fields = ['name', 'email', 'phone']
