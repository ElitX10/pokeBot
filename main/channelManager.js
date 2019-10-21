const utils = require('./utils.js');
const constants = require('./constants.js');
const Raid = require('../models/raid.js');

/**
 * Permet la création de salon pour les raids
 * @param {Array<string>} args
 * @param {Message} msg
 */
exports.createChannel = function (args, msg) {
    if (utils.checkChannel('raids-trouvés', '!raid', msg)) {
        const server = msg.guild;

        const raid = new Raid(args);

        // vérification des données
        Promise.all([raid.check('pokemon'),
            raid.check('gym'), raid.check('startTime')]).then(() => {

            // du nom du salon
            const channelName = raid.getRaidChannelName();

            // on vérifie si un salon n'a pas déjà été créé pour le raid
            checkDuplicates(channelName, server.channels).then(() => {
                // création du salon
                server.createChannel(channelName, {type: 'text'}).then((res) => {
                    const channel = res;
                    // on met le salon dans la catégorie pour les raids
                    channel.setParent(utils.getRaidCatId(server)).catch((err) => console.log(err));

                    // premiers message du salon
                    raid.channelInfoMessage(channel);

                    // suppression du salon après le raid
                    // TODO : faire mieux en fct de si il y a encore des msg
                    setTimeout(function () {
                        channel.send('Le salon va être supprimé dans 1 minute.').catch((err) => console.log(err));
                        setTimeout(function () {
                            channel.delete().catch((err) => console.log(err));
                        }, 60 * 1000);
                    }, (constants.raidDuration + constants.raidPreparationDuration + 10) * 60 * 1000);

                    // reaction sur le message pour confirmation
                    msg.react('✅');
                }).catch((err) => console.log(err));
            }).catch((err) => {
                msg.channel.send(utils.mention(msg) + err).catch((err) => console.log(err));
            });
        }).catch((err) => {
            msg.channel.send(utils.mention(msg) + err).catch((err) => console.log(err));
        });
    }
};

/**
 * Permet de lister les pokemon et arènes pour les raids
 * @param {string} arg
 * @param {Message} msg
 */
exports.list = function (arg, msg) {
    if (utils.checkChannel('raids-trouvés', '!raid', msg)) {
        let listMsg = utils.mention(msg);

        // liste des arenes
        if (arg === 'arenes' || arg === 'arènes') {
            listMsg += '\n**Liste des arènes** : *Nom complet* / *Nom raccourci*';
            listMsg += constants.gymsList.map((gym) => {
                return '\n' + gym.name + ' / ' + gym.alias;
            }).join('');
        } else if (arg === 'pokemon') { // liste des pokemon
            listMsg += '\n**Liste des Pokemon** : *Nom* (*Niveau*)';
            listMsg += constants.pokemonList.filter(pok => !pok.isEgg).map((pokemon) => {
                return '\n' + pokemon.name + ' (' + pokemon.level + ')';
            }).join('');
        } else {
            listMsg += 'Liste inconnue : vous pouvez lister \'pokemon\' ou \'arenes\'.'
        }

        // envoie du msg
        msg.channel.send(listMsg).catch((err) => console.log(err));
    }
};

/**
 * Vérifie si un salon pour un raid existe déjà ou non
 * @param {string} channelName
 * @param {Collection<Snowflake, GuildChannel>} channels
 * @param channelName
 * @param channels
 * @returns {Promise}
 */
checkDuplicates = function (channelName, channels) {
    return new Promise(function (resolve, reject) {
        const channelNameData = channelName.split('-');
        const endTime = utils.stringToDate(channelNameData[channelNameData.length - 1]);
        const gymName = channelNameData.splice(2, channelNameData.length - 3).join('-');
        const totalRaidTime = (constants.raidDuration + constants.raidPreparationDuration + 10) * 60 * 1000;

        const possibleDuplicates = channels.filter(channel => new RegExp(gymName, 'gi').test(channel.name));
        possibleDuplicates.forEach(function (duplicate) {
            const duplicateNameData = duplicate.name.split('-');
            const duplicateEndTime = utils.stringToDate(duplicateNameData[duplicateNameData.length - 1]);
            if (endTime.getTime() - totalRaidTime < duplicateEndTime.getTime()) {
                reject('Un salon existe déjà pour ce raid : <#' + duplicate.id + '>');
            }
        });
        resolve();
    });
};
