'use strict';

var app = angular.module('exampleApp', ['JSONedit']);

function MainViewCtrl($scope, $filter, $http) {

    // example JSON
    $scope.jsonData = {};

    $scope.$watch('jsonData', function(json) {
        console.log(json);
        $scope.jsonString = $filter('json')(json);
    }, true);
    $scope.$watch('jsonString', function(json) {
        try {
            $scope.jsonData = JSON.parse(json);
            $scope.wellFormed = true;
            update_data(json);
        } catch(e) {
            $scope.wellFormed = false;
        }
    }, true);
    function update_data(json){
      $http.post("/cms/task/update/", {task_data: json})
        .then(function(response){ console.log(response); });
    }
}
