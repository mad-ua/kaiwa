from django.contrib import admin

from .models import (
    Task,
    Node,
    Edge,
    Response,
    Advicer,
    Feedback
)


class EdgeAdmin(admin.ModelAdmin):
    filter_horizontal = ('feedbacks',)


class AdvicerAdmin(admin.ModelAdmin):
    filter_horizontal = ('feedbacks',)

admin.site.register(Task)
admin.site.register(Node)
admin.site.register(Edge, EdgeAdmin)
admin.site.register(Response)
admin.site.register(Advicer, AdvicerAdmin)
admin.site.register(Feedback)
