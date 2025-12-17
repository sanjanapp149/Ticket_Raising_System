from django.db import models
from django.conf import settings
from .utils import encrypt, decrypt
from django.utils import timezone


User = settings.AUTH_USER_MODEL

PRIORITY_CHOICES = [('Low','Low'),('Medium','Medium'),('High','High')]
STATUS_CHOICES = [('Open','Open'),('In Progress','In Progress'),('Resolved','Resolved')]

class Ticket(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Low')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Open')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_tickets')
    confidential_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_confidential_notes(self, user):
        if user.is_staff:
            if not self.confidential_notes:
                return None
            try:
                return decrypt(self.confidential_notes)
            except Exception:
                return "[Invalid confidential notes]"
        return None

class Attachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    uploaded_at = models.DateTimeField(default=timezone.now)  # <-- set default for old rows
class AuditLog(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='audit_logs')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
