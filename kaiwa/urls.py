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
from conversation.views import chat_view, get_tree

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', chat_view, name='chat'),
    url(r'^tree/?$', get_tree, name='get_tree'),

    # LTI
    url(r'^lti_provider/', include('lti_provider.urls')),
    url(r'^cms/', include('cms.urls', namespace='cms')),
]
