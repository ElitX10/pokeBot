const utils = require('./utils.js');
const constants = require('./constants.js');

/**
 * Permet de changer le pokemon d'un raid s'il est encore sous la forme d'oeuf.
 * Permet aussi de lister les possibles pokemon pour ce raid.
 * @param {string} arg
 * @param {Message} msg
 */
exports.changePokemon = function (arg, msg) {
    const server = msg.guild;
    if (msg.channel.parentID === utils.getRaidCatId(server)) {
        // récupération du message avec les infos du raid
        getRaidMessage(msg.channel).then((raidMsg) => {
            const egg = msg.channel.name.split('-')[1];
            let msgContent = raidMsg.content.split('\n');
            if (isEgg(egg)) {
                const eggLevel = parseInt(egg.substring(3, 4));
                // liste des pokemon
                if (arg === 'liste' || arg === 'list') {
                    listPokemonForLevel(msg, eggLevel);
                } else { // changement du pokemon
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
                        msg.channel.send(utils.mention(msg) + arg + ' n\'est pas disponible dans les raids de niveau ' + eggLevel);
                    }
                }
            } else {
                msg.channel.send(utils.mention(msg) + 'Le pokemon est déjà connu : ' + egg);
            }
        }).catch(err => console.log(err));
    }
};

/**
 * Permet de récupérer le message avec les informations du raid
 * @param {TextChannel} channel
 * @returns {Promise<Message>}
 */
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

/**
 * Retourne true si le pokemon n'est pas encore connu
 * @param {string} pokemonInfo
 * @returns {boolean}
 */
isEgg = function (pokemonInfo) {
    const pokemonName = pokemonInfo.slice(0, -1);
    return pokemonName === 'egg';
};

/**
 * Change le nom du salon en fonction du pokemon qui à éclos
 * @param {TextChannel} channel
 * @param {string} pokemonName
 */
changeChannelName = function (channel, pokemonName) {
    let channelName = channel.name.split('-');
    channelName[1] = pokemonName;
    channel.setName(channelName.join('-')).catch(err => console.log(err));
};

/**
 * Envoie un message avec la liste des pokemon pour un niveau de raid donné
 * @param {Message} msg
 * @param {int} eggLevel
 */
listPokemonForLevel = function (msg, eggLevel) {
    let mess = utils.mention(msg) + 'Liste des pokemon pour les raids de niveau ' + eggLevel + ' :';
    mess += constants.pokemonList.filter((pokemon) => {
        return pokemon.level === eggLevel && !pokemon.isEgg;
    }).map((pokemon) =>{
        return '\n' + pokemon.name;
    }).join('');
    msg.channel.send(mess);
};