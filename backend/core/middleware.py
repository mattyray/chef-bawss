from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.organization = None
        request.membership = None
        
        if request.user.is_authenticated:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                request.organization = membership.organization
                request.membership = membership
