"""
CMS endpoint urls.
"""
from django.conf.urls import url

from .views import dashboard, editor, update_task, create_task


urlpatterns = [
    url(r'^$', dashboard, name='dashboard'),
    url(r'^task/(?P<task_id>.+)/edit/*$', editor, name='editor'),
    url(r'^task/update/*$', update_task, name='update'),
    url(r'^task/create/*$', create_task, name='create'),
]
