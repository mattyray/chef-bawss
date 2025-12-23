from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    ThrottledTokenObtainPairView,
    MeView,
    ChangePasswordView,
    LogoutView,
    InviteInfoView,
    AcceptInviteView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('invite-info/', InviteInfoView.as_view(), name='invite_info'),
    path('accept-invite/', AcceptInviteView.as_view(), name='accept_invite'),
]
