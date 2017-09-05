"""
LTI Provider API endpoint urls.
"""
from django.conf.urls import url

from .views import lti_launch


urlpatterns = [
    url(r'^tasks/(?P<task_id>.+)/$', lti_launch, name='lti_provider_launch'),
]
