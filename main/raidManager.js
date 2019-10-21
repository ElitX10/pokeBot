const utils = require('./utils.js');
const constants = require('./constants.js');

exports.changePokemon = function (arg, msg) {
    const server = msg.guild;
    if (msg.channel.parentID === utils.getRaidCatId(server)) {
        // récupération du message avec les infos du raid
        getRaidMessage(msg.channel).then((raidMsg) => {
            let msgContent = raidMsg.content.split('\n');
            const egg = msgContent[0].split(' : ')[1];
            if (isEgg(egg)) {
                const eggLevel = parseInt(egg.substring(3, 4));
                const pokemon = constants.pokemonList.find(pokemon => {
                    return pokemon.level === eggLevel && pokemon.name === arg;
                });
                if (pokemon) {
                    msgContent[0] = '**Pokemon** : ' + pokemon.name;
                    raidMsg.edit(msgContent.join('\n')).then(() => {
                        changeChannelName(msg.channel, pokemon.name);
                        msg.react('✅');
                    }).catch(err => console.log(err));
                } else {
                    msg.channel.send(utils.mention(msg) + arg + " n'est pas disponible dans les raids de niveau " + eggLevel);
                    // todo message comme quoi pokemon name n'est pas dans la liste des pokemon lvl 'eggLevel'
                }
            } else {
                msg.channel.send(utils.mention(msg) + "Le pokemon est déjà connu : " + egg);
                // todo message pour dire que le pokemon est déjà connu
            }


        }).catch(err => console.log(err));
    }
};

getRaidMessage = function (channel) {
    return new Promise(function (resolve, reject) {
        channel.fetchPinnedMessages().then(res => {
            const raidMsg = res.find(mess => {
                return mess.content.split('\n')[0].split(' : ')[0] === '**Pokemon**';
            });
            resolve(raidMsg);
        }).catch(err => reject(err));
    });
};

isEgg = function (pokemonInfo) {
    const pokemonName = pokemonInfo.slice(0, -1);
    return pokemonName === 'egg';
};

changeChannelName = function (channel, pokemonName) {
    let channelName = channel.name.split('-');
    channelName[1] = pokemonName;
    channel.setName(channelName.join('-')).catch(err => console.log(err));
};