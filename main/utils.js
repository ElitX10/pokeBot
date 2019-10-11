const constants = require('./constants.js');

exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send(exports.mention(msg) + "La commande '" + cmd
                        + "' doit être utilisée dans le salon " + expectedChannel) + ".";
    return rightChannel;
}

exports.mention = function(msg) {
    return "<@" + msg.member.user.id + "> ";
}

// retourne l'id de la catégory pour les raids
exports.getRaidCatId = function(server) {
    return server.channels.find(channel => channel.name === "raids").id;
}

// converti un string au format 00h00, 00:00 ou 10min en Date
exports.stringToDate = function(timeString) {
    const regexFullTime = /^\d{1,2}(h|:)\d{0,2}$/gi;
    const regexMin = /^\d{1,2}(m(in)?)?$/gi;
    let time = null;

    if (regexFullTime.test(timeString)) {
        time = new Date();
        const hour = timeString.split(/h|:/i)[0];
        const minute = timeString.split(/h|:/i)[1] ? timeString.split(/h|:/i)[1] : "0";
        time.setHours(parseInt(hour));
        time.setMinutes(parseInt(minute));
    } else if (regexMin.test(timeString)) {
        time = new Date();
        const minToAdd = parseInt(timeString);
        time = addMinToTime(time, minToAdd);;
    }
    // on met les secondes et milliseconfs a 0 pour permettre les comparraisons
    if (time) {
        time.setMilliseconds(0);
        time.setSeconds(0);
    }
    return time;
}

exports.dateToString = function(date){
    const zero = date.getMinutes() < 10 ? "0" : "";
    return date.getHours() + "h" + zero + date.getMinutes();
}

// retourne une date avec un décalage en minute (min)
exports.addMinToTime = function(time, min){
    return new Date(time.getTime() + min * 60 * 1000);
}
addMinToTime = function(time, min){
    return new Date(time.getTime() + min * 60 * 1000);
}

exports.counterString = function(red, blue, yellow, other){
    let msg = "\n**TOTAL** : " + constants.valor + " x**" + red + "** | "
    + constants.mystic + " x**" + blue + "** | "+ constants.instinct
    + " x**" + yellow + "**";
    if (other > 0) {
        msg += " | " + constants.questionMark + " x**" + other + "**"
    }
    return msg;
}
