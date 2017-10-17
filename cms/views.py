import os
import json

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.templatetags.static import static
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, get_object_or_404
from django.conf import settings
from django.shortcuts import redirect
from django.urls import reverse

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
    task_id = task_data['task_id']
    if not task_data:
        return JsonResponse({'error': 'Improperly configured'}, status=400)
    else:
        storage.upsert_conversation(task_id, task_data)
        return JsonResponse({'status': 'ok'}, status=200)


@csrf_exempt
def create_task(request):
    task = Task(
        name='dummy',
        organization=request.user.organization,
        user=request.user,
        start_node_id=1
    )
    task.save()
    task_data = {
      "CT Name": "",
      "KC management": {
        "KC 1": {
          "Name": "",
          "Weight": 1
        }
      },
      "Bot Management": {
        "name": "Bot name",
        "bot_avatar":  static("img/bot.jpg"),
      },
      "Advisers Management": {
          "Adviser 1": {
              "name": "Some adviser",
              "avatar":  static("img/adviser.jpg"),
          }
      },
      "Nodes management": {
        "1": {
          "KC": "",
          "Weight": 1,
          "Messages": {
            "Text": "",
            "Text2": ""
          },
          "Answers": {
            "Option 1": {
              "Text": "",
              "Target": "",
              "Advisers": {
                "Adviser 1": {
                  "Text": "",
                  "Target": ""
                }
              },
              "Score": 0
            },
            "Option 2": {
              "Text": "",
              "Target": "",
              "Score": 0,
              "Advisers": {}
            }
          }
        }
      }
    }
    task_data['task_id'] = task.task_id
    storage.upsert_conversation(task.task_id, task_data)
    return redirect(reverse('cms:editor', kwargs={'task_id': task.task_id}))
