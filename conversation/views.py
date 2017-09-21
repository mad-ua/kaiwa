import os
import json

from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.urls import reverse

from lti_provider.models import GradedTask
from lti_provider.outcomes import send_score_update
from .models import Task
from .mongo import TasksStorage

storage = TasksStorage()

@login_required
def chat_view(request, *args, **kwargs):
    graded_task = kwargs.get('graded_task')
    graded_task_id = graded_task.id if graded_task else None
    task_id = kwargs.get('task_id')
    tree_url =  reverse('get_tree', kwargs={'task_id': task_id})
    return render(
        request,
        'main_view.html',
        {
            'tree_url': tree_url,
            'grading_url': reverse('update_score', kwargs={'graded_task_id': graded_task_id})
        }
    )


def get_tree(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    task_data = storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )

    if task_id and task_id != 'None':
        task = get_object_or_404(Task, task_id=task_id)
        task_data['user_id'] = request.user.id
        task_data['task_id'] = task_id
        task_data['task_name'] = task.name

    return JsonResponse(task_data.get('data'))


def update_score(request, graded_task_id):
    try:
        score = float(request.GET.get('score'))
    except Exception:
        return JsonResponse({'status': 'err'}, status=400)
    if score < 0 or score > 1:
        return JsonResponse({'status': 'err'}, status=400)

    graded_task = get_object_or_404(GradedTask, id=graded_task_id)
    send_score_update(graded_task, score)
    return JsonResponse({'status': 'ok'}, status=200)
