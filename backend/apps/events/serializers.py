from rest_framework import serializers
from .models import Event
from apps.clients.models import Client
from apps.chefs.models import ChefProfile


class EventListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    chef_name = serializers.SerializerMethodField()
    chef_color = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client', 'client_name', 'chef', 'chef_name', 'chef_color',
            'guest_count', 'status', 'client_pay'
        ]
    
    def get_chef_name(self, obj):
        if obj.chef:
            return obj.chef.user.full_name
        return None
    
    def get_chef_color(self, obj):
        if obj.chef:
            return obj.chef.calendar_color
        return '#9E9E9E'


class EventDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    client_allergies = serializers.CharField(source='client.allergies', read_only=True)
    chef_name = serializers.SerializerMethodField()
    chef_email = serializers.SerializerMethodField()
    chef_phone = serializers.SerializerMethodField()
    chef_color = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client', 'client_name', 'client_email', 'client_phone', 'client_allergies',
            'chef', 'chef_name', 'chef_email', 'chef_phone', 'chef_color',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'client_pay', 'chef_pay', 'profit', 'deposit_amount', 'deposit_received',
            'internal_notes', 'chef_notes', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profit', 'created_at', 'updated_at']
    
    def get_chef_name(self, obj):
        return obj.chef.user.full_name if obj.chef else None
    
    def get_chef_email(self, obj):
        return obj.chef.user.email if obj.chef else None
    
    def get_chef_phone(self, obj):
        return obj.chef.user.phone if obj.chef else None
    
    def get_chef_color(self, obj):
        return obj.chef.calendar_color if obj.chef else '#9E9E9E'


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'client', 'chef', 'name', 'date', 'start_time', 'end_time',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'client_pay', 'chef_pay', 'deposit_amount', 'deposit_received',
            'internal_notes', 'chef_notes', 'status'
        ]
    
    def validate_client(self, value):
        request = self.context['request']
        if value.organization != request.organization:
            raise serializers.ValidationError('Invalid client.')
        if value.is_deleted:
            raise serializers.ValidationError('Cannot assign deleted client.')
        return value
    
    def validate_chef(self, value):
        if value is None:
            return value
        request = self.context['request']
        if value.organization != request.organization:
            raise serializers.ValidationError('Invalid chef.')
        if not value.is_active:
            raise serializers.ValidationError('Cannot assign inactive chef.')
        return value


class EventChefViewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    client_allergies = serializers.CharField(source='client.allergies', read_only=True)
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client_name', 'client_email', 'client_phone', 'client_allergies',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'chef_pay', 'chef_notes', 'status'
        ]
        read_only_fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client_name', 'client_email', 'client_phone', 'client_allergies',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'chef_pay', 'status'
        ]


class EventCalendarSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='display_name')
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    extendedProps = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'start', 'end', 'color', 'extendedProps']
    
    def get_start(self, obj):
        return f'{obj.date}T{obj.start_time}'
    
    def get_end(self, obj):
        if obj.end_time:
            return f'{obj.date}T{obj.end_time}'
        return None
    
    def get_color(self, obj):
        if obj.chef:
            return obj.chef.calendar_color
        return '#9E9E9E'
    
    def get_extendedProps(self, obj):
        return {
            'client_name': obj.client.name,
            'chef_name': obj.chef.user.full_name if obj.chef else None,
            'guest_count': obj.guest_count,
            'location': obj.location,
            'status': obj.status
        }
