from django import template


register = template.Library()

@register.filter
def get(obj, key=None):
    return obj.get(key)
