import os
import json

from django.http.response import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.urls import reverse
from conversation.mongo import GradedHistoryStorage

from lti_provider.models import GradedTask
from lti_provider.outcomes import send_score_update
from .models import Task
from .mongo import TasksStorage
from .converters import TaskConverter

tasks_storage = TasksStorage()
graded_history_storage = GradedHistoryStorage()

@login_required
def chat_view(request, *args, **kwargs):
    graded_task = kwargs.get('graded_task')
    graded_task_id = graded_task.id if graded_task else None
    task_id = kwargs.get('task_id')
    tree_url = reverse('get_tree', kwargs={'task_id': task_id})
    return render(
        request,
        'main_view.html',
        {
            'tree_url': tree_url,
            'task_id': task_id,
            'grading_url': reverse('update_score', kwargs={'graded_task_id': task_id})   # graded_task_id
        }
    )


def get_tree(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )

    # if task_id and task_id != 'None':
    #     task = get_object_or_404(Task, task_id=task_id)
    #     task_data['user_id'] = request.user.id
    #     task_data['task_id'] = task_id
    #     task_data['task_name'] = task.name
    chat_data = TaskConverter(task_data).convert()
    return JsonResponse(chat_data)


def get_tree_graph(request, *args, **kwargs):
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )
    # if task_id and task_id != 'None':
    #     task = get_object_or_404(Task, task_id=task_id)
    #     task_data['user_id'] = request.user.id
    #     task_data['task_id'] = task_id
    #     task_data['task_name'] = task.name
    chat_data = TaskConverter(task_data).convert_graph()

    return JsonResponse(chat_data)


def chat_history(request, task_id):
    if request.method in ('POST', 'PUT'):
        print("CHAT HISTORY")
        data = json.loads(request.body)
        graded_history_storage.store_messages(user_id=request.user.id, task_id=task_id, messages=data)
        return JsonResponse(data=data, safe=False)
    messages = graded_history_storage.get_chat_history(request.user.id, task_id, actual=True).get('messages', [])
    return JsonResponse(data=messages, safe=False)


def update_score(request, graded_task_id, msg_id=0):
    data = json.loads(request.body)

    try:
        score = float(request.GET.get('score') or data.get('score') or 0)
    except Exception as e:
        return JsonResponse({'status': 'err'}, status=400)
    if score < 0 or score > 1:
        return JsonResponse({'status': 'err'}, status=400)

    # graded_task = get_object_or_404(GradedTask, id=graded_task_id)
    # send_score_update(graded_task, score)
    task = tasks_storage.get_task(graded_task_id)
    if data.get('kc') and data.get('score') and not task.get('KC management', {}).get(data['kc']):
        return JsonResponse({'status': 'err', 'msg': 'no such kc'}, status=400)

    # Firstly save message for history.
    relies_to_msg_id = graded_history_storage.get_last_message_id(request.user.id, task_id=graded_task_id)

    converter = TaskConverter({})
    message_data = converter.convert_user_message(
        request.user,
        # data['text'],
        data,
        relies_to_msg_id,

    )
    graded_history_storage.store_messages(user_id=request.user.id, task_id=graded_task_id, messages=message_data)

    # Update score.
    if data['score']:
        if not data['kc'] and len(task['KC management']) == 1:
            # if no kc passed and only one KC present in KC Management section - use this KC as default.
            data['kc'] = task['KC management'].keys()[0]

        graded_history_storage.update_user_task_score(request.user.id, graded_task_id, data['score'], data['kc'])

        # Sending score to lti
        #
        # graded_task = get_object_or_404(GradedTask, id=graded_task_id)
        # send_score_update(graded_task, score)

    return JsonResponse({'status': 'ok', 'addMessages': [message_data]},   status=200)


def get_chat_status(request, task_id):
    converter = TaskConverter({})
    d = converter.convert_results_message(graded_history_storage.calculate_user_kc_scores(request.user.id, task_id))
    return JsonResponse(data=d, safe=False)

@login_required
def reset_user_task_score(request,  *args, **kwargs):
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        return JsonResponse({'status': 'err'}, status=400)
    graded_history_storage.reset_user_task_score(request.user.id, task_data['task_id'])
    return JsonResponse({'status': 'ok'}, status=200)
