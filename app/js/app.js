/**
 * Created by Devid on 2017/1/12.
 */

var app = angular.module('myApp', []);

/* controllers */

app.controller("systemListController", ['$scope',
    function systemListController($scope) {
        $scope.systems = [{name: "sys1"}, {name: "sys2"}];
    }]);


//directives


app.directive("systemEditor", [function () {

    return {
        restrict: "E",
        templateUrl: "../app/system_editor/system_editor.html"
    }
}]);

app.directive("systemList", [function () {
    return {
        restrict: "E",
        templateUrl: "../app/system_editor/system_list.html"
    }
}]);

app.directive("systemInfo", [function () {
    return {
        restrict: "E",
        templateUrl: "../system_editor/system_info.html"
    }
}]);

app.directive("agentList", [function () {
    return {
        restrict: "E",
        templateUrl: "../system_editor/agent_list.html"
    }
}]);

app.directive("agentInfo", [function () {
    return {
        restrict: "E",
        templateUrl: "../system_editor/agent_info.html"
    }
}]);

app.directive("particleList", [function () {
    return {
        restrict: "E",
        templateUrl: "../system_editor/particle_list.html"
    }
}]);

app.directive("particleInfo", [function () {
    return {
        restrict: "E",
        templateUrl: "../system_editor/particle_info.html"
    }
}]);