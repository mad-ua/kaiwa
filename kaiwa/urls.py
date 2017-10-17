"""kaiwa URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from conversation.views import (
    chat_view, get_tree, update_score, get_tree_graph, reset_user_task_score, chat_history, get_chat_status)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', chat_view, name='chat'),
    url(r'^task/(?P<task_id>.+)/*$', chat_view, name='chat_detail'),
    url(r'^tree/(?P<task_id>.+)/*$', get_tree, name='get_tree'),
    url(r'^tree_graph/(?P<task_id>.+)/*$', get_tree_graph, name='get_tree_graph'),
    url(r'^update_score/(?P<graded_task_id>[^/].+)/(?P<msg_id>[^/].+)?/?$', update_score, name='update_score'),
    url(r'^reset_user_task_score/(?P<task_id>.+)/', reset_user_task_score, name='reset_user_task_score'),
    url(r'^chat_history/(?P<task_id>.+)/', chat_history, name='chat_history'),
    url(r'^get_chat_status/(?P<task_id>.+)/', get_chat_status, name='get_chat_status'),

    # LTI
    url(r'^lti_provider/', include('lti_provider.urls')),
    url(r'^cms/', include('cms.urls', namespace='cms')),
]
