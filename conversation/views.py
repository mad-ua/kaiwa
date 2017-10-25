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
    '''
    Return HTML template with chat initialization functions, css and so on.
    :param request: request
    :param args: no args
    :param kwargs: {'graded_task': ..., 'task_id': ...}
    :return: HTML response
    '''
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
    '''
    Return CT graph converted to needed format that JS chat can understand and correctly handle.
    :param request: django request
    :param args: no args
    :param kwargs: {'task_id': r'\w+'}
    :return: converted graph for chat as JSON
    '''
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )
    chat_data = TaskConverter(task_data).convert()
    return JsonResponse(chat_data)


def get_tree_graph(request, *args, **kwargs):
    '''
    Return CT graph converted to needed format that JS plugin which show diagram can understand and correctly handle.
    :param request: django request
    :param args: no args
    :param kwargs: {'task_id': r'\w+'}
    :return: converted graph for gojs as JSON
    '''
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        task_data = json.load(
            open(os.path.join(settings.BASE_DIR, '../conversation', 'static', 'tree_fixture.json'))
        )
    chat_data = TaskConverter(task_data).convert_graph()
    return JsonResponse(chat_data)


def chat_history(request, task_id):
    '''
    Store message in graded_history collection when receive PUT request and return all user history for this CT
    :param request: django request
    :param task_id: task_id
    :return: json with status
    '''
    if request.method in ('POST', 'PUT'):
        data = json.loads(request.body)
        if not data:
            return JsonResponse(data=data, safe=False)
        messages = graded_history_storage.store_messages(user_id=request.user.id, task_id=task_id, messages=data)
        return JsonResponse(data=messages, safe=False)
    messages = graded_history_storage.get_chat_history(request.user.id, task_id, actual=True).get('messages', [])
    return JsonResponse(data=messages, safe=False)


def update_score(request, graded_task_id, msg_id=0):
    '''
    This function store message and updates scores for corresponding KC.

    :param request: django request
    :param graded_task_id: task_id
    :param msg_id: msg_id
    :return: stored message
    '''
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
        data,
        relies_to_msg_id,

    )
    graded_history_storage.store_messages(user_id=request.user.id, task_id=graded_task_id, messages=message_data)

    # Update score.
    if data['score']:
        if not data['kc'] and len(task['KC management']) == 1:
            # if no kc passed and only one KC present in KC Management section - use this KC as default.
            data['kc'] = list(task['KC management'].keys())[0]

        graded_history_storage.update_user_task_score(request.user.id, graded_task_id, data['score'], data['kc'])

        # Sending score to lti
        #
        # graded_task = get_object_or_404(GradedTask, id=graded_task_id)
        # send_score_update(graded_task, score)

    return JsonResponse({'status': 'ok', 'addMessages': [message_data]},   status=200)


def get_chat_status(request, task_id):
    '''
    Return conversation talk results.
    Doing all needed checks inside of calculate_user_kc_scores func.
    :param request: django request
    :param task_id: task_id
    :return:
    '''
    converter = TaskConverter({})
    d = converter.convert_results_message(graded_history_storage.calculate_user_kc_scores(request.user.id, task_id))
    return JsonResponse(data=d, safe=False)

@login_required
def reset_user_task_score(request,  *args, **kwargs):
    '''
    When user reloads page this function will be called.
    It will mark all history for this user-task as not actual.
    :param request: django request
    :param args: no args
    :param kwargs: {'task_id': r'\w*'}
    :return: json with status
    '''
    task_id = kwargs.get('task_id')
    task_data = tasks_storage.get_task(task_id)
    if not task_data:
        return JsonResponse({'status': 'err'}, status=400)
    graded_history_storage.reset_user_task_score(request.user.id, task_data['task_id'])
    return JsonResponse({'status': 'ok'}, status=200)
