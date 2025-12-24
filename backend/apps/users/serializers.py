from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from apps.organizations.models import Organization, OrganizationMembership
from .models import InvitationToken, PasswordResetToken

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


class AcceptInviteSerializer(serializers.Serializer):
    """Validates invitation token and sets user password."""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_token(self, value):
        try:
            invitation = InvitationToken.objects.select_related('user').get(token=value)
        except InvitationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid invitation token.')

        if not invitation.is_valid:
            raise serializers.ValidationError('This invitation has expired or already been used.')

        self.invitation = invitation
        return value

    def save(self):
        user = self.invitation.user
        user.set_password(self.validated_data['password'])
        user.is_email_verified = True
        user.save()

        self.invitation.mark_used()
        return user


class InviteInfoSerializer(serializers.Serializer):
    """Returns info about an invitation for the accept-invite page."""
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            invitation = InvitationToken.objects.select_related('user').get(token=value)
        except InvitationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid invitation token.')

        if not invitation.is_valid:
            raise serializers.ValidationError('This invitation has expired or already been used.')

        self.invitation = invitation
        return value

    def get_info(self):
        user = self.invitation.user
        # Get the organization from the user's chef membership
        membership = user.memberships.filter(role='chef').first()
        org_name = membership.organization.name if membership else None

        return {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'organization_name': org_name,
        }
