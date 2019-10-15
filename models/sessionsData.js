const Session = require('./session');
const User = require('./user');
const RaidMessage = require('./raidMessage');
const utils = require('../main/utils');
const constants = require('../main/constants');

class SessionsData {

    #sessions = [];

    constructor(msgContent) {
        // on enlève les strings pour le style du msg
        let msgArray = msgContent.split('\n').filter((string) => {
            return string !== '```'
        });
        // on enlève la 1ere ligne qui ne contient pas de donnée
        msgArray = msgArray.slice(1, msgArray.length - 1);

        // s'il y a des sessions avec une heure de defini
        if (msgArray.length !== 0 && this._isSessionDelimiter(msgArray[0])) {
            let sessionToAdd;
            msgArray.forEach(dataString => {
                // on ne prend pas en compte si il s'agit du Total des paticipations
                if (dataString.split(' ')[0] !== '**TOTAL**') {
                    if (this._isSessionDelimiter(dataString)) {
                        this._addSession(sessionToAdd);
                        sessionToAdd = new Session(utils.stringToDate(dataString.split(' de ')[1]));
                    } else {
                        sessionToAdd.addUser(new User(true, dataString));
                    }
                }
            });
            // on ajoute la dernière session de créée
            this._addSession(sessionToAdd);
        } else { // sinon, s'il n'y a qu'une session sans horaire
            this._addSession(new Session(null, msgArray.map((userString) => {
                return new User(true, userString);
            })));
        }

        console.log(this.toString());
    }

    toString() {
        return '{this.sessions = [' + this.#sessions.map((session) => {
            return session.toString() + ',';
        }) + ']}';
    }

    /**
     *
     * @param {RaidMessage} raidMessage
     * @param {string} cmd
     */
    updateSessions(raidMessage, cmd) {
        if (raidMessage.time) {
            // on prend une copie des user présent dans la session sans horaire
            let usersCopy = [];
            if (!this.#sessions[0]) {
                usersCopy = this.#sessions[0].users;
            }
            // session choisie par raidMessage
            let selectedSession = this.#sessions.find((session) => {
                return session.matchWithTime(raidMessage.time);
            });
            // si une session avec cette horaire existe
            if (selectedSession) {
                selectedSession.updateSession(raidMessage, cmd);
            } else { // sinon on créer la session
                if (cmd === '+') {
                    const newSession = new Session(raidMessage.time,
                        usersCopy.push(this._getUserFrom(raidMessage)));
                    this.#sessions.push(newSession);
                    // on supprime les utilisateurs de la session sans horaire
                    // TODO : gérer le cas ou l'utilisateur qui créer la sessions est déjà dans la liste usersCopy
                    if (this.#sessions[0].time === null) {
                        this.#sessions[0].users = [];
                    }
                    // TODO message pour prevenir les autres users de la création de session
                }
            }
        } else {
            this.#sessions[0].updateSession(raidMessage, cmd);
        }
        this._cleanData();
        log(this.getSessionsToString());
    }

    getSessionsToString() { // todo apeler ca
        let mess = constants.participantsMsgHeader;
        let total = 0;
        mess += this.#sessions.map((session) => {
            const sessionStringData = session.getSessionToString();
            total += sessionStringData.total;
            return sessionStringData.string;
        }).join('');
        // on met un compteurs à 0 si il n'y a plus personne
        if (this.#sessions.length === 0) {
            mess += utils.counterString(0, 0, 0, 0);
        }
        return mess;
    }

    /**
     * Permet de savoir si 'string' est un délimiteur de session
     * @param {string} string
     * @returns {boolean}
     * @private
     */
    _isSessionDelimiter(string) {
        return string.split(' de ')[0] === 'Session'
    };

    /**
     * Ajoute une session
     * @param {Session} session
     * @private
     */
    _addSession(session) {
        if (session) this.#sessions.push(session);
    }

    _getUserFrom(raidMessage) {
        return new User(false, '',
            raidMessage.number, raidMessage.team,
            raidMessage.userName, raidMessage.comment);
    }

    _cleanData() {
        this.#sessions.forEach((session) => {
            session.cleanSession();
        });
        this.#sessions = this.#sessions.filter((session) => {
            return !session.isEmpty();
        }).sort(function (a, b) {
            return new Date(a.time) - new Date(b.time);
        });
    }
}

module.exports = SessionsData;
