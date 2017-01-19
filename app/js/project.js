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
        growth: growth,
        color: stringToColour(name)

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

//
// function copy(system) {
//     var res = jQuery.extend(true, {}, system);
//     return res;
// }
function copy(system) {
    return JSON.parse(JSON.stringify(system))
}

function change_agent_name(system, oldname, newname) {
    console.log("change agent name")
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
            console.log("desc npi", npi)
            for (agent in npi.choice) {
                console.log("npi", agent)
                if (agent === oldname) {
                    new_choice[newname] = npi.choice[oldname];
                    console.log("change np int ", npi);
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
    return true;
}

function change_particle_name(system, oldname, newname) {
    var count = system.particle_list[oldname];
    delete system.particle_list[oldname];
    system.particle_list[newname] = count;
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var desc = system.agent_descriptions[i];
        //console.log(desc, desc.name)
        for (var j = 0; j < desc.particle_interaction.length; j++) {
            var p = desc.particle_interaction[j];
            //console.log(p, newname)
            if (p.name == oldname) {
                p.name = newname;
                console.log(newname)
            }
        }
    }
    return true;
}

function delete_particle(system, particle) {
    var name = particle.name;
    delete system.particle_list[name];
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var desc = system.agent_descriptions[i];
        var to_delete = null;
        for (var j = 0; j < desc.particle_interaction.length; j++) {
            var p = desc.particle_interaction[j];

            if (p.name == name) {
                to_delete = j;
            }
        }
        desc.particle_interaction.splice(to_delete, 1);
    }
    var idx = null;
    for (var i = 0; i < system.particle_descriptions.length; i++) {
        if (system.particle_descriptions[i].name == name) {
            idx = i;
        }
    }
    console.log(idx, system.particle_descriptions)
    system.particle_descriptions.splice(idx, 1);


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
                //console.log("new max", max, p.name, p.amount)
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
            //console.log(remaining_space, "- " + agent_desc.name, system.agent_list[agent_desc.name], agent_space)
        }
    }
    // console.log("rs", remaining_space, "occ", max * agent.space);
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
    // console.log("set " + agent.name + " n = ", n);
    // console.log(agent.name, n);
    //console.log("---");
    ;
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
    //console.log("----------------------")
}

function random_xy(x, y, r) {
    var l = Math.random() * 50 + 25;
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

var agent_mousehover_callback = null;
var agent_mouseleave_callback = null;

function default_velocity() {
    return 7 + Math.random() * 6;
}

var sigmoid = function (x) {
    return 1 / (1 + Math.exp(-x * 1));
};


var logx = function (x) {
    return Math.log(x) / Math.log(10);
};

var size_by_num = function (x) {
    return 2 + (1 - sigmoid(logx(x))) * 40;
}


function init_display_agents(system, container, _agent_mousehover_callback, _agent_mouseleave_callback) {
    var d_agents = [];

    for (agent_name in system.agent_list) {
        var num = system.agent_list[agent_name];
        for (var i = 0; i < num; i++) {

            var angle = Math.random() * Math.PI * 2;
            var r = container.attr("height") / 2 - 10;
            var coor = random_xy_in_r(r);
            var x = coor.x;
            var y = coor.y;

            d_agents.push({
                agent: agent_name,
                id: i,
                x: x,
                y: y,
                angle: angle,
                v: default_velocity(),
                display_r: size_by_num(num),
            })
        }
    }
    agent_mousehover_callback = highlight;
    agent_mouseleave_callback = delight;
    system.agent_display = d_agents;
}

function unload_display(container) {
    container
        .selectAll("circle")
        .remove();

    high_lighted_instances = [];
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
    for (agent_name in system.agent_list) {
        var num = system.agent_list[agent_name];

        for (var i = 0; i < num; i++) {
            if (typeof temp_dict[agent_name][i] !== "undefined") {
                temp_dict[agent_name][i].display_r = size_by_num(num);
                d_agents.push(temp_dict[agent_name][i]);


                continue;
            }
            var r = container.attr("height") / 2 - 10;
            var coor = random_xy_in_r(r);
            var x = coor.x;
            var y = coor.y;
            var angle = Math.random() * 2 * Math.PI;
            d_agents.push({
                agent: agent_name,
                id: i,
                x: x,
                y: y,
                display_r: size_by_num(num),
                angle: angle,
                v: default_velocity()
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

function move_agent_display(system, container) {

    var max_r = container.attr("height") / 2 - 10;
    var m2 = max_r * max_r;
    for (var i = 0; i < system.agent_display.length; i++) {
        var d = system.agent_display[i];
        var dx = Math.cos(d.angle) * d.v;
        var dy = Math.sin(d.angle) * d.v;
        d.x += dx;
        d.y += dy;

        if (d.x * d.x + d.y * d.y > m2) {
            //going out of box, turn around according to the tangent
            var r2o = Math.atan2(d.y, d.x);
            var r = d.angle;
            d.x -= dx;
            d.y -= dy;
            if (r2o > Math.PI / 2) r2o = Math.PI - r2o;
            if (r2o < -Math.PI / 2) r2o = -Math.PI - r2o;
            d.angle = -2 * r2o + r;
            var dx = Math.cos(d.angle) * d.v;
            var dy = Math.sin(d.angle) * d.v;
            d.x += dx;
            d.y += dy;

        }

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
};


function render_display_agents(system, container) {
    var interval = 1000;
    var transition_method = d3.easeLinear;


    var data = system.agent_display;
    //console.log("container", container)
    var height = container.attr("height");
    var offset = height / 2;
    var select = container
        .selectAll("circle")
        .data(data, function (d) {
            return d.agent + d.id; // name + number to distinguish
        });
    ;

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
        .attr("fill-opacity", 0)
        .on("mouseover",
            function (d) {
                high_lighted_instances = [{ins: d, dom: d3.select(this)}]
            }
        )
        .on("mouseleave",
            function (d) {
                high_lighted_instances = [];
            }
        );

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
        ;
    ;

    select.exit().transition()
        .ease(transition_method)
        .duration(interval)
        .attr("r", 0.1)
        .attr("fill-opacity", 0)
        .remove();
}

function agent_particle_interact_relation(agent1_name, agent2_name, system) {
    var agent1 = null;
    var agent2 = null;
    if (agent1_name == agent2_name) return;
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var agent_desc = system.agent_descriptions[i];
        if (agent_desc.name == agent1_name) {
            agent1 = agent_desc;
        } else if (agent_desc.name == agent2_name) {
            agent2 = agent_desc;
        }
    }
    if (agent1 == null || agent2 == null) {
        console.log(agent1, agent2, agent1_name, agent2_name)
        return "";
    }
    var particle_dict = {};
    for (var i = 0; i < agent1.particle_interaction.length; i++) {
        var pi = agent1.particle_interaction[i];
        if (pi.amount > 0) {
            particle_dict[pi.name] = "+";
        } else if (pi.amount < 0) {
            particle_dict[pi.name] = "-";
        }
    }
    for (var i = 0; i < agent2.particle_interaction.length; i++) {
        var pi = agent2.particle_interaction[i];
        if (typeof particle_dict[pi.name] === "undefined") {
            continue;
        }
        if (pi.amount > 0) {
            particle_dict[pi.name] = particle_dict[pi.name] + "+";
        } else if (pi.amount < 0) {
            particle_dict[pi.name] = particle_dict[pi.name] + "-";
        }
    }
    return particle_dict;

}


var global_line_offset = 0;
var linedash = [1, 40];

function draw_line_between(agent_ins1, agent_ins2, coor1, coor2, particle_relation, canvas) {


    var height = canvas.height;
    var offset = 0 / 2;
    var sum = linedash.reduce(function (a, b) {
        return a + b;
    }, 0);

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
    }

    function rgbTorgba(c, a) {
        return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
    }

    //console.log("draw lin b", agent_ins1, agent_ins2)
    var count = 0;

    for (particle_name in particle_relation) {
        var direction = particle_relation[particle_name];
        if (direction == "++" || direction == "--") {
            continue;
        }
        count++;
    }
    var psum = count;
    count = 0;
    for (particle_name in particle_relation) {

        var direction = particle_relation[particle_name];

        if (direction == "++" || direction == "--") {
            continue;
        }
        var context = canvas.getContext('2d');
        context.beginPath();
        context.lineWidth = 5;
        context.lineCap = "round";
        context.setLineDash(linedash);
        context.lineDashOffset = global_line_offset + (count / psum) * sum;
        var color = stringToColour(particle_name);
        //console.log(direction)
        if (direction == "+-") {
            var x1 = coor1.x;
            var y1 = coor1.y;
            var x2 = coor2.x + offset;
            var y2 = coor2.y + offset;

            var gradient = context.createLinearGradient(x1, y1, x2, y2);
            var c = hexToRgb(color);
            gradient.addColorStop("0", rgbTorgba(c, 0));
            gradient.addColorStop("0.5", rgbTorgba(c, 1));
            gradient.addColorStop("1", rgbTorgba(c, 0.5));


            context.strokeStyle = gradient;
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        } else if (direction == "-+") {
            var x1 = coor2.x;
            var y1 = coor2.y;
            var x2 = coor1.x + offset;
            var y2 = coor1.y + offset;

            var gradient = context.createLinearGradient(x1, y1, x2, y2);
            var c = hexToRgb(color);
            gradient.addColorStop("0", rgbTorgba(c, 0));
            gradient.addColorStop("0.5", rgbTorgba(c, 1));
            gradient.addColorStop("1", rgbTorgba(c, 0.5));


            context.strokeStyle = gradient;
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }
        count += 1;
    }
}

var high_lighted_instances = [];


function highlight(ins) {
    high_lighted_instances = [{ins: ins, dom: d3.select(this)}];
    // var hash = function (ins) {
    //     return ins.agent + ins.id;
    // };
    // for (var i = 0; i < high_lighted_instances.length; i++) {
    //     if (ins === high_lighted_instances[i] || hash(ins) == hash(high_lighted_instances[i])) {
    //         return;
    //     }
    // }
    // high_lighted_instances.push(ins);
    // console.log("high_lighted_instances", hash(ins), high_lighted_instances);
}

function delight(ins) {
    high_lighted_instances = [];
    // var idx = null;
    // var hash = function (ins) {
    //     return ins.agent + ins.id;
    // };
    // for (var i = 0; i < high_lighted_instances.length; i++) {
    //     if (ins === high_lighted_instances[i] || hash(ins) == hash(high_lighted_instances[i])) {
    //         idx = i;
    //     }
    // }
    // if (idx) {
    //     high_lighted_instances.splice(idx, 1);
    // }
    // console.log("delight", hash(ins), high_lighted_instances)
}

var distance = function (ins1, ins2) {
    var dx = ins1.x - ins2.x;
    var dy = ins1.y - ins2.y;
    return Math.sqrt(dx * dx + dy * dy);
}


function draw_lines(system, d3canvas, d3svg) {

    var max_distance = 50;
    var canvas = d3canvas["_groups"][0][0];

    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    //console.log("d3 svg", d3svg);

    d3svg.selectAll("circle")
        .each(function (d, i) {
            var _this = d3.select(this);
            //console.log("this", _this, _this._groups[0][0]);
            var x = parseFloat(_this.attr("cx"));
            var y = parseFloat(_this.attr("cy"));

            var coor1 = {
                x: x,
                y: y
            }
            //console.log("coor1", coor1)
            for (var j = 0; j < high_lighted_instances.length; j++) {
                var ins1 = d;
                var ins2 = high_lighted_instances[j].ins;

                if (!ins1 || !ins2) {
                    continue
                }

                var x2 = parseFloat(high_lighted_instances[j].dom.attr("cx"));
                var y2 = parseFloat(high_lighted_instances[j].dom.attr("cy"));


                var coor2 = {
                    x: x2,
                    y: y2
                }
                if (ins1 !== ins2 && ins1.agent !== ins2.agent && distance(ins1, ins2) < max_distance) {
                    var particle_relation = agent_particle_interact_relation(ins1.agent, ins2.agent, system);
                    // console.log(particle_relation)
                    draw_line_between(ins1, ins2, coor1, coor2, particle_relation, canvas);
                }
            }
        })


    var sum = linedash.reduce(function (a, b) {
        return a + b;
    }, 0);
    global_line_offset++;
    global_line_offset = global_line_offset % sum;
}

function render_agent_connection(system, agent_instance, canvas) {
    var x = agent_instance.x;
    var y = agent_instance.y;
    var r = agent_instance.display_r;
    var name = agent_instance.agent;
    var max_distance = 30;

    var candidates = [];

    var color_dict = {};
    for (var i = 0; i < system.particle_descriptions.length; i++) {
        var p = system.particle_descriptions[i];
        color_dict[p.name] = p.color;
    }

    var other_agents = {};
    for (var i = 0; i < system.agent_descriptions.length; i++) {
        var desc = system.agent_descriptions[i];
        if (desc.name !== name) {
            other_agents[desc.name] = {
                particle_interact_relation: agent_particle_interact_relation(name, desc.name, system),

            }
        }
    }
    var canvasDom = canvas[0][0];
    var ctx = canvasDom.getContext("2d");
    for (var i = 0; i < system.agent_display.length; i++) {
        var ad = system.agent_display[i];
        if (ad.name != name) { // if not same type of agent
            for (interact_p in other_agents[ad.name]) {
                if (other_agents[interact_p] < 0) {

                }
            }
        }
    }

}

function init_display(agent_view_container, info_view_container) {
    var container = d3.select("#" + agent_view_container);
    var h = $("#" + agent_view_container).height() - 1;
    var w = $("#" + agent_view_container).width() - 1;

    var canvas = container.append("canvas")
        .attr("height", h)
        .attr("width", w)
        .style("z-index", "0")
        .style("background-color", "rgba(0,0,0,0.0)")
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0");
    //left panel, for agents
    var left_container = container
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .style("position", "absolute")
        .attr("id", "agent_view")
        .style("background-color", "rgba(0,0,0,0)")
        .style("z-index", "10");


    var info_container = d3.select("#" + info_view_container);
    var h = $("#" + info_view_container).height() - 1;
    var w = $("#" + info_view_container).width() - 1;
    //right panel for information
    var right_container = info_container
        .append("svg")
        .attr("height", h)
        .attr("width", w)
        .attr("id", "info_view")
        .style("background-color", "rgba(0,0,0,0)");

    return {
        agent_view: left_container,
        info_view: right_container,
        canvas: canvas
    }
}