from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'address', 
            'allergies', 'notes', 'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'event_count', 'created_at', 'updated_at']
    
    def get_event_count(self, obj):
        return obj.events.filter(is_deleted=False).count()


class ClientDetailSerializer(ClientSerializer):
    total_revenue = serializers.SerializerMethodField()
    
    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ['total_revenue']
    
    def get_total_revenue(self, obj):
        request = self.context.get('request')
        if request and request.membership and request.membership.role == 'admin':
            total = obj.events.filter(is_deleted=False, status='completed').aggregate(
                total=models.Sum('client_pay')
            )['total']
            return total or 0
        return None
