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


class Node(models.Model):
    """
    Conversational Task Node.
    """
    text = models.TextField()

    @property
    def final(self):
        return not self.edges.all().exists()


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
