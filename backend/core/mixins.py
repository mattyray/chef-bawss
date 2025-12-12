class TenantQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'organization') and self.request.organization:
            return qs.filter(organization=self.request.organization)
        return qs.none()
