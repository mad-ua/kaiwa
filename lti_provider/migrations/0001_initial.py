# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-09-05 11:31
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import lti_provider.fields
import lti_provider.utils


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LtiConsumer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('consumer_name', models.CharField(max_length=255, unique=True)),
                ('consumer_key', models.CharField(db_index=True, default=lti_provider.utils.token, max_length=32, unique=True)),
                ('consumer_secret', models.CharField(default=lti_provider.utils.token, max_length=32, unique=True)),
                ('instance_guid', lti_provider.fields.CharNullField(blank=True, max_length=255, null=True, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='LtiUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lti_user_id', models.CharField(max_length=255)),
                ('kaiwa_user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('lti_consumer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lti_provider.LtiConsumer')),
            ],
        ),
        migrations.AlterUniqueTogether(
            name='ltiuser',
            unique_together=set([('lti_consumer', 'lti_user_id')]),
        ),
    ]
