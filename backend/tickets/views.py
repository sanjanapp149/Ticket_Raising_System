from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Ticket, AuditLog
from .serializers import TicketSerializer
from .permissions import IsAdmin


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Ticket.objects.none()
            
        user = self.request.user

        # Admin can see ALL tickets
        if user.is_staff:
            return Ticket.objects.all().order_by('-created_at')

        # Employee sees only their tickets
        return Ticket.objects.filter(creator=user).order_by('-created_at')

    def perform_update(self, serializer):

        ticket = self.get_object()
        user = self.request.user
        old_status = ticket.status
        old_assigned = ticket.assigned_to

        updated_ticket = serializer.save()

        # Audit log for status change
        if user.is_staff and old_status != updated_ticket.status:
            AuditLog.objects.create(
            ticket=updated_ticket,
            message=f"Status changed from {old_status} to {updated_ticket.status} by {user.email}",
            created_by=user
            )

        # Audit log for assigned_to change
        if user.is_staff and old_assigned != updated_ticket.assigned_to:
            old_assigned_str = f"User #{old_assigned}" if old_assigned else "Unassigned"
            new_assigned_str = f"User #{updated_ticket.assigned_to}" if updated_ticket.assigned_to else "Unassigned"
            AuditLog.objects.create(
            ticket=updated_ticket,
            message=f"Assigned from {old_assigned_str} to {new_assigned_str} by {user.email}",
            created_by=user
            )

    def get_permissions(self):
        # Admin-only update/delete
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()
