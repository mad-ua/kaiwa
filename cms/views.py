from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from conversation.mongo import TasksStorage


storage = TasksStorage()


@login_required
def dashboard(request):
    user_tasks = storage.get_user_tasks(request.user.id)
    return render(request, 'cms/dashboard.html', {'user_tasks': user_tasks})


@login_required
def editor(request, task_name):
    task_data = storage.get_user_task(request.user.id, task_name)
    return render(request, 'cms/task_editor.html', {"task_data": task_data})


@login_required
def update_task(request):
    task_data = request.POST.get('task_data')
    if not task_data:
        return JsonResponse({'error': 'Improperly configured'}, status=400)
    else:
        storage.upsert_conversation(request.user.id, task_data)
        return JsonResponse({'status': 'ok'}, status=200)
