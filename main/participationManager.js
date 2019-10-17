const utils = require('./utils.js');
const constants = require('./constants.js');
const SessionsData = require('../models/sessionsData');
const RaidMessage = require('../models/raidMessage');

/**
 * Gère la participation ou non à un raid
 * @param {string} cmd
 * @param {Array<string>} args
 * @param {Message} msg
 */
exports.handleParticipation = function (cmd, args, msg) {
    const server = msg.guild;
    if (msg.channel.parentID === utils.getRaidCatId(server)) {
        // récupération du message avec la liste des participants au raid
        getParticipationMsg(msg.channel).then((participationMsg) => {
            let messContent = participationMsg.content;

            const sessionsData = new SessionsData(messContent);
            const raidMessage = new RaidMessage(args, msg);

            raidMessage.checkTime(msg.channel.name).then(() => {
                participationMsg.edit(sessionsData.updateSessions(raidMessage, cmd, msg.channel)).then(() => {
                    msg.react('✅');
                }).catch(err => console.log(err));
            }).catch(err => msg.channel.send(utils.mention(msg) + err));
        }).catch(err => console.log(err));
    }
};

/**
 * Récupère le message pour la participation à un raid
 * @param {TextChannel} channel
 * @returns {Promise<Message>}
 */
getParticipationMsg = function (channel) {
    return new Promise(function (resolve, reject) {
        channel.fetchPinnedMessages().then(res => {
            const participationMsg = res.find(mess => {
                return mess.content.split('\n')[0] === constants.participantsMsgHeader;
            });
            resolve(participationMsg);
        }).catch(err => reject(err));
    });
};