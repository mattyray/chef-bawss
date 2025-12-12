class TenantMixin:
    """
    Mixin that sets organization/membership after DRF authentication.
    Add this FIRST in your view's inheritance chain.
    """
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.user.is_authenticated:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                request.organization = membership.organization
                request.membership = membership


class TenantQuerysetMixin(TenantMixin):
    """
    Filters queryset by organization. Includes TenantMixin behavior.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.organization:
            return qs.filter(organization=self.request.organization)
        return qs.none()