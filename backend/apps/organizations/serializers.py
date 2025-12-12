from rest_framework import serializers
from .models import Organization, OrganizationMembership


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'timezone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = OrganizationMembership
        fields = ['id', 'user', 'user_email', 'user_name', 'role', 'is_active', 'joined_at']
        read_only_fields = ['id', 'joined_at']
