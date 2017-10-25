import random
from django.templatetags.static import static


class TaskConverter:
    ADVISER_MSG_ID_INTERVAL = (10000, 30000)
    MSG_ID_INTERVAL = (0, 10000)

    FINAL_MESSAGE_TEMPLATE = """You just finished this task and here are your results:<br><br><br>
    <table class="table">
    <tr>
    <td>Total score for this conversational task</td>
    <td><b>{conversational_task_score}</b></td>
    </tr>
    {kc_scores}
    </table>
    """
    FINAL_MSG_KC_SCORE_TEMPLATE = """<tr><td>{kc_name}</td><td>{kc_score}</td></tr>
    """
    def __init__(self, data):
        self.data = data

    def convert_graph(self):
        self.graph = {
                    "class": "go.GraphLinksModel",
                    "nodeKeyProperty": "id",
                    "nodeDataArray": [],
                    "linkDataArray": []
                }
        for i in sorted(self.data.get('Nodes management'), reverse=True):
            situation = self.data.get('Nodes management')[i]
            self.convert_situation_graph(i, situation)
        return self.graph

    def convert(self):
        result = {'tree': {'nodes': {}}}
        result['tree']['start_node'] = "1"
        for i in self.data.get('Nodes management'):
            situation = self.data.get('Nodes management')[i]
            result['tree']['nodes'][i] = self.convert_situation(situation, id=i)
        return result

    def convert_situation(self, situation, id=0):
        """
        Convert particular situation to actual node.
        """
        node = {
            "input": {
                "type": "options",
                "url": "0",
                "options": [],
                "kc": situation.get('KC'),
                "weight": situation.get('Weight')
            },
            "addMessages": [],
        }
        for i in situation.get('Messages', ()):
            node['addMessages'].append(
                self.convert_message(situation.get('Messages')[i], id=id)
            )
        if not situation.get('Answers'):
            node['input']['options'].append(
                {'text': 'To start', 'value': "1", 'resetChat': 1}
            )
        else:
            for i in situation.get('Answers'):
                node['input']['options'].append(
                    self.convert_outcome(situation.get('Answers')[i], situation.get('Weight'), situation.get('KC'))
                )
        return node

    def convert_situation_graph(self, id, situation):
        """
        Convert to Graph representation.
        """
        self.graph['nodeDataArray'].append(
            {"id": id, "text": situation.get('Messages', {}).get('Text')}
        )
        for i in situation.get('Answers', ()):
            self.graph['linkDataArray'].append({
                "from": id,
                "to": situation.get('Answers')[i].get('Target'),
                "text": situation.get('Answers')[i].get('Text')
            })

    def convert_message(self, message, id):
        """
        Convert Message.
        """
        return {
            "id": int(id), #random.randint(*self.MSG_ID_INTERVAL),
            "type": "message",
            "name": "Name",
            "userMessage": False,
            "avatar": static("img/adviser.jpg"),
            "html": message,
        }

    def convert_user_message(self, user, message, relies_to_msg_id):
        """Convert message received from user.
        """
        return {
            "id": random.randint(*self.MSG_ID_INTERVAL),
            "type": "message",
            "name": user.username,
            "userMessage": True,
            "avatar": static("img/avatar-student.jpg"),
            "html": message['text'],
            "relies_to_msg_id": relies_to_msg_id,
            "kc": message.get('kc'),
            "node_score": int(message['score'] or 0),
            # "weight": message['weight'],
            "next_node_id": message['option'],
        }

    def convert_outcome(self, outcome, weight=1, kc=''):
        """
        Convert Edge/Outcome.
        """
        edge = {
            "text": outcome.get('Text'),
            "value": outcome.get('Target'),
            "score": outcome.get('Score') or 1,
            "weight": weight,
            "kc": kc,
        }
        advisers = outcome.get('Advisers')
        if advisers:
            edge['bot'] = self.convert_feedback(advisers)
        return edge

    def convert_feedback(self, feedbacks):
        """
        Convert Feedback aka adviser.

        Simple bot acts like this - just post message to chat. Use this json:
        {
          "addMessages": [
            {
              "id": 1,
              "type": "message",
              "name": "BOT 1",
              "userMessage": false,
              "avatar": "/static/img/bot.png",
              "html": "What is your answer???"
            }
          ]
        }
        Bot can ask user to re-answer for a question:
        {
            "reanswering": true,
            "input": {
              "type": "options",
              "url": "59",
              "options": [
                {
                  "text": "Yes",
                  "value": "52"
                },
                {
                  "text": "No",
                  "value": "53"
                }]
              },
            "addMessages": [
              {
                "id": 5201,
                "type": "message",
                "name": "BOT 1",
                "userMessage": false,
                "avatar": "/static/img/bot.png",
                "html": "Do you want to re-answer for a last question??"
              }
            ]
        }
        """
        bot = {}
        bot['addMessages'] = []
        advisers_obj = self.data['Advisers Management']
        for name, adviser_obj in advisers_obj.items():
            opt_adviser = feedbacks.get(name)
            if opt_adviser:
                bot['addMessages'].append({
                  "id": random.randint(*self.ADVISER_MSG_ID_INTERVAL),
                  "type": "message",
                  "name": "{}".format(adviser_obj['Name']),
                  "userMessage": False,
                  "avatar": adviser_obj['Avatar'],
                  "html": opt_adviser.get("Text")
                })
                if opt_adviser.get('Target'):
                    bot["reanswering"] = True
                    bot['input'] = {
                        "type": "options",
                        "url": opt_adviser['Target'],
                        "options": [
                        {
                          "text": opt_adviser.get('Button Text') or 'OK',
                          "value": opt_adviser.get('Target')
                        }]
                    }
                    if opt_adviser.get('Answers'):  # Answers is a list of option objects.
                        bot['input']['options'] = [
                            {'text': i['Text'], 'value': i['Target']} for i in opt_adviser['Answers']
                        ]
        return bot

    def convert_results_message(self, results_data):
        scores_html = "".join([
            self.FINAL_MSG_KC_SCORE_TEMPLATE.format(kc_name=kc_name, kc_score=kc_score)
            for kc_name, kc_score in results_data['kc_scores'].items()
        ])
        res_html = self.FINAL_MESSAGE_TEMPLATE.format(
            conversational_task_score=results_data['conversational_task_score'],
            kc_scores=scores_html
        )
        msg = [{
            'id': random.randint(*self.ADVISER_MSG_ID_INTERVAL),
            "type": "message",
            "name": "Name",
            "userMessage": False,
            "avatar": None,
            "html": res_html
        }]
        return {"addMessages": msg}
