from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    organization = models.ForeignKey('Organization', null=True, blank=True)


class Organization(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name
