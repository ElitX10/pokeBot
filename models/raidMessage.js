const constants = require('../main/constants');
const utils = require('../main/utils');

class RaidMessage {

    #number;
    #team;
    #userName;
    #comment;
    #time = null;

    constructor(args, msg) {
        this.#number = parseInt(args[0]);
        this.#userName = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
        this.#team = this._getColor(msg.member);

        // heure si elle existe
        const regexp = /^\d{1,2}([h:])\d{0,2}$/gi;
        if (regexp.test(args[1])) {
            this.#time = utils.stringToDate(args[1]);
        }

        // pour le commentaire on doit enlever le ou les 2 premier(s) elt du tableau args
        args = this.#time ? args.splice(2) : args.splice(1);
        this.#comment = args.join(' ');
    }

    get time(){
        return this.#time;
    }

    get userName(){
        return this.#userName;
    }

    get comment(){
        return this.#comment;
    }

    get number(){
        return this.#number;
    }

    get team(){
        return this.#team;
    }

    /**
     * Vérifie si l'heure de la session est comprise entre le début et la fin du raid
     * @param {string} channelName
     * @returns {Promise<Date>}
     */
    checkTime(channelName){
        const self = this;
        return new Promise(function (resolve, reject) {
            const raidEntTime = utils.stringToDate(channelName.split('-')[channelName.split('-').length - 1]);
            const raidStartTime = utils.addMinToTime(raidEntTime, -constants.raidDuration);
            if(!self.#time) resolve();
            if (self.#time >= raidStartTime && self.#time < raidEntTime) {
                resolve();
            } else {
                reject('Impossible de créer une session à ' + utils.dateToString(self.#time) + '.');
            }
        })
    }

    // récupère la couleur d'un utilisateur
    _getColor(member) {
        let color = constants.questionMark;
        if (member.roles.find(r => r.name === 'Red team')) {
            color = constants.valor;
        } else if (member.roles.find(r => r.name === 'Blue team')) {
            color = constants.mystic;
        } else if (member.roles.find(r => r.name === 'Yellow team')) {
            color = constants.instinct;
        }
        return color;
    };
}

module.exports = RaidMessage;
