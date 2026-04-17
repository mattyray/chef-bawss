from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    event_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'allergies', 'notes', 'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'event_count', 'created_at', 'updated_at']


class ClientDetailSerializer(ClientSerializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, default=None)

    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ['total_revenue']
