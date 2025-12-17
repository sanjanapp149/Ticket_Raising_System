from rest_framework import serializers
from .models import Ticket, Attachment, AuditLog
from .utils import encrypt


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'uploaded_at']


class AuditLogSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = ['id', 'message', 'created_at', 'created_by']


class TicketSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    audit_logs = AuditLogSerializer(many=True, read_only=True)
    confidential_notes = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'priority',
            'status',
            'creator',
            'assigned_to',
            'confidential_notes',
            'created_at',
            'updated_at',
            'attachments',
            'audit_logs',
        ]
        read_only_fields = [
            'creator',
            'created_at',
            'updated_at',
        ]

    def get_confidential_notes(self, obj):
        user = self.context['request'].user
        return obj.get_confidential_notes(user)

    def create(self, validated_data):
        request = self.context['request']
        attachments = request.FILES.getlist('attachments')

        ticket = Ticket.objects.create(
            creator=request.user,
            **validated_data
        )

        for file in attachments:
            Attachment.objects.create(ticket=ticket, file=file)

        return ticket

    def update(self, instance, validated_data):
        user = self.context['request'].user

        #  EMPLOYEE RESTRICTIONS
        if not user.is_staff:
            validated_data.pop('status', None)
            validated_data.pop('assigned_to', None)
            validated_data.pop('confidential_notes', None)

        #  ADMIN: Encrypt confidential notes
        if user.is_staff and 'confidential_notes' in validated_data:
            validated_data['confidential_notes'] = encrypt(
                validated_data['confidential_notes']
            )

        return super().update(instance, validated_data)
