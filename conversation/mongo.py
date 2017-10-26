from datetime import datetime
import pymongo
import datetime

from django.conf import settings


class MongoBase:
    DB_DATA = settings.DB_DATA
    conn = pymongo.MongoClient(settings.MONGO_HOST)
    COLLECTION_NAME = 'data'

    @property
    def db(self):
        return self.conn[self.DB_DATA]

    @property
    def collection(self):
        return self.db[self.COLLECTION_NAME]


class TasksStorage(MongoBase):
    COLLECTION_NAME = 'conversation'

    def get_tasks(self, tasks_ids):
        """
        Get all conversation tasks for particular user.
        """
        # TODO avoid task_id in result
        return self.collection.find(
            {"task_id": {"$in": tasks_ids}}, projection={"_id": 0}
        )

    def get_task(self, task_id):
        """
        Get particular conversation task.
        """
        return self.collection.find_one(
            {'task_id': task_id},
            projection={"_id": 0}
        )

    def get_user_task(self, user_id, task_id):
        """
        Get particular conversation task for particular user.
        """
        return self.collection.find_one(
            {"user_id": user_id, 'task_id': task_id},
            projection={'_id': 0, 'user_id': 0}
        )

    def upsert_conversation(self,  task_id, task_data):
        user_task = self.collection.update(
            {'task_id': task_id}, task_data, upsert=True
        )


class GradedHistoryStorage(MongoBase):
    COLLECTION_NAME = 'graded_history'

    ALLOWED_HISTORY_MESSAGE_FIELDS = (
        'id',
        'type',
        'name',
        'userMessage',
        'node_score',
        'avatar',
        'html',
        'ts',
        'kc',
        'relies_to_msg_id',
        'next_node_id',
        'weight',
    )

    def filter_history_fields(self, msg):
        return {k: v for k, v in msg.items() if k in self.ALLOWED_HISTORY_MESSAGE_FIELDS}


    def store_messages(self, user_id, task_id, messages):
        """Store message in DB.
        :param user_id: int
        :param task_id: str (Mongo ObjectId)
        :param message: str
        """
        if isinstance(messages, (list, tuple)):
            messages = [self.filter_history_fields(msg) for msg in messages]
            update_cmd = {'$push': {'messages': {'$each': messages}}}
            for message in messages:
                message['ts'] = datetime.datetime.utcnow()
        else:
            messages = self.filter_history_fields(messages)
            update_cmd = {'$push': {'messages': messages}}
            messages['ts'] = datetime.datetime.utcnow()
        self.collection.update(
            {'task_id': task_id, 'user_id': user_id, 'actual': True},
            update_cmd,
            upsert=True
        )
        return messages

    def get_chat_history(self, user_id, task_id, actual=True):
        return self.collection.find_one(
            {'task_id': task_id, 'user_id': user_id, 'actual': actual},
            projection={'_id': 0, 'messages.relies_to_msg_id': 0}
        )


    def update_user_task_score(self, user_id, task_id, score, kc):
        self.collection.update(
            {'task_id': task_id, 'user_id': user_id, 'actual': True},
            {'$inc': {
                "KC." + kc: score
            }},
            upsert=True
        )

    def reset_user_task_score(self, user_id, task_id):
        """Mark all records for user-task as not actual.
        """
        self.collection.update(
            {'task_id': task_id, 'user_id': user_id, 'actual': True},
            {'$set': {'actual': False}}
        )

    def calculate_user_kc_scores(self, user_id, task_id):
        task_storage = TasksStorage()
        task = task_storage.get_task(task_id)
        history = self.collection.find_one({
            'task_id': task_id,
            'user_id': user_id,
            'actual': True,
            'messages.userMessage': True
        }, projection={"_id": 0})

        kc_scores = {}
        kc_node_weights_sum = {kc: 0 for kc in task['KC management'].keys()}

        for kc_name, kc_obj in task['KC management'].items():
            # go though all KC's
            for node_name, node in task['Nodes management'].items():
                # sum node weights by KC
                kc = node.get('KC')
                if kc and kc == kc_name:
                    kc_node_weights_sum[kc] += node.get('Weight', 0)

        for kc in kc_node_weights_sum:
            # history['KC'] contains a sum of all scores for that KC
            if kc_node_weights_sum[kc] != 0:
                kc_scores[kc] = float(history.get('KC', {}).get(kc, 0)) / float(kc_node_weights_sum[kc])
            else:
                kc_scores[kc] = 0

        conversational_task_score = (
            sum([float(score) * float(task['KC management'][name]['Weight']) for name, score in kc_scores.items()
                 if isinstance(task['KC management'][name], dict)])
            /
            sum([float(kc_obj['Weight']) for name, kc_obj in task['KC management'].items()
                if isinstance(task['KC management'][name], dict)])
        )
        return {
            'conversational_task_score': conversational_task_score,
            'kc_scores': {task['KC management'][kc]['Name']: value for name, value in kc_scores.items()},

        }


    def get_last_message_id(self, user_id, task_id):
        resp = self.collection.find_one(
            {'user_id': user_id, 'task_id': task_id, 'actual': True, 'messages.userMessage': False},
            {'messages': {'$slice': -1}
        })
        if resp['messages']:
            return resp['messages'][0]['id']


class DemoStorage(MongoBase):
    COLLECTION_NAME = 'demo'

    def get_demo(self):
        """
        Get particular conversation task.
        """
        demo = self.collection.find_one(
            {"name": "demo"}, projection={'_id': 0, "name": 0}
        )
        return demo.get('data')

    def set_demo(self, data):
        self.collection.find_one_and_update(
            {"name": "demo"},
            {'$set': {'data': data}},
            upsert=True,
        )
