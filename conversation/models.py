import json

from django.db import models
from django.contrib.auth import get_user_model

from identity.models import Organization
from .utils import task_id_def


User = get_user_model()


class Task(models.Model):
    """
    Conversational Task.
    """
    name = models.CharField(max_length=64)
    task_id = models.CharField(max_length=32, unique=True, default=task_id_def)
    is_public = models.BooleanField(default=False)
    start_node = models.ForeignKey('Node')
    organization = models.ForeignKey(
        Organization, null=True, blank=True, related_name='tasks'
    )
    user = models.ForeignKey(User, blank=True, null=True)

    @property
    def serialized(self):
        """
        For the DEMO purposes temporary create MongoDB like document.
        """
        start_node = self.start_node
        start_edges = start_node.edges.all()
        document = {'tree': {'nodes': {}}, 'start_node_id': start_node.id}
        nodes = document['tree']['nodes']
        nodes_queue = [start_node]
        passed_nodes = set()
        while nodes_queue:
            try:
                node = nodes_queue.pop()
                if node not in passed_nodes:
                    nodes[node.id] = node.serialized
                    nodes_queue.extend([i.output_node for i in node.edges.all()])
                    passed_nodes.add(node)
            except IndexError:
                pass
        try:
            result = json.dumps(document)
        except Exception:
            result = {"msg": "Task can't be serialized"}
        finally:
            return result

    def __str__(self):
        return '{}:{}'.format(self.name, self.task_id)


class Node(models.Model):
    """
    Conversational Task Node.
    """
    text = models.TextField()

    @property
    def is_final(self):
        return not self.edges.all().exists()

    @property
    def serialized(self):
        """
        Naive serializations.
        """
        node = {
            "input": {
                "type": "options",
                "options": None
            },
            "addMessages": [
                {
                    "id": self.id,
                    "type": "message",
                    "name": "alex",
                    "userMessage": False,
                    "avatar": None,
                    "html": self.text
                }
            ]
        }
        edges = self.edges.all()
        node['input']['options'] = [edge.serialized for edge in edges]
        return node


    def __str__(self):
        return self.text


class Edge(models.Model):
    """
    Conversational Task Edge.

    It links Nodes, define CResponse.
    """
    source_node = models.ForeignKey('Node', related_name='edges')
    output_node = models.ForeignKey('Node', on_delete=models.PROTECT)
    response = models.ForeignKey('Response')
    feedbacks = models.ManyToManyField('Feedback')

    @property
    def serialized(self):
        edge = {
            "text": self.response.text,
            "value": self.output_node.id,
        }
        if self.feedbacks.exists:
            edge['bots'] = [
                feedback.serialize(prev_node=self.source_node)
                for feedback in self.feedbacks.all()
            ]
        return edge


    def __str__(self):
        return '{}->{}'.format(self.source_node, self.output_node)


class Response(models.Model):
    """
    Conversational Task Response.
    """
    text = models.TextField()

    def __str__(self):
        return self.text


class Advicer(models.Model):
    """
    Conversational Task Bot.
    """
    GOOD = 'g'
    BAD = 'b'
    ADVICER_CATEGORIES = (
        (GOOD, 'Good bot'),
        (BAD, 'Bad bot'),
    )

    category = models.CharField(
        max_length=2,
        choices=ADVICER_CATEGORIES,
        default=BAD
    )
    feedbacks = models.ManyToManyField('Feedback')

    def __str__(self):
        return self.category


class Feedback(models.Model):
    text = models.TextField()
    rethink = models.BooleanField(default=False)

    def serialize(self, prev_node):
        feedback = {
            "addMessages": [
                {
                  "id": self.id,
                  "type": "message",
                  "name": "BOT 1",
                  "userMessage": False,
                  "avatar": "/static/img/bot.png",
                  "html": self.text
                }
            ]
        }
        if self.rethink:
            feedback['reanswering'] = True
            feedback['input']: {
                "type": "options",
                "url": prev_node.id,
                "options": [
                {
                  "text": "Yes",
                },
                {
                  "text": "No",
                }]
            }
        return feedback

    def __str__(self):
        return self.text
