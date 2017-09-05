from django.db import models

from .utils import task_id_def


class Task(models.Model):
    """
    Conversational Task.
    """
    name = models.CharField(max_length=64)
    task_id = models.CharField(max_length=32, unique=True, default=task_id_def)
    is_public = models.BooleanField(default=False)
    start_node = models.ForeignKey('Node')

    def convert_to_document(self):
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
        return document


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
        # TODO add options (Edges), bots (Feedbacks)
        return {
            "input": {
                "type": "options",
                "options": []
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


class Edge(models.Model):
    """
    Conversational Task Edge.

    It links Nodes, define CResponse.
    """
    source_node = models.ForeignKey('Node', related_name='edges')
    output_node = models.ForeignKey('Node', on_delete=models.PROTECT)
    response = models.ForeignKey('Response')
    feedbacks = models.ManyToManyField('Feedback')


class Response(models.Model):
    """
    Conversational Task Response.
    """
    text = models.TextField()


class Advicer(models.Model):
    """
    Conversational Task Bot.
    """
    GOOD = 'g'
    BAD = 'b'
    ADVICER_CATEGORIES = (
        (GOOD, 'Freshman'),
        (BAD, 'Sophomore'),
    )

    category = models.CharField(
        max_length=2,
        choices=ADVICER_CATEGORIES,
        default=BAD
    )
    feedbacks = models.ManyToManyField('Feedback')


class Feedback(models.Model):
    text = models.TextField()
    rethink = models.BooleanField(default=False)
