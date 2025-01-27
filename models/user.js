const constants = require('../main/constants');

class User {

    #number;
    #team;
    #userName;
    #comment;

    /**
     * Créer une instance de User
     * @param {boolean} fromString
     * @param {string} dataString
     * @param {int} number
     * @param {string} team
     * @param {string} userName
     * @param {string} comment
     */
    constructor(fromString, dataString, number = 0, team = '', userName = '', comment = '') {
        if (fromString) {
            let dataArray = dataString.split(' ');
            // nombre de participation
            let nbr = dataArray[0];
            if (constants.emojiListNumber.includes(nbr)) {
                this.#number = constants.emojiListNumber.indexOf(nbr) + 1;
            } else {
                this.#number = parseInt(nbr.replace(/\*/g, ''));
            }
            // équipe
            this.#team = dataArray[1];
            // pseudo
            // on enlève le nbr et l'équipe et on refait le tableau pour pour identifier le nom de l'utilisateur

            dataArray = dataArray.splice(2).join(' ').split('**');
            this.#userName = dataArray[1];
            // commentaire
            this.#comment = dataArray.splice(2).join('');
        } else {
            this.#number = number;
            this.#userName = userName;
            this.#team = team;
            this.#comment = comment;
        }
    }

    get number() {
        return this.#number;
    }

    set comment(comment) {
        this.#comment = comment;
    }

    /**
     * Retourne les infos de l'instance de User
     * @returns {string}
     */
    toString() {
        return '{this.number = ' + JSON.stringify(this.#number) +
            '\nthis.team = ' + JSON.stringify(this.#team) +
            '\nthis.userName = ' + JSON.stringify(this.#userName) +
            '\nthis.comment = ' + JSON.stringify(this.#comment) + '}';
    }

    /**
     * Retourne true si l'userName de l'instance correspond à 'name'
     * @param {string} name
     * @returns {boolean}
     */
    matchWithName(name) {
        return this.#userName === name;
    }

    /**
     * Change le nombre de participation de l'utilisateur
     * @param {string} cmd
     * @param {int} newNbr
     */
    changeParticipationNumber(cmd, newNbr) {
        if (cmd === '+') {
            this.#number += newNbr;
        } else {
            this.#number -= newNbr;
        }
    }

    /**
     * Retourne true si l'utilisateur participe au raid
     * @returns {boolean}
     */
    isParticipating() {
        return this.#number > 0;
    }

    /**
     * Retourne true si la couleur de l'utilisateur correspond à 'color'
     * @param {string} color
     * @returns {boolean}
     */
    isColor(color) {
        switch (color) {
            case 'red':
                return this.#team === constants.valor;
            case 'yellow':
                return this.#team === constants.instinct;
            case 'blue':
                return this.#team === constants.mystic;
            default:
                return this.#team === constants.questionMark;
        }
    }

    /**
     * Retourne un string pour la participation à un raid
     * @returns {string}
     */
    participationString() {
        let number = this.#number;
        if (constants.emojiListNumber[number - 1]) {
            number = constants.emojiListNumber[number - 1];
        }
        return '\n' + number + ' ' + this.#team + ' **'
            + this.#userName + '** ' + this.#comment;
    }
}

module.exports = User;
