const fs = require('fs');
const utils = require('./utils.js');

const pokemonList = JSON.parse(fs.readFileSync('././data/pokemon.json')).pokemonList.filter(pokemon => {
    return pokemon.isActif;
}).sort((a,b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
});

const gymsList = JSON.parse(fs.readFileSync('././data/gyms.json')).gyms.sort((a,b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
});

exports.createChannel = function (args, msg) {
    if(utils.checkChannel("raids-trouvés", "!raid", msg)){
        const server = msg.guild;

        const pokemonName = args[0];
        const arenaName = args[1];
        const time = args[2];

        const refactorArgs = getRefactorArgs(args);

        Promise.all([checkPokemon(refactorArgs.pokemon),
                    checkGym(refactorArgs.gymName),
                    checkStartTime(refactorArgs.startTime)]).then((res) => {
            const pokemon = res[0];
            const gym = res[1];
            const startTime = res[2];

            // création du nom du salon
            const endTime = addMinToTime(startTime, 45);;
            const channelName = "0-" + pokemon.name + "-" + gym.name.split(' ').join('-')
                                + "-fin-" + endTime.getHours() + "h"
                                + zeroForMinutes(endTime) + endTime.getMinutes();

            // on vérifie si un salon n'a pas déjà été créé pour le raid
            if(!hasDuplicates(channelName, server.channels)){
                server.createChannel(channelName, {type: "text"}).then((res) => {
                    const channel = res;
                    // on met le salon dans la catégorie pour les raids
                    channel.setParent(server.channels.find(channel => channel.name === "raids").id)
                            .catch((err) => console.log(err));

                    // premiers message du salon
                    channelInfoMessage(pokemon, gym, startTime, channel);
                    createParticipantMessage(channel);

                    // suppression du salon après le raid
                    // TODO : faire mieux en fct de si il y a encore des msg
                    setTimeout(function () {
                        channel.send("Le salon va être supprimé dans 1 minute.").catch((err) => console.log(err));
                        setTimeout(function(){
                            channel.delete().catch((err) => console.log(err));
                        }, 60 * 1000);
                    }, 110 * 60 * 1000);

                    msg.react('✅');
                }).catch((err) => console.log(err));
            } else {
                msg.channel.send(utils.mention(msg) + "Un salon existe déjà pour ce raid.")
                    .catch((err) => console.log(err));
            }
        }).catch((err) => {
            msg.channel.send(utils.mention(msg) + err).catch((err) => console.log(err));
        });
    }
}

// permet de lister les pokemon et arènes pour les raids
exports.list = function(arg, msg){
    if(utils.checkChannel("raids-trouvés", "!raid", msg)){
        let list = utils.mention(msg);
        if(arg === "arenes" || arg === "arènes") {
            list += "\n**Liste des arènes** : *Nom complet* / *Nom raccourci*";
            list += gymsList.map((gym) => {
                return "\n" + gym.name + " / " + gym.alias;
            }).join('');
        }else if (arg === "pokemon") {
            list += "\n**Liste des Pokemon** : *Nom* (*Niveau*)";
            list += pokemonList.filter(pok => !pok.isEgg).map((pokemon) => {
                return "\n" + pokemon.name + " (" + pokemon.level + ")";
            }).join('');
        }else {
            list += "Liste inconnue : vous pouvez lister 'pokemon' ou 'arenes'."
        }
        msg.channel.send(list).catch((err) => console.log(err));
    }
}

// retourne les informations sur le raid à partir des args de la commande
getRefactorArgs = function(args){
    // nom de l'arene
    let gymName = args[1];
    let index = 2;
    while (args[index] && args[index][0] !== "@"
                && args[index][0] !== "$") {
        gymName = gymName + " " + args[index];
        index ++;
    }

    // heure de début du raid
    let startTime = null;
    let timeData = args[index];
    if(timeData){
        const param = timeData[0];
        timeData = timeData.substring(1);
        startTime = stringToDate(timeData);
        if(startTime && (param === "@" || param === "$")){
            // on enlève 45 min s'il s'agit de l'heure de fin en param
            if(param === "$") startTime = addMinToTime(startTime, -45);
        } else {
            startTime = null;
        }
    }
    return {
        pokemon: args[0],
        gymName: gymName.toLowerCase(),
        startTime: startTime,
    }
}

// vérifie que le pokemon existe (dans le json)
checkPokemon = function(pokeName) {
    return new Promise(function(resolve, reject) {
        const pokemon = pokemonList.find(poke => poke.name === pokeName);
        pokemon ? resolve(pokemon) : reject("Le pokemon " + pokeName
            + " n'est pas disponible dans les raids (ou est mal écrit).") ;
    });
};

// vérifie que l'arène existe (dans le json)
checkGym = function(gymName) {
    return new Promise(function(resolve, reject) {
        const gym = gymsList.find(gym => gym.name === gymName);
        gym ? resolve(gym) : reject("L'arène '" + gymName
            + "' n'est pas connue (ou est le nom de l'arène est mal écrit).\n"
            + "Vous pouvez voir la liste des arènes avec la commande '!liste arenes'"
            + " ou proposer l'ajout d'une arène dans le salon ajout-arènes.");
    });
};

// vérifie s'il y a une heure valide de renseignée
checkStartTime = function(startTime) {
    return new Promise(function(resolve, reject) {
        startTime ? resolve(startTime) : reject("Le format de l'heure est invalide : "
            + "utilisez '@' (pour le début du raid) ou '$' (pour la fin du raid) "
            + "suvi de l'heure (00:00 ou 00h00) ou du temps avant le début ou la "
            + "fin du raid (10, 10m ou 10min)");
    });
}

// retourne 'true' si un salon existe déjà :
hasDuplicates = function(channelName, channels) {
    let hasDuplicates = false;
    const channelNameData = channelName.split('-');
    const endTime = stringToDate(channelNameData[channelNameData.length - 1]);
    const pokeAndGym = channelNameData.splice(1, channelNameData.length - 3).join('-');

    const possibleDuplicates = channels.filter(channel => new RegExp(pokeAndGym, 'gi').test(channel.name));
    possibleDuplicates.forEach(function(duplicate){
        const duplicateNameData = duplicate.name.split('-');
        const duplicateEndTime = stringToDate(duplicateNameData[duplicateNameData.length - 1]);
         // TODO : check si on peut avoir 2 salon si c'est longtemps apres / pb si jour différent !!!
        if(endTime.getTime() - duplicateEndTime.getTime() < 105 * 60 * 1000){
            hasDuplicates = true;
        }
    });
    return hasDuplicates;
}

// converti un string au format 00h00, 00:00 ou 10min en Date
stringToDate = function(timeString) {
    const regexFullTime = /^\d{1,2}(h|:)\d{1,2}$/gi;
    const regexMin = /^\d{1,2}(m(in)?)?$/gi;
    let time = null;

    if (regexFullTime.test(timeString)) {
        time = new Date();
        time.setHours(parseInt(timeString.split(/h|:/i)[0]));
        time.setMinutes(parseInt(timeString.split(/h|:/i)[1]));
    } else if (regexMin.test(timeString)) {
        time = new Date();
        const minToAdd = parseInt(timeString);
        time = addMinToTime(time, minToAdd);;
    }
    return time;
}

// envoie les msg d'info pour les salons de raids
channelInfoMessage = function(pokemon, arene, startTime, channel){
    let msg = "**Pokemon** : " + pokemon.name;
    const endTime = addMinToTime(startTime, 45);
    const time = startTime.getHours() + "h" + zeroForMinutes(startTime)
                + startTime.getMinutes() + " -> " + endTime.getHours() + "h"
                + zeroForMinutes(endTime) + endTime.getMinutes();
    msg += "\n**Horaire** : " + time;
    msg += "\n**Arène** : " + arene.name;
    msg += "\n**Adresse** : " + arene.address;
    msg += "\n**Google Maps** : https://www.google.com/maps?daddr=" + arene.maps;

    channel.send(msg).then(res => {
        // pour épingler le message
        res.pin().catch((err) => console.log(err));
    }).catch((err) => console.log(err));
}

// pour le format des minutes inférieurs à 10 min
zeroForMinutes = function(time){
    return time.getMinutes() < 10 ? "0" : "";
}

// retourne une date avec un décalage en minute (min)
addMinToTime = function(time, min){
    return new Date(time.getTime() + min * 60 * 1000);
}

// création du message pour gérer la participation des joueurs aux raids
createParticipantMessage = function(channel){
    let msg = "**Liste des participants** : ";
    msg += "\n**TOTAL** : " + utils.valor + " x**0** | "
        + utils.mystic + " x**0** | "+ utils.instinct +" x**0** ";

    channel.send(msg).then(res => {
        // pour épingler le message
        res.pin().catch((err) => console.log(err));
    }).catch((err) => console.log(err));
}
