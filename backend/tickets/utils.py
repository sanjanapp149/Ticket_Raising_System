import base64
from cryptography.fernet import Fernet
from django.conf import settings

def get_fernet():
    key = base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode())
    return Fernet(key)

def encrypt(text):
    return get_fernet().encrypt(text.encode()).decode()

def decrypt(text):
    return get_fernet().decrypt(text.encode()).decode()
