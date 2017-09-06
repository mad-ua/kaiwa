import os
import json

from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings

from .models import Task


@login_required
def chat_view(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    task = get_object_or_404(Task, task_id=task_id) if task_id else None
    tree = task.serialized if task else None
    return render(request, 'main_view.html', {'tree': tree})


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
