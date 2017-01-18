/**
 * Created by Devid on 2017/1/12.
 */


var app = angular.module('myApp', []);

/* controllers */


//directives
app.directive("systemDisplay", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
    function link(scope, element, attrs) {
        var displays = init_display("agent_view_div", "info_view_div");

        scope.system = [];
        scope.show = false;



        scope.$on("SYS_DISPLAY", function (event, arg) {
            console.log(arg);
            scope.system[0] = arg;
            scope.show = true;

            $timeout(function () {

                init_display_agents(scope.system[0], displays.agent_view);
                scope.visualise();
                scope.line_visualise();
            });
        });

        scope.hover_agent = null;

        scope.render_hover = function () {
            if (scope.hover_agent !== null) {
                var data = [];


            }
        }

        scope.hover_at = function (d) {
            scope.hover_agent = d;
        }

        scope.leave_hover = function () {
            scope.hover_agent = null;
        }


        scope.render = function () {
            update_display_agents(scope.system[0], displays.agent_view);
            render_display_agents(scope.system[0], displays.agent_view);
            random_move_agent_display(scope.system[0], displays.agent_view);
        };

        scope.step = function () {
            step(scope.system[0]);
        };

        scope.autostepping = true;
        scope.start_stepping = function () {
            scope.autostepping = true;
        };
        scope.pause_stepping = function () {
            scope.autostepping = false;
        };
        scope.hide = function () {
            scope.show = false;
            unload_display(displays.agent_view)
            scope.system = [];
        };

        scope.visualise = function () {
            scope.render();
            scope.step();
            if (scope.show) {
                $timeout(scope.visualise, 1000);
            }
        }

        scope.line_visualise = function () {
            //console.log(scope.system)
            if (scope.system.length > 0) {
                draw_lines(scope.system[0],displays.canvas, displays.agent_view);
                if (scope.show){
                    $timeout(scope.line_visualise,20);
                }
            }
        }
    }

    return {
        restrict: "E",
        templateUrl: "app/system_display/system_display.html",
        link: link
    }
}]);

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
        };

        scope.select = function (d) {
            $rootScope.$broadcast("SELECT_SYS", d);
        };

        scope.display = function (d) {
            $rootScope.$broadcast("SYS_DISPLAY", copy(d));
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

app.directive("agentList", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
    function link(scope, element, attrs) {
        scope.add_new_agent = function () {
            var new_agent = new_agent_description(makeid(6), 1, 0, [], [], []);
            scope.system.agent_descriptions.push(new_agent);
            scope.system.agent_list[new_agent.name] = 0;
        };
        scope.change_agent_name = function (callback_arg) {
            var oldname = callback_arg.old;
            var newname = callback_arg.new;
            return change_agent_name(scope.system, oldname, newname);
        };
        scope.edit_interaction = function (agent) {

            $rootScope.$broadcast("EDIT_INTERACTION", {system: scope.system, agent: agent});
            $timeout(function () {
                metroDialog.open('#interaction_dialog');
            })
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

app.directive("interactions", [function () {

    function link(scope, element, attrs) {

        scope.display = function () {

            if (scope.agent.particle_interaction.length == 0) {
                for (var i = 0; i < scope.system.particle_descriptions.length; i++) {
                    var p = scope.system.particle_descriptions[i];
                    var new_pi = particle_interaction(p.name, 0);
                    console.log(scope.particle_interaction, new_pi)
                    scope.particle_interaction.push(new_pi);

                }

            } else {
                scope.particle_interaction = copy(scope.agent.particle_interaction);
            }
            if (scope.agent.non_particle_interaction.length > 0) {
                scope.non_particle_interaction = copy(scope.agent.non_particle_interaction);
            }
            if (scope.agent.passive_interaction.length > 0) {
                scope.passive_interaction = copy(scope.agent.passive_interaction);
            }
            console.log(scope.agent.non_particle_interaction)
        };

        scope.already_has_pi = function (pi) {
            for (var i = 0; i < scope.particle_interaction.length; i++) {
                //console.log(scope.particle_interaction[i].name)
                if (scope.particle_interaction[i].name == pi.name) {
                    return true;
                }
            }
            return false;

        }
        scope.choice_in_np = function (name, np) {
            for (choice_name in np.choice) {
                //console.log("cname", choice_name, name)
                if (choice_name == name) {
                    return true;
                }
            }
            return false;
        }

        scope.$on("EDIT_INTERACTION", function (elem, args) {
            scope.particle_interaction = [];
            scope.non_particle_interaction = [];
            scope.passive_interaction = [];
            console.log(args);
            scope.agent = args.agent;
            scope.system = args.system;
            scope.display();
        })

        scope.new_choice = function (np) {
            var name = null;
            for (var i = 0; i < scope.system.agent_descriptions.length; i++) {
                var agent_desc = scope.system.agent_descriptions[i];
                if (!scope.choice_in_np(agent_desc.name, np)) {
                    name = agent_desc.name;
                }
            }

            if (name !== null) {
                console.log(np)
                np.choice[name] = 0;
            }
        }

        scope.delete_choice = function (i, choice) {
            delete i.choice[choice];
        }

        scope.add_pi = function () {
            var p = null;
            for (var i = 0; i < scope.system.particle_descriptions.length; i++) {
                var pi = scope.system.particle_descriptions[i];
                if (!scope.already_has_pi(pi)) {
                    p = pi;
                }
            }
            scope.particle_interaction.push({name: p.name, amount: 0});
        }

        scope.new_npi = function () {
            var npi = non_particle_interaction(makeid(5), 0, {});
            scope.non_particle_interaction.push(npi);
        }

        scope.del_npi = function (index) {
            scope.non_particle_interaction.splice(index, 1);
        }

        scope.new_passive_i = function () {
            var np = passive_interaction(makeid(5), scope.system.agent_descriptions[0].name, 0);
            scope.passive_interaction.push(np);
        }

        scope.close = function () {
            metroDialog.close('#interaction_dialog');

        }

        scope.save = function () {
            scope.agent.particle_interaction = [];
            for (var i = 0; i < scope.particle_interaction.length; i++) {
                var t = scope.particle_interaction[i];
                if (t.amount !== 0) {
                    scope.agent.particle_interaction.push(t);
                }
            }
            scope.agent.non_particle_interaction = scope.non_particle_interaction;
            scope.agent.passive_interaction = scope.passive_interaction;
            scope.close();
        }
    }

    return {
        restrict: "E",
        templateUrl: "app/system_editor/interactions.html",
        link: link
    }
}]);

app.directive("particleList", [function () {
    function link(scope, element, attrs) {
        scope.add_particle = function () {
            var np = new_particle();
            scope.system.particle_descriptions.push(np);
            scope.system.particle_list[np.name] = 0;
        };
        scope.change_particle_name = function (callback_args) {
            var oldname = callback_args.old;
            var newname = callback_args.new;
            return change_particle_name(scope.system, oldname, newname);
        }
        scope.delete_particle = function (p) {
            delete_particle(scope.system, p);
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
                "min-height": scope.fontSize + "",
                "font-size": scope.fontSize + "",
                "border-width": "0",
                "font-family": "\"Segoe UI\", \"Open Sans\", sans-serif, serif",
                "font-weight": scope.fontWeight,
                "background-color": "rgba(255,255,255,0)",
                "white-space": "nowrap",
            };
            scope.style["width"] = scope.textDOM.offsetWidth + 0 + "px";
            scope.style["height"] = scope.textDOM.offsetHeight + 0 + "px";

        }

        function match_container_size() {

            scope.container_style["width"] = scope.style["width"];
            scope.container_style["height"] = scope.style["height"];
        }

        $timeout(function () {
            scope.dtext = scope.text;
            console.log("re", scope.rejectEmpty)
            console.log(scope.text);
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

        });
        scope.change = function () {
            $timeout(function () {
                match_size();
            })

        };

        scope.match = match_size;

        scope.focus = function () {
            match_size();

        };
        scope.mouseover = function () {
            match_size();
            scope.hover = true;
            $timeout(function () {

                scope.inputDOM.focus();
            });
            console.log("mousover")
        };
        scope.mouseleave = function () {
            scope.hover = false;
            var temp = scope.text;
            console.log(scope.dtext, scope.rejectEmpty)
            if (scope.dtext == "" || scope.text == null) {
                if (scope.rejectEmpty) {
                    scope.dtext = temp;
                    return;
                }
            }
            if (scope.forceNumber == "int") {
                scope.dtext = parseInt(scope.dtext);
                scope.dtext = scope.dtext || 0;
            } else if (scope.forceNumber == "float") {
                scope.dtext = parseFloat(scope.dtext);
                scope.dtext = scope.dtext || 0;
            }
            if (typeof scope.onChangeCallback !== "undefined") {
                var validate = scope.onChangeCallback({old: temp, new: scope.dtext});
                if (validate) {
                    scope.text = scope.dtext;
                }
            } else {
                scope.text = scope.dtext;
            }
            match_size();

            match_container_size();
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
            rejectEmpty: "@rejectEmpty",
            forceNumber: "@forceNumber"
        },
        restrict: "E",
        templateUrl: "app/template/hover_input.html",
        link: link
    }
}]);