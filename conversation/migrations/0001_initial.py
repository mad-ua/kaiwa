# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-09-05 20:05
from __future__ import unicode_literals

import conversation.utils
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Advicer',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(choices=[('g', 'Freshman'), ('b', 'Sophomore')], default='b', max_length=2)),
            ],
        ),
        migrations.CreateModel(
            name='Edge',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('rethink', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Response',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('task_id', models.CharField(default=conversation.utils.task_id_def, max_length=32, unique=True)),
                ('is_public', models.BooleanField(default=False)),
                ('start_node', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='conversation.Node')),
            ],
        ),
        migrations.AddField(
            model_name='edge',
            name='feedbacks',
            field=models.ManyToManyField(to='conversation.Feedback'),
        ),
        migrations.AddField(
            model_name='edge',
            name='output_node',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='conversation.Node'),
        ),
        migrations.AddField(
            model_name='edge',
            name='response',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='conversation.Response'),
        ),
        migrations.AddField(
            model_name='edge',
            name='source_node',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='edges', to='conversation.Node'),
        ),
        migrations.AddField(
            model_name='advicer',
            name='feedbacks',
            field=models.ManyToManyField(to='conversation.Feedback'),
        ),
    ]
