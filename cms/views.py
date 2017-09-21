import os
import json

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404
from django.conf import settings

from conversation.mongo import TasksStorage
from conversation.models import Task


storage = TasksStorage()


@login_required
def dashboard(request):
    user_tasks = storage.get_user_tasks(request.user.id)
    return render(request, 'cms/dashboard.html', {'user_tasks': user_tasks})


@login_required
def editor(request, task_id, demo=False):
    if demo:
        return render(request, 'cms/demo_tree.html', {})
    task = get_object_or_404(Task, task_id=task_id)
    task_data = storage.get_user_task(request.user.id, task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )
    task_data['user_id'] = request.user.id
    task_data['task_id'] = task_id
    task_data['task_name'] = task.name
    return render(request, 'cms/task_editor.html', {"task_data": task_data})


@csrf_exempt
def update_task(request):
    data = json.loads(request.body)
    task_data = json.loads(data.get('task_data'))
    if not task_data:
        return JsonResponse({'error': 'Improperly configured'}, status=400)
    else:
        storage.upsert_conversation(request.user.id, task_data)
        return JsonResponse({'status': 'ok'}, status=200)
