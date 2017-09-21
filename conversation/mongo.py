import pymongo

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

    def get_user_tasks(self, user_id):
        """
        Get all conversation tasks for particular user.
        """
        return self.collection.find(
            {"user_id": user_id, "task_id": {"$exists": True}},
            projection={'_id': 0}
        )

    def get_task(self, task_id):
        """
        Get particular conversation task.
        """
        return self.collection.find_one(
            {'task_id': task_id},
            projection={'_id': 0}
        )

    def get_user_task(self, user_id, task_id):
        """
        Get particular conversation task for particular user.
        """
        return self.collection.find_one(
            {"user_id": user_id, 'task_id': task_id},
            projection={'_id': 0}
        )

    def upsert_conversation(self, user_id, task_data):
        user_task = self.collection.update(
            {'user_id': user_id, 'task_id': task_data.get('task_id')},
            task_data,
            upsert=True
        )


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
