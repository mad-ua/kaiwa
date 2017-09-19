import os
import json

from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.urls import reverse

from .models import Task
from .mongo import TasksStorage

storage = TasksStorage()

@login_required
def chat_view(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    tree_url =  reverse('get_tree', kwargs={'task_id': task_id})
    return render(
        request, 'main_view.html', {'tree_url': tree_url}
    )


def get_tree(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    task = get_object_or_404(Task, task_id=task_id) if task_id else None
    tree = task.serialized if task else None
    task_id = kwargs.get('task_id')
    task_data = storage.get_task(task_id)
    return JsonResponse(task_data.get('data'))
