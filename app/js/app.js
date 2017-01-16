/**
 * Created by Devid on 2017/1/12.
 */


var app = angular.module('myApp', []);

/* controllers */


//directives
app.directive("systemDisplay", ["$rootScope", function ($rootScope) {
    function link(scope, element, attrs) {
        scope.system = null;
        scope.show=false;
        scope.on("SYS_DISPLAY", function (system) {
            scope.system = system;
            scope.show=true;
        })

        scope.render = function () {
            update_display_agents(scope.system, displays.agent_view);
            render_display_agents(scope.system, displays.agent_view);
            random_move_agent_display(scope.system, displays.agent_view);
        }

        scope.step=function(){
            step(scope.system);
        };

        scope.autostepping=true;
        scope.start_stepping=function(){
            scope.autostepping=true;
        };
        scope.pause_stepping=function(){
            scope.autostepping=false;
        };
        scope.hide=function(){
            scope.show=false;
        };
    }

    return {
        restrict: "E",
        templateUrl: "app/system_display/system_display.html",
        link: link
    }
}])

app.directive("systemEditor", [function () {
    return {
        restrict: "E",
        templateUrl: "app/system_editor/system_editor.html"
    }
}]);

app.directive("systemList", ["$rootScope", function ($rootScope) {
    function link(scope, element, attrs) {
        scope.new_sys_count = 1;
        scope.systems = [sys1];
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
        scope._system = null;
        scope.$on("SELECT_SYS", function (event, arg) {
            scope._system = arg;
        })
    }

    return {
        restrict: "E",
        templateUrl: "app/system_editor/system_info.html",
        link: link
    }
}]);

app.directive("agentList", [function () {
    function link(scope, element, attrs) {
        scope.add_new_agent = function () {
            var new_agent = new_agent_description(makeid(6), 1, 0, [], [], []);
            scope.system.agent_descriptions.push(new_agent);
            scope.system.agent_list[new_agent.name] = 0;
        }
        scope.change_agent_name = function (callback_arg) {
            var oldname = callback_arg.old;
            var newname = callback_arg.new;
            change_agent_name(scope.system, oldname, newname);
        }
    }

    return {
        scope: {
            system: "="
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
        scope.change_particle_name = function (callback_args) {
            var oldname = callback_args.old;
            var newname = callback_args.new;
            change_particle_name(scope.system, oldname, newname);
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

app.directive("hoverInput", ["$timeout", function ($timeout) {

    function link(scope, element, attrs) {

        scope.dtext = "";

        scope.hover = false;
        scope.element = element[0];
        scope.inputDOM = element[0].querySelector(".hover-input-textbox");
        scope.textDOM = element[0].querySelector(".hover-input-text");


        scope.container_style = {
            height: "auto",
            width: "auto",
        };

        function match_size() {
            scope.style = {
                color: scope.color,
                "font-size": scope.fontSize + "",
                "border-width": "0",
                "font-family": "\"Segoe UI\", \"Open Sans\", sans-serif, serif",
                "font-weight": scope.fontWeight,
                "background-color": "rgba(255,255,255,0)",
                "white-space": "nowrap",
            }
            scope.style["width"] = scope.textDOM.offsetWidth + 0 + "px";
            scope.style["height"] = scope.textDOM.offsetHeight + 0 + "px";

        }

        function match_container_size() {

            scope.container_style["width"] = scope.style["width"];
            scope.container_style["height"] = scope.style["height"];
        }

        $timeout(function () {
            scope.dtext = scope.text;
            console.log(scope.text)
            if (typeof scope.color === "undefined") {
                scope.color = "#101010";
            }
            if (typeof scope.fontSize == "undefined") {
                scope.fontSize = "26px"
            }
            if (typeof scope.fontWeight == "undefined") {
                scope.fontWeight = "400"
            }
            scope.style_apply = scope.style;
            $timeout(function () {
                match_size();
                match_container_size();
            })

        })
        scope.change = function () {
            $timeout(function () {
                match_size();
            })

        }

        scope.match = match_size;

        scope.focus = function () {
            match_size();

        }
        scope.mouseover = function () {
            match_size();
            scope.hover = true;
            $timeout(function () {

                scope.inputDOM.focus();
            })
            console.log("mousover")
        }
        scope.mouseleave = function () {
            scope.hover = false;
            var temp = scope.text;

            scope.text = scope.dtext;
            match_container_size();

            if (typeof scope.onChangeCallback !== "undefined") {
                scope.onChangeCallback({old: temp, new: scope.text});
            }
            console.log("mouseleave")
        }
    }

    return {
        scope: {
            text: "=",
            onChangeCallback: "=",
            fontSize: "=",
            color: "=",
            fontFamily: "=",
            fontWeight: "=",
            isNumber: "="
        },
        restrict: "E",
        templateUrl: "app/template/hover_input.html",
        link: link
    }
}]);