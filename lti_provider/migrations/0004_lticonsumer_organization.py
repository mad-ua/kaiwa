# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-05 20:30
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('identity', '0002_auto_20171005_2030'),
        ('lti_provider', '0003_auto_20170920_0917'),
    ]

    operations = [
        migrations.AddField(
            model_name='lticonsumer',
            name='organization',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='identity.Organization'),
        ),
    ]
