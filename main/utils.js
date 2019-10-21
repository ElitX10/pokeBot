const constants = require('./constants.js');

/**
 * Vérifie que la commande 'cmd' est utilisé dans le bon salon
 * @param {string} expectedChannel
 * @param {string} cmd
 * @param {Message} msg
 * @returns {boolean}
 */
exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    // todo Trouver le channel dans le serveur pour avoir un lien cliquable
    if (!rightChannel) msg.channel.send(exports.mention(msg) + 'La commande \'' + cmd
        + '\' doit être utilisée dans le salon ' + expectedChannel + '.') ;
    return rightChannel;
};

/**
 * Retourne un texte permettant de mentionner l'utiliateur ayant envoyé le msg
 * @param {Message} msg
 * @returns {string}
 */
exports.mention = function (msg) {
    return '<@' + msg.member.user.id + '> ';
};

/**
 * Retourne l'id de la catégory pour les raids
 * @param {Guild} server
 * @returns {string}
 */
exports.getRaidCatId = function (server) {
    return server.channels.find(channel => channel.name === 'raids').id;
};

/**
 * Converti un string au format 00h00, 00:00 ou 10min en Date
 * @param {string} timeString
 * @returns {Date}
 */
exports.stringToDate = function (timeString) {
    const regexFullTime = /^\d{1,2}(h|:)\d{0,2}$/gi;
    const regexMin = /^\d{1,2}(m(in)?)?$/gi;
    let time = null;

    if (regexFullTime.test(timeString)) {
        time = new Date();
        const hour = timeString.split(/h|:/i)[0];// todo : mettre dans constants
        const minute = timeString.split(/h|:/i)[1] ? timeString.split(/h|:/i)[1] : '0';// todo : mettre dans constants
        time.setHours(parseInt(hour));
        time.setMinutes(parseInt(minute));
    } else if (regexMin.test(timeString)) {
        time = new Date();
        const minToAdd = parseInt(timeString);
        time = addMinToTime(time, minToAdd);
    }
    // on met les secondes et milliseconfs a 0 pour permettre les comparraisons
    if (time) {
        time.setMilliseconds(0);
        time.setSeconds(0);
    }
    return time;
};

/**
 * Converti une date en string au format 00h00
 * @param {Date} date
 * @returns {string}
 */
exports.dateToString = function (date) {
    const zero = date.getMinutes() < 10 ? '0' : '';
    return date.getHours() + 'h' + zero + date.getMinutes();
};

/**
 * Retourne une date avec un décalage en minute (min)
 * @param {Date} time
 * @param {int} min
 * @returns {Date}
 */
exports.addMinToTime = function (time, min) {
    return new Date(time.getTime() + min * 60 * 1000);
};
addMinToTime = function (time, min) {
    return new Date(time.getTime() + min * 60 * 1000);
};

/**
 * Retourne la partie du message pour le total des participations d'une session
 * @param {int} red
 * @param {int} blue
 * @param {int} yellow
 * @param {int} other
 * @returns {string}
 */
exports.counterString = function (red, blue, yellow, other) {
    let msg = '\n**TOTAL** : ' + constants.valor + ' x**' + red + '** | '
        + constants.mystic + ' x**' + blue + '** | ' + constants.instinct
        + ' x**' + yellow + '**';
    if (other > 0) {
        msg += ' | ' + constants.questionMark + ' x**' + other + '**'
    }
    return msg;
};