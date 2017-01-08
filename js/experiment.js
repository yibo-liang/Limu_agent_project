/**
 * Created by Devid on 03/01/2017.
 */


var particles=[];
particles.push(new_particle("H2O"));
particles.push(new_particle("C02"));
particles.push(new_particle("O2"));


var human_particle_interaction=[];
human_particle_interaction.push(particle_interaction("H2O", -1));
human_particle_interaction.push(particle_interaction("CO2",+1));
human_particle_interaction.push(particle_interaction("O2",-1));

var human=new_agent_description("human",10, 0.1, human_particle_interaction, [], []);

var chicken_particle_interaction=[];
chicken_particle_interaction.push(particle_interaction("H2O", -0.15));
chicken_particle_interaction.push(particle_interaction("CO2",+0.15));
chicken_particle_interaction.push(particle_interaction("O2",-0.15));

var chicken=new_agent_description("chicken",0.2, 1, chicken_particle_interaction, [], []);

var plant_particle_interaction=[];
plant_particle_interaction.push(particle_interaction("H2O", +0,2));
plant_particle_interaction.push(particle_interaction("CO2", -0.2));
plant_particle_interaction.push(particle_interaction("O2", +0.2));

var plant= new new_agent_description("plant", 0.3, 0.3, plant_particle_interaction, [], []);



var sys1=new_system();

sys1.name="test";
sys1.agent_descriptions=[human, plant, chicken];
sys1.agent_list={
    "human": 20,
    "plant": 50,
    "chicken": 5
}
sys1.particle_description=particles;
sys1.space=2000;
sys1.particle_list={
    "H2O": 5000,
    "CO2": 100,
    "O2": 1000
}

