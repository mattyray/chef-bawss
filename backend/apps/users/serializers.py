from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from apps.organizations.models import Organization, OrganizationMembership
from .models import InvitationToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_email_verified']
        read_only_fields = ['id', 'email', 'is_email_verified']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    business_name = serializers.CharField(max_length=200)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def create(self, validated_data):
        business_name = validated_data.pop('business_name')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        
        org = Organization.objects.create(name=business_name)
        
        OrganizationMembership.objects.create(
            user=user,
            organization=org,
            role='admin'
        )
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    organization_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 
                  'is_email_verified', 'role', 'organization_name', 'organization_id']
        read_only_fields = ['id', 'email', 'is_email_verified']
    
    def get_role(self, obj):
        request = self.context.get('request')
        if request and request.membership:
            return request.membership.role
        return None
    
    def get_organization_name(self, obj):
        request = self.context.get('request')
        if request and request.organization:
            return request.organization.name
        return None
    
    def get_organization_id(self, obj):
        request = self.context.get('request')
        if request and request.organization:
            return request.organization.id
        return None
