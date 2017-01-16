/**
 * Created by Devid on 31/12/2016.
 */

function makeid(n) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < n; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function new_particle(name, growth) {
    if (typeof name === "undefined") {
        name = makeid(6);
    }
    if (typeof growth === "undefined") {
        growth = 0;
    }
    return {
        name: name,
        growth: growth
    }
}

function new_agent_description(name, space, growth, particle_interaction, non_particle_interaction, passive_interaction) {
    return {
        name: name,
        space: space,
        growth: growth,
        particle_interaction: particle_interaction, // 1 [{name: , amount: },{name: , amount : }]
        non_particle_interaction: non_particle_interaction,  // 2 []
        passive_interaction: passive_interaction //3
    }
}

function particle_interaction(name, amount) {

    return {
        name: name,
        amount: amount,
    }
}

function non_particle_interaction(name, /* condition, */ amount, choice) {
    return {
        name: name,
        amount: amount,
        //condition: condition, // as l(larger), s(smaller), le(larger/equal), se(smaller/equal), e(equal),
        choice: choice // if there are multiple agents that can be target for this interaction, what will they be?
        // e.g. for name=food, we have {chicken: 2, plant:10} randomly assigned to this in the beginning, which as
        // target can provide enough food
    }
}

function passive_interaction(asTarget, by, amount) {
    return {
        asTarget: asTarget,
        by: by,
        amount: amount
    }
}

function new_system() {
    return {
        name: "",
        space: 0,
        remaining_space: 0,
        particle_list: {},
        particle_descriptions: [],
        agent_list: {},
        agent_descriptions: [],
        agent_display: []
    }
}

function copy(system){
    return JSON.parse(JSON.stringify(system))
}

function change_agent_name(system, oldname, newname) {
    var count = system.agent_list[oldname];
    delete system.agent_list[oldname];
    system.agent_list[newname] = count;
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var desc = system.agent_descriptions[i];
        if (desc.name === oldname) {
            desc.name = newname;
        }
        for (var j = 0; j < desc.non_particle_interaction.length; j++) {
            var npi = desc.non_particle_interaction[j];
            var new_choice = {};
            for (agent in npi.choice) {
                if (agent === oldname) {
                    new_choice[newname] = npi.choice[oldname];
                } else {
                    new_choice[agent] = npi.choice[agent];
                }
            }
            npi.choic = new_choice;
        }
        for (var j = 0; j < desc.passive_interaction.length; j++) {
            var pi = desc.passive_interaction[j];
            if (pi.by == oldname) {
                pi.by = newname;
            }
        }
    }
}

function change_particle_name(system, oldname, newname) {
    var count = system.particle_list[oldname];
    delete system.particle_list[oldname];
    system.particle_list[newname] = count;
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var desc = system.agent_descriptions[i];
        for (var j = 0; j < desc.particle_interaction.length; j++) {
            var p = desc.particle_interaction[j];
            if (p.name == oldname) {
                p.name = newname;
            }
        }
    }
}

//get maximum amount of interaction of an agent
function get_interact_maximum(agent, system) {
   // console.log("get interact max", agent.name);
    // 0. increase the amount of agents by its natural growth rate
    var current_agent_num = system.agent_list[agent.name];
    var expect_agent_num = (1 + agent.growth) * current_agent_num; // add growth rate
    // 1. calculate particle interaction first, if not enough particle is found for interaction, reduce the excess
    // amount of agent in the system,
    //for each particle this agent interacts, calculate the maximum interaction amount
    var max = expect_agent_num;
     //console.log(1, max)
    for (var i = 0; i < agent.particle_interaction.length; i++) {
        var p = agent.particle_interaction[i];
        var expect_particle_interaction = max * p.amount;
        var expect_system_particle_amount = system.particle_list[p.name] + expect_particle_interaction;
        if (expect_system_particle_amount < 0) {
            //not enough particle for interaction
            expect_system_particle_amount = system.particle_list[p.name];
            var sub_max = Math.abs(expect_system_particle_amount / p.amount);
            if (sub_max < max) {
                max = sub_max;
                console.log("new max", max, p.name, p.amount)
            }
        }
    }
     //console.log(2, max)
    // 2. calculate non particle interaction, if not non particle condition, reduce the excess amount of agent
    //for each non particle interaction
    for (var i = 0; i < agent.non_particle_interaction.length; i++) {
        var interaction = agent.non_particle_interaction[i];
        var choice = interaction.choice;
        for (other_agent_name in choice) {

            var interaction_amount = choice[other_agent_name];
            var other_agent_num = system.agent_list[other_agent_name];
            var expect_amount = other_agent_num + interaction_amount * max;
            if (expect_amount < 0) {
                expect_amount = system.agent_list[other_agent_name];
                var sub_max = Math.abs(expect_amount / interaction_amount);
                if (sub_max < max) max = sub_max;
            }
        }
    }

      //console.log(3, max)
    // 3. calculate space, reduce the excess amount of agent
    var total_space = system.space;
    var remaining_space = total_space;
    for (var i = 0; i < system.agent_descriptions.length; i++) {

        var agent_desc = system.agent_descriptions[i];
        if (agent.name !== agent_desc.name) {
            var agent_space = system.agent_list[agent_desc.name] * agent_desc.space;

            remaining_space -= agent_space;
            console.log(remaining_space, "- "+agent_desc.name, system.agent_list[agent_desc.name], agent_space)
        }
    }
    console.log("rs", remaining_space, "occ", max*agent.space);
    var expect_remaining_space = remaining_space - max * agent.space;
    if (expect_remaining_space < 0) {
        max = Math.floor(remaining_space / agent.space);
    }
     //console.log(4, max)
    return max;

}

function interact(agent, system) {
    var n = get_interact_maximum(agent, system);
    //interact particles
    system.agent_list[agent.name] = n;
    console.log("set "+agent.name+" n = ", n);
    console.log(agent.name, n);
    console.log("---")
    for (var i = 0; i < agent.particle_interaction.length; i++) {
        var p = agent.particle_interaction[i];
        var interaction_amount = n * p.amount;
        system.particle_list[p.name] += interaction_amount;
        //console.log("interact amount", p.amount, " | ",p.name, system.particle_list[p.name]);
    }
    //interact non particles
    for (var i = 0; i < agent.non_particle_interaction.length; i++) {
        var interaction = agent.non_particle_interaction[i];
        var choice = interaction.choice;
        for (a in choice) {
            system.agent_list[a] += n * choice[a];
        }
    }

}



function step(system) {
    for (var i = 0; i < system.particle_descriptions.length; i++) {
        var particle = system.particle_descriptions[i];
        var num = system.particle_list[particle.name];
        if (num + particle.growth > 0) {
            system.particle_list[particle.name] += particle.growth;
        } else {
            system.particle_list[particle.name] = 0
        }
        //console.log("growth amount", particle.growth, " | ",particle.name, system.particle_list[particle.name]);
    }

    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var agent = system.agent_descriptions[i];
        interact(agent, system);
    }
    console.log("----------------------")
}

function random_xy(x, y, r) {
    var l = Math.random() * 10;
    var dr = r + 1;
    while (dr > r) {

        var dx = x + Math.random() * l * 2 - l;
        var dy = y + Math.random() * l * 2 - l;
        var dr = Math.sqrt(dx * dx + dy * dy);
    }
    return {
        x: dx,
        y: dy
    }

}

function init_display_agents(system, container) {
    var d_agents = [];
    for (agent_name in system.agent_list) {
        var num = system.agent_list[agent_name];
        for (var i = 0; i < num; i++) {

            var angle = Math.random() * Math.PI * 2;
            var l = Math.random() * container.attr("height") / 2 - 10;
            var x = Math.cos(angle) * l;
            var y = Math.sin(angle) * l;
            d_agents.push({
                agent: agent_name,
                id: i,
                x: x,
                y: y
            })
        }
    }
    system.agent_display = d_agents;
}

function random_xy_in_r(r) {
    var x = Math.random() * r * 2 - r;
    var y_range = Math.sqrt(r * r - x * x);
    var y = Math.random() * y_range * 2 - y_range;
    return {x: x, y: y};
}

function update_display_agents(system, container) {
    var d_agents = [];
    var temp_dict = {};

    for (var i = 0; i < system.agent_display.length; i++) {
        var d = system.agent_display[i];
        var name = d.agent;
        if (typeof temp_dict[name] === "undefined") {
            temp_dict[name] = {};
        }
        temp_dict[name][d.id] = d;
    }

    var sigmoid = function (x) {
        return 1 / (1 + Math.exp(-x * 1));
    }

    var log100=function(x){
        return Math.log(x)/Math.log(50);
    }
    for (agent_name in system.agent_list) {
        var num = system.agent_list[agent_name];

        for (var i = 0; i < num; i++) {
            if (typeof temp_dict[agent_name][i] !== "undefined") {
                d_agents.push(temp_dict[agent_name][i]);


                continue;
            }
            var r = container.attr("height") / 2 - 10;
            var coor = random_xy_in_r(r);
            var x = coor.x;
            var y = coor.y;

            d_agents.push({
                agent: agent_name,
                id: i,
                x: x,
                y: y,
                display_r: 2 + (1 - sigmoid(log100(num))) * 15
            })
        }
    }
    system.agent_display = d_agents;
}


function random_move_agent_display(system, container) {
    for (var i = 0; i < system.agent_display.length; i++) {

        var d = system.agent_display[i];

        var nxy = random_xy(d.x, d.y, container.attr("height") / 2 - 10);
        //console.log(d.x, d.y, nxy.x, nxy.y);
        d.x = nxy.x;
        d.y = nxy.y;
        system.agent_display[i] = d;
    }
}

var stringToColour = function (str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function render_display_agents(system, container) {
    var interval = 1000;
    var transition_method = d3.easeLinear;


    var data = system.agent_display;
    //console.log(system)
    var height = container.attr("height");
    var offset = height / 2;
    var select = container
        .selectAll("circle")
        .data(data, function (d) {
            return d.agent + d.id; // name + number to distinguish
        })

    var circles = select.enter().append("circle");


    var circle_enter = circles
        .attr("cx", function (d) {
            return d.x + offset;
        })
        .attr("cy", function (d) {
            return d.y + offset;
        })
        .attr("r", function (d) {

            //var res = 2 + (1 - sigmoid(d.data().length));
            return d.display_r;
        })
        .style("fill", function (d) {
            return stringToColour(d.agent);
        })
        .attr("fill-opacity", 0);

    circle_enter.transition()
        .duration(interval)
        .ease(transition_method)
        .attr("fill-opacity", 1);

    circle_enter
        .on("click", function (d) {
            console.log(d)
        });

    var circle_update = select
        .transition()
        .duration(interval)
        .ease(transition_method)
        .attr("cx", function (d) {
            return d.x + offset;
        })
        .attr("cy", function (d) {
            return d.y + offset;
        })
        .attr("r", function (d) {
            return d.display_r;
        })
        .style("fill", function (d) {
            return stringToColour(d.agent);
        })

    select.exit().transition()
        .ease(transition_method)
        .duration(interval)
        .attr("r", 0.1)
        .attr("fill-opacity", 0)
        .remove();
}

function init_display(agent_view_container, info_view_container) {
    var container = d3.select("#" + agent_view_container);
    var h = $("#" + agent_view_container).height() - 1;
    var w = $("#" + agent_view_container).width() - 1;

    //left panel, for agents
    var left_container = container
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("id", "agent_view");

    var container = d3.select("#" + info_view_container);
    var h = $("#" + info_view_container).height() - 1;
    var w = $("#" + info_view_container).width() - 1;
    //right panel for information
    var right_container = container
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("id", "info_view");
    return {
        agent_view: left_container,
        info_view: right_container
    }
}