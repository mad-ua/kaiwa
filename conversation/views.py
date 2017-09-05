import os
import json

from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.conf import settings


@login_required
def chat_view(request, *args, **kwargs):
    return render(request, 'main_view.html', {})


def get_tree(request, *args, **kwargs):
    return JsonResponse(
        json.load(
            open(os.path.join(
                settings.BASE_DIR,
                '..',
                'conversation',
                'static',
                'tree_fixture.json'
            ))
        )
    )
