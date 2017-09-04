import hashlib
from uuid import uuid4

from django.conf import settings


def task_id_def():
    """
    Generate a key/secret for LtiConsumer.
    """
    hash = hashlib.sha1(uuid4().hex.encode('utf-8'))
    hash.update(settings.SECRET_KEY.encode('utf-8'))
    return hash.hexdigest()[::2]
