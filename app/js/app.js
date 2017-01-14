/**
 * Created by Devid on 2017/1/12.
 */


var app = angular.module('myApp', []);

/* controllers */

app.controller("systemEditorController", ['$scope',
    function ($scope) {
        $scope.systems = [];
        $scope.selcted_system = null;

    }]);


//directives


app.directive("systemEditor", [function () {
    return {
        restrict: "E",
        templateUrl: "app/system_editor/system_editor.html"
    }
}]);

app.directive("systemList", ["$rootScope", function ($rootScope) {
    function link(scope, element, attrs) {
        scope.new_sys_count = 1;

        scope.add_system = function () {
            var sys = new_system();
            sys.name = "system" + scope.new_sys_count;
            scope.new_sys_count++;
            scope.systems.push(sys);
        }

        scope.select = function (d) {
            $rootScope.$broadcast("SELECT_SYS", d);
        }
    }

    return {
        scope: {
            systems: "="
        },
        restrict: "E",
        templateUrl: "app/system_editor/system_list.html",
        link: link
    }
}]);

app.directive("systemInfo", [function () {
    function link(scope, element, attrs) {
        scope.system = null;
        scope.$on("SELECT_SYS", function (event, arg) {
            scope.system = arg;
        })
    }

    return {
        scope: {
            system: "="
        },
        restrict: "E",
        templateUrl: "app/system_editor/system_info.html",
        link: link
    }
}]);

app.directive("agentList", [function () {
    function link(scope, element, attrs) {
        scope.add_new_agent=function(){

        }
    }
    return {
        scope:{
            system:"="
        },
        restrict: "E",
        templateUrl: "app/system_editor/agent_list.html",
        link: link
    }
}]);

app.directive("agentInfo", [function () {
    return {
        restrict: "E",
        templateUrl: "app/system_editor/agent_info.html"
    }
}]);

app.directive("particleList", [function () {
    function link(scope, element, attrs) {
        scope.add_particle = function () {
            var np = new_particle();
            scope.system.particle_descriptions.push(np);
            scope.system.particle_list[np.name] = 0;
        }
    }

    return {
        scope: {
            system: "="
        },
        restrict: "E",
        templateUrl: "app/system_editor/particle_list.html",
        link: link

    }
}]);

app.directive("particleInfo", [function () {
    return {
        restrict: "E",
        templateUrl: "app/system_editor/particle_info.html"
    }
}]);

app.directive("hoverInput", ["$timeout",function ($timeout) {

    function link(scope, element, attrs) {

        scope.dtext="";
        $timeout(function(){
            scope.dtext=scope.text;
        })
        scope.hover = false;
        console.log(element)
        scope.element = element[0];
        scope.inputDOM = element[0].querySelector(".hover-input-textbox");
        scope.textDOM = element[0].querySelector(".hover-input-text");


        console.log(scope.textDOM.offsetWidth, scope.textDOM.offsetHeight)
        console.log(scope.inputDOM, scope.textDOM);
        scope.container_style = {
            height: "auto",
            width: "auto",
        };
        if (typeof scope.color==="undefined"){
            scope.color="#101010";
        }
        if (typeof scope.fontsize=="undefined"){
            scope.fontsize="26px"
        }
        console.log(scope.color, scope.fontsize)
        scope.style = {
            color: scope.color,
            "font-size": scope.fontsize+" !important",
            "border-width": "0",
            "font-family": "\"Segoe UI\", \"Open Sans\", sans-serif, serif",
            "font-weight": "400",
            height: "auto",
            width: "auto",
            "background-color":"rgba(255,255,255,0)",
            "white-space": "nowrap",
        }
        function match_size() {

            scope.style["width"] = scope.textDOM.offsetWidth + 6 + "px";
            scope.style["height"] = scope.textDOM.offsetHeight + 4 + "px";
        }
        function match_container_size(){

            scope.container_style["width"] = scope.style["width"];
            scope.container_style["height"] = scope.style["height"];
        }
        scope.change=function(){

        }

        scope.match = match_size;

        match_size();
        match_container_size();
        scope.focus = function () {
            match_size();

        }
        scope.mouseover = function () {
            match_size();
            scope.hover = true;
            $timeout(function(){

                scope.inputDOM.focus();
            })
            console.log("mousover")
        }
        scope.mouseleave = function () {
            scope.hover = false;
            var temp=scope.text;

            scope.text=scope.dtext;
            match_container_size();

            if (typeof scope.onChangeCallback!=="undefined"){
                scope.onChangeCallback({old:temp, new:scope.text});
            }

            console.log("mouseleave")
        }
    }

    return {
        scope: {
            text: "=",
            onChangeCallback:"=",
            fontsize:"=",
            color:"="
        },
        restrict: "E",
        templateUrl: "app/template/hover_input.html",
        link: link
    }
}]);