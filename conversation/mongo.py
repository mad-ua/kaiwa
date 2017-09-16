import pymongo

from django.conf import settings


class MongoBase:
    DB_DATA = settings.DB_DATA
    conn = pymongo.MongoClient(settings.MONGO_HOST)

    @property
    def db(self):
        return self.conn[self.DB_DATA]


class TasksStorage(MongoBase):
    COLLECTION_CONVERSATION = 'conversation'

    @property
    def conversations(self):
        return self.db[self.COLLECTION_CONVERSATION]

    def get_user_tasks(self, user_id):
        """
        Get all conversation tasks for particular user.
        """
        return self.conversations.find(
            {"user_id": user_id, "task_name": {"$exists": True}},
            projection={'_id': 0}
        )

    def get_user_task(self, user_id, task_name):
        """
        Get particular conversation task for particular user.
        """
        return self.conversations.find_one(
            {"user_id": user_id, 'task_name': task_name},
            projection={'_id': 0}
        )

    def upsert_conversation(self, user_id, task_data):
        user_task = self.conversations.update(
            {'user_id': user_id, 'task_name': task_data.get('task_name')},
            task_data,
            upsert=True
        )
