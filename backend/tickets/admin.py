from django.contrib import admin
from .models import Ticket, Attachment, AuditLog

admin.site.register(Ticket)
admin.site.register(Attachment)
admin.site.register(AuditLog)