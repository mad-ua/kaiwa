from django.contrib import admin

from .models import (
    Task,
    Node,
    Edge,
    Response,
    Advicer,
    Feedback
)


admin.site.register(Task)
admin.site.register(Node)
admin.site.register(Edge)
admin.site.register(Response)
admin.site.register(Advicer)
admin.site.register(Feedback)
