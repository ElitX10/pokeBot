const User = require('./user');
const RaidMessage = require('./raidMessage');
const utils = require('../main/utils');

class Session {

    #time;
    #users = [];

    constructor(time, users) {
        this.#time = time;
        if (users) this.#users = users;
    }

    get users() {
        return this.#users;
    }

    get time() {
        return this.#time;
    }

    toString() {
        return '{this.time = ' + JSON.stringify(this.#time) +
            '\nthis.users = ' + this.#users.map((user) => {
                return user.toString();
            }) + '}';
    }

    /**
     * Ajoute un utilisateur à la session
     * @param {User} user
     */
    addUser(user) {
        this.#users.push(user);
    }

    /**
     * Retourne true si l'heure de la session correspond à 'time'
     * @param {Date} time
     * @returns {boolean}
     */
    matchWithTime(time) {
        return this.#time && this.#time.getTime() === time.getTime();
    }

    /**
     *
     * @param {RaidMessage} raidMessage
     * @param {string} cmd
     */
    updateSession(raidMessage, cmd) {
        // on cherche si l'utilisateur est déjà présent
        let selectedUser = this.#users.find((user) => {
            return user.matchWithName(raidMessage.userName);
        });
        if (selectedUser) { // s'l est présent on modifie le nbr de compte
            selectedUser.comment = raidMessage.comment;
            selectedUser.changeParticipationNumber(cmd, raidMessage.number);
        } else if (cmd === '+') { // sinon on ajoute l'utilisateur
            this.addUser(new User(false, '',
                raidMessage.number, raidMessage.team,
                raidMessage.userName, raidMessage.comment));
        }
    }

    cleanSession() {
        this.#users = this.#users.filter((user) => {
            return user.isParticipating();
        });
    }

    isEmpty() {
        return this.users.length === 0;
    }

    getSessionToString(total) {
        let mess = '';
        if (this.#time) {
            mess += '\n```';
            mess += '\nSession de ' + utils.dateToString(this.#time);
            mess += '\n```';
        }
        // compte des utilisateurs :
        let nbrRed = this._countParticipant('red');
        let nbrBlue = this._countParticipant('blue');
        let nbrYellow = this._countParticipant('yellow');
        let nbrOther = this._countParticipant('');
        total += nbrRed + nbrBlue + nbrYellow + nbrOther;
        // passage des données des users en strings
        mess += this.users.map((user) => {
            return user.participationString();
        }).join('');
        // total de la session
        mess += utils.counterString(nbrRed, nbrBlue, nbrYellow, nbrOther);
        return {
            string: mess,
            total: total
        }
    }

    // retourne le nombre de participation pour une couleur donnée
    _countParticipant(color) {
        let colorUsers = this.#users.filter(user => user.isColor(color));
        let count = 0;
        // todo if (colorUsers) {
        colorUsers.forEach((user) => {
            count += user.number;
        });
        // todo }
        return count;
    }

}

module.exports = Session;

