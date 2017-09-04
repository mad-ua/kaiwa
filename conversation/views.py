# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import json
import os

from django.http.response import JsonResponse
from django.shortcuts import render
from django.conf import settings

def chat_view(request, *args, **kwargs):
    return render(request, 'main_view.html', {})


def get_tree(request, *args, **kwargs):
    return JsonResponse(
        json.load(
            open(os.path.join(settings.BASE_DIR, 'chat', 'static', 'tree_fixture.json'))
        )
    )
