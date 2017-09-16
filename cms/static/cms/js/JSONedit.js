'use strict';

var app = angular.module('exampleApp', ['JSONedit']);

function MainViewCtrl($scope, $filter) {

    // example JSON
    $scope.jsonData = {
      "tree": {
        "start_node": "199",
        "nodes": {
          "199": {
            "input": {
              "type": "options",
              "url": "1",
              "options": [{
                "text": "Yes",
                "value": "1"
              }, {
                "text": "No",
                "value": "1000",
                "bot": {
                  "reanswering": true,
                  "input": {
                    "type": "options",
                    "url": "url",
                    "options": [
                      {
                        "text": "Yes",
                        "value": "1"
                      },
                      {
                        "text": "No",
                        "value": "1000"
                      }
                  ]},
                  "addMessages": [
                    {
                      "id": 101,
                      "type": "message",
                      "name": "Adviser 1",
                      "userMessage": false,
                      "avatar": "/static/img/adviser.jpg",
                      "html": "But this is very funny! I heard this one before. I reccomend to say 'YES'."
                    }
                  ]
                }
              }]
            },
            "addMessages": [
              {
                "id": 0,
                "type": "message",
                "name": "alex",
                "userMessage": false,
                "avatar": null,
                "html": "Hi! Wanna hear a pazzle about three logicians?"
              }
            ]
          },
          "1": {
            "input": {
              "type": "options",
              "url": "59",
              "options": [
                {
                  "text": "Yes",
                  "value": "100"
                },
                {
                  "text": "I don't know",
                  "value": "52",
                  "bot": {
                    "reanswering": true ,
                    "input": {
                      "type": "options",
                      "url": "59",
                      "options": [
                        {
                          "text": "Yes",
                          "value": "100"
                        },
                        {
                          "text": "I don't know",
                          "value": "53"
                        }]
                      },
                    "addMessages": [
                      {
                        "id": 5201,
                        "type": "message",
                        "name": "BOT 1",
                        "userMessage": false,
                        "avatar": "/static/img/adviser.jpg",
                        "html": "Incorrect. There is a hint. If he does not want a drink he says 'No'. What does he say if he wants a drink?"
                      }
                    ]
                  }
                },
                {
                  "text": "No",
                  "value": "53"
                }
              ]
            },
            "addMessages": [
              {
                "id": 1,
                "type": "message",
                "name": "bot",
                "userMessage": false,
                "avatar": null,
                "html": "<p>Three logicians walk into a bar. The bartender says: 'Does everybody want a drink? </p> <p>The first logician says, 'I don't know.' <p>The second logician says, 'I don't know.'</p> <p>What does the third logician say is he wants a drink?</p>"
              }
            ]
          },



          "53": {
            "input": {
              "type": "options",
              "url": "59",
              "options": [
                {
                  "text": "GO to begin",
                  "value": "199"
                }
              ]
            },
            "addMessages": [
              {
                "id": 53,
                "type": "message",
                "name": "alex",
                "userMessage": false,
                "avatar": null,
                "html": "Incorrect. There is an explanation. The first says \"I don't know\" because he wants a drink, but doesn't know if everybody wants one. If the first didn't want a drink, he would have answered \"No\". Same for the second, he wants a drink but doesn't know if the third wants one. So, the third answers \"Yes\" because he wants a drink"
              }
            ]
          },


          "1000": {
            "input": {
              "type": "options",
              "url": "59",
              "options": [
                {
                  "text": "Go to begin",
                  "value": "199"
                }
              ]
            },
            "addMessages": [
              {
                "id": 54,
                "type": "message",
                "name": "bot",
                "userMessage": false,
                "avatar": null,
                "html": "<img src=\"http://i0.kym-cdn.com/entries/icons/facebook/000/003/617/OkayGuy.jpg\""
              }
            ]
          },



          "100": {
            "input": {
              "type": "options",
              "url": "100",
              "options": [
                {
                  "text": "Go to the begin",
                  "value": "199"
                }
              ]
            },
            "addMessages": [
              {
                "id": 100,
                "type": "message",
                "name": "alex",
                "userMessage": false,
                "avatar": null,
                "html": "Rigth! He understood that his friends want a drink and thus, his answer implies that everyone including himself want a drink. Good Job!"
              }
            ]
          }
        }
      }
    };

    $scope.$watch('jsonData', function(json) {
        $scope.jsonString = $filter('json')(json);
    }, true);
    $scope.$watch('jsonString', function(json) {
        try {
            $scope.jsonData = JSON.parse(json);
            $scope.wellFormed = true;
            console.log(json);
        } catch(e) {
            $scope.wellFormed = false;
        }
    }, true);
}
