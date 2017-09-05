import hashlib
from uuid import uuid4
from functools import wraps

from django.conf import settings


def add_p3p_header(view_func):
    """
    This decorator should only be used with views which may be displayed through the iframe.
    It adds additional headers to response and therefore gives IE browsers an ability to save cookies inside the iframe
    Details:
    http://blogs.msdn.com/b/ieinternals/archive/2013/09/17/simple-introduction-to-p3p-cookie-blocking-frame.aspx
    http://stackoverflow.com/questions/8048306/what-is-the-most-broad-p3p-header-that-will-work-with-ie
    """
    @wraps(view_func)
    def inner(request, *args, **kwargs):
        """
        Helper function
        """
        response = view_func(request, *args, **kwargs)
        response['P3P'] = settings.P3P_HEADER
        return response
    return inner


def token():
    """
    Generate a key/secret for LtiConsumer.
    """
    hash = hashlib.sha1(uuid4().hex.encode('utf-8'))
    hash.update(settings.SECRET_KEY.encode('utf-8'))
    return hash.hexdigest()[::2]


def verify_task_id(task_id):
    pass
