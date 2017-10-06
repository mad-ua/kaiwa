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
from identity.models import Organization


storage = TasksStorage()


@login_required
def dashboard(request):
    organization = request.user.organization
    tasks_ids = (
        organization.tasks.values_list('task_id', flat=True)
        if organization else
        Task.objects.filter(user=request.user).values_list(
            'task_id', flat=True
        )
    )
    user_tasks = storage.get_tasks([i for i in tasks_ids])
    return render(
        request, 'cms/dashboard.html', {'user_tasks': user_tasks}
    )


@login_required
def editor(request, task_id, demo=False):
    if demo:
        return render(request, 'cms/demo_tree.html', {})
    task = get_object_or_404(Task, task_id=task_id)
    task_data = storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(
                os.path.join(
                    settings.BASE_DIR,
                    '../conversation',
                    'static',
                    'tree_fixture.json'
                )
            )
        )
    return render(
        request,
        'cms/task_editor.html',
        {
            "task_data": json.dumps(task_data),
            "task_id": task_id
        }
    )


@csrf_exempt
def update_task(request):
    data = json.loads(request.body)
    task_data = json.loads(data.get('task_data'))
    if not task_data:
        return JsonResponse({'error': 'Improperly configured'}, status=400)
    else:
        storage.upsert_conversation(task_data['task_id'], task_data['data'])
        return JsonResponse({'status': 'ok'}, status=200)
