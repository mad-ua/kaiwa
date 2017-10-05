class TaskConverter:
    def __init__(self, data):
        self.data = data

    def convert_graph(self):
        self.graph = {
                    "class": "go.GraphLinksModel",
                    "nodeKeyProperty": "id",
                    "nodeDataArray": [],
                    "linkDataArray": []
                }
        for i in self.data.get('situations'):
            situation = self.data.get('situations')[i]
            self.convert_situation_graph(i, situation)
        return self.graph

    def convert(self):
        result = {'tree': {'nodes': {}}}
        result['tree']['start_node'] = self.data.get('start_situation')
        for i in self.data.get('situations'):
            situation = self.data.get('situations')[i]
            result['tree']['nodes'][i] = self.convert_situation(situation)
        return result

    def convert_situation(self, situation):
        """
        Convert particular situation to actual node.
        """
        node = {
            "input": {
                "type": "options",
                "url": "0",
                "options": []
            },
            "addMessages": []
        }
        for i in situation.get('messages', ()):
            node['addMessages'].append(self.convert_message(i))
        if not situation.get('outcomes'):
            node['input']['options'].append(
                {'text': 'To start', 'value': self.data.get('start_situation')}
            )
        else:
            for i in situation.get('outcomes'):
                node['input']['options'].append(self.convert_outcome(i))
        return node

    def convert_situation_graph(self, id, situation):
        """
        Convert to Graph representation.
        """
        self.graph['nodeDataArray'].append(
            {"id": id, "text": situation.get('messages')[0].get('text')}
        )
        for i in situation.get('outcomes', ()):
            self.graph['linkDataArray'].append({
                "from": id, "to": i.get('target'), "text": i.get('text')
            })

    def convert_message(self, message):
        """
        Convert Message.
        """
        return {
            "id": 0,
            "type": "message",
            "name": message.get('name'),
            "userMessage": False,
            "avatar": "/avatar.jpg",
            "html": message.get('text')
        }

    def convert_outcome(self, outcome):
        """
        Convert Edge/Outcome.
        """
        edge = {
            "text": outcome.get('text'),
            "value": outcome.get('target'),
        }
        return edge

    def convert_feedback(self, feedback):
        """
        Convert Feedback aka adviser.
        """
        feedback = {
            "addMessages": [
                {
                  "id": "0",
                  "type": "message",
                  "name": "BOT 1",
                  "userMessage": False,
                  "avatar": None,
                  "html": 'test'
                }
            ]
        }
        return feedback
