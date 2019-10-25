const User = require('./user');
const RaidMessage = require('./raidMessage');
const utils = require('../main/utils');

class Session {

    #time;
    #users = [];

    constructor(time, users = []) {
        this.#time = time;
        this.#users = users;
    }

    get users() {
        return this.#users;
    }

    get time() {
        return this.#time;
    }

    set users(users){
        this.#users = users;
    }

    /**
     * Retourne les infos de l'instance de Session
     * @returns {string}
     */
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
     * Met à jour les données de la session à partir des données de raidMessage
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

    /**
     * Nettoie la session en enlevant les users sans participation
     */
    cleanSession() {
        this.#users = this.#users.filter((user) => {
            return user.isParticipating();
        });
    }

    /**
     * Retourne true si une session n'a pas d'utilisateur
     * @returns {boolean}
     */
    isEmpty() {
        return this.users.length === 0;
    }

    /**
     * Renvoie les données concernant la session
     * @returns {{total: int, string: string}}
     */
    getSessionToString() {
        let mess = '';
        let total = 0;
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

    /**
     * Retourne le nombre de participation pour une couleur donnée
     * @param {string} color
     * @returns {number}
     * @private
     */
    _countParticipant(color) {
        let colorUsers = this.#users.filter(user => user.isColor(color));
        let count = 0;
        colorUsers.forEach((user) => {
            count += user.number;
        });
        return count;
    }
}

module.exports = Session;

