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
        for i in self.data.get('Nodes management'):
            situation = self.data.get('Nodes management')[i]
            self.convert_situation_graph(i, situation)
        return self.graph

    def convert(self):
        result = {'tree': {'nodes': {}}}
        result['tree']['start_node'] = "1"
        for i in self.data.get('Nodes management'):
            situation = self.data.get('Nodes management')[i]
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
        for i in situation.get('Messages', ()):
            node['addMessages'].append(
                self.convert_message(situation.get('Messages')[i])
            )
        if not situation.get('Answers'):
            node['input']['options'].append(
                {'text': 'To start', 'value': "1"}
            )
        else:
            for i in situation.get('Answers'):
                node['input']['options'].append(
                    self.convert_outcome(situation.get('Answers')[i])
                )
        return node

    def convert_situation_graph(self, id, situation):
        """
        Convert to Graph representation.
        """
        self.graph['nodeDataArray'].append(
            {"id": id, "text": situation.get('Messages')['Text']}
        )
        for i in situation.get('Answers', ()):
            self.graph['linkDataArray'].append({
                "from": id, "to": situation.get('Answers')[i].get('Target'), "text": situation.get('Answers')[i].get('Text')
            })

    def convert_message(self, message):
        """
        Convert Message.
        """
        return {
            "id": 0,
            "type": "message",
            "name": "Name",
            "userMessage": False,
            "avatar": "/avatar.jpg",
            "html": message
        }

    def convert_outcome(self, outcome):
        """
        Convert Edge/Outcome.
        """
        print(outcome)
        edge = {
            "text": outcome.get('Text'),
            "value": outcome.get('Target'),
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
