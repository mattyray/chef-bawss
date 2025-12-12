from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organizations.models import OrganizationMembership
from .models import ChefProfile

User = get_user_model()


class ChefProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='membership.id', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    is_active = serializers.BooleanField(source='membership.is_active', read_only=True)
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChefProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'address', 'default_pay_rate', 'calendar_color', 'notes',
            'is_active', 'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'calendar_color', 'event_count', 'created_at', 'updated_at']
    
    def get_event_count(self, obj):
        return obj.events.filter(is_deleted=False).count()


class ChefProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = ChefProfile
        fields = ['address', 'default_pay_rate', 'notes', 'first_name', 'last_name', 'phone']
    
    def update(self, instance, validated_data):
        user = instance.user
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        if 'phone' in validated_data:
            user.phone = validated_data.pop('phone')
        user.save()
        
        return super().update(instance, validated_data)


class ChefInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    default_pay_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_email(self, value):
        organization = self.context['request'].organization
        if OrganizationMembership.objects.filter(
            user__email=value, 
            organization=organization
        ).exists():
            raise serializers.ValidationError('This user is already a member of your organization.')
        return value
    
    def create(self, validated_data):
        organization = self.context['request'].organization
        email = validated_data['email']
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
                'phone': validated_data.get('phone', ''),
            }
        )
        
        if created:
            user.set_unusable_password()
            user.save()
        
        membership = OrganizationMembership.objects.create(
            user=user,
            organization=organization,
            role='chef'
        )
        
        chef_profile = ChefProfile.objects.create(
            membership=membership,
            address=validated_data.get('address', ''),
            default_pay_rate=validated_data.get('default_pay_rate'),
            notes=validated_data.get('notes', '')
        )
        
        return chef_profile


class ChefSelfSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', allow_blank=True)
    
    class Meta:
        model = ChefProfile
        fields = [
            'email', 'first_name', 'last_name', 'full_name', 'phone', 'address'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
