const fs = require('fs');
const pokemonList = JSON.parse(fs.readFileSync('././data/pokemon.json')).pokemonList;
const gymsList = JSON.parse(fs.readFileSync('././data/gyms.json')).gyms;
const utils = require('./utils.js');

exports.createChannel = function (args, msg, client) {
    // todo check si on est dans le bon channel pour la cmd

    if(utils.checkChannel("raids-trouvés", "!raid", msg)){
        var server = msg.guild;

        const pokemonName = args[0];
        const arenaName = args[1];
        const time = args[2];
        let channelName;

        const refactorArgs = getRefactorArgs(args);

        Promise.all([checkPokemon(refactorArgs.pokemon),
                    checkGym(refactorArgs.gymName)]).then((res) => {

            server.createChannel(channelName, {type: "text"}).then((res) => {
                const channel = res;
                channel.setParent("606532668313567262"); // get this from msg
                channel.send("C'est parti pour un raid!");

                setTimeout(function () {
                    channel.delete();
                }, 45 * 60 * 1000);

            });


            console.log(res);
        }).catch((err) => {
            msg.channel.send(err);



            console.log(err);
        });

        getRefactorArgs(args);

        if (time[0] === '@') {

        } else {
            channelName = "0-" + pokemonName + "-" + arenaName + "-" + time;
        }

        // console.log(client);



    }
}

getRefactorArgs = function(args){
    let gymName = args[1];
    let index = 2;
    while (args[index] && args[index][0] !== "@"
                && args[index][0] !== "$") {
        gymName = gymName + " " + args[index];
        index ++;
    }

    let startTime = new Date();
    const timeDate = args[index];
    let endDate = new Date(startTime.getTime() + 45 * 60 * 1000);
    let ms = startTime.getTime() + 45 * 60 * 1000;
    console.log(ms);
    let test = new Date(startTime.getTime() + 45 * 60 * 1000);
    console.log(startTime);
    console.log(endDate);

    return {
        pokemon: args[0],
        gymName: gymName.toLowerCase(),
        startTime: startTime,
    }
}

createChannelName = function(){

}

getEndTime = function(startTime){
    return new Date(startTime.getTime() + 45 * 60 * 1000);
}

// todo : check si le poke est tjrs actif dans les raids
checkPokemon = function(pokeName){
    return new Promise(function(resolve, reject){
        const pokemon = pokemonList.find(poke => poke.name === pokeName);
        pokemon ? resolve(pokemon): reject("Le pokemon " + pokeName
            + " n'est pas disponible dans les raids (ou est mal écrit).") ;
    });
};

checkGym = function(gymName){
    return new Promise(function(resolve, reject){
        const gym = gymsList.find(gym => gym.name === gymName);
        gym ? resolve(gym): reject("L'arène '" + gymName
            + "' n'est pas connue (ou est le nom de l'arène est mal écrit).\n"
            + "Vous pouvez voir la liste des arènes avec la commande '!liste arene'"
            + " ou proposer l'ajout d'une arène dans le salon ajout-arènes.");
    });
};

checkAndGetTimeStart = function(){
    return new Promise(function(resolve, reject){

    });
}
