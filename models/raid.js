const utils = require('../main/utils.js');
const constants = require('../main/constants.js');

class Raid {

    #pokemon;
    #gym;
    #startTime;
    #inputData = {
        pokemonName: '',
        gymName: '',
        startTime: null
    };

    /**
     * Créer une instance de Raid
     * @param {Array<string>} raidArgs
     */
    constructor(raidArgs) {
        // nom du pokemon
        this.#inputData.pokemonName = raidArgs[0].toLowerCase();

        // nom de l'arene
        let gymName = raidArgs[1];
        let index = 2;
        while (raidArgs[index] && raidArgs[index][0] !== '@'
        && raidArgs[index][0] !== '$') {
            gymName = gymName + ' ' + raidArgs[index];
            index++;
        }
        this.#inputData.gymName = gymName.toLowerCase();

        // heure de début du raid
        let timeData = raidArgs[index];
        if (timeData) {
            const timeParam = timeData[0];
            if (timeParam === '@' || timeParam === '$') {
                timeData = timeData.substring(1);
                this.#inputData.startTime = utils.stringToDate(timeData);
                if (this.#inputData.startTime && timeParam === '$') {
                    this.#inputData.startTime = utils.addMinToTime(this.#inputData.startTime, -constants.raidDuration);
                }
            }
        }
    }

    /**
     * Retourne les infos de l'instance de Raid
     * @returns {string}
     */
    toString() {
        return '{this.pokemon = ' + JSON.stringify(this.#pokemon) +
            '\nthis.gym = ' + JSON.stringify(this.#gym) +
            '\nthis.startTime = ' + this.#startTime +
            '\nthis.inputData = ' + JSON.stringify(this.#inputData) + '}';
    }

    /**
     * Permet de vérifier les différentes propriétés du raid
     * @param {string} property
     * @returns {Promise}
     */
    check(property) {
        switch (property) {
            case 'pokemon':
                return this._checkPokemon();
            case 'gym':
                return this._checkGym();
            case 'startTime':
                return this._checkStartTime();
            default:
                break;
        }
    }

    /**
     * Retourne le nom du salon à partir des données du raid
     * @returns {string}
     */
    getRaidChannelName() {
        const endTime = utils.addMinToTime(this.#startTime, constants.raidDuration);
        return '0-' + this.#pokemon.name + '-' + this.#gym.name.replace(/'/g, ' ').split(' ').join('-')
            + '-fin-' + utils.dateToString(endTime);
    }

    /**
     * Permet la création du message avec les informations du raid
     * @param {TextChannel} channel
     */
    channelInfoMessage(channel) {
        let msg = '**Pokemon** : ' + this.#pokemon.name;
        msg += '\n**Horaire** : ' + utils.dateToString(this.#startTime);
        msg += ' -> ' + utils.dateToString(utils.addMinToTime(this.#startTime, constants.raidDuration));
        msg += '\n**Arène** : ' + this.#gym.name;
        msg += '\n**Adresse** : ' + this.#gym.address;
        msg += '\n**Google Maps** : https://www.google.com/maps?daddr=' + this.#gym.maps;

        // envoie du msg
        channel.send(msg).then(res => {
            // pour épingler le message
            res.pin().catch((err) => console.log(err));
            this._createParticipantMessage(channel);
        }).catch((err) => console.log(err));
    }

    /**
     * Vérifie que le pokemon existe dans le json pokemon.json
     * @returns {Promise}
     * @private
     */
    _checkPokemon() {
        let self = this;
        return new Promise(function (resolve, reject) {
            const pokemon = constants.pokemonList.find(poke => poke.name === self.#inputData.pokemonName);
            if (pokemon) {
                self.#pokemon = pokemon;
                resolve();
            } else {
                reject('Le pokemon ' + self.#inputData.pokemonName
                    + ' n\'est pas disponible dans les raids (ou est mal écrit).');
            }
        });
    }

    /**
     * Vérifie que l'arène existe dans le json gyms.json
     * @returns {Promise}
     * @private
     */
    _checkGym() {
        let self = this;
        return new Promise(function (resolve, reject) {
            const gym = constants.gymsList.find(gym => gym.name === self.#inputData.gymName
                || gym.alias === self.#inputData.gymName);
            if (gym) {
                self.#gym = gym;
                resolve();
            } else {
                reject('L\'arène \'' + self.#inputData.gymName
                    + '\' n\'est pas connue (ou est le nom de l\'arène est mal écrit).\n'
                    + 'Vous pouvez voir la liste des arènes avec la commande \'!liste arenes\''
                    + ' ou proposer l\'ajout d\'une arène dans le salon ajout-arènes.');
            }
        });
    }

    /**
     * Vérifie s'il y a une heure valide de renseignée
     * @returns {Promise}
     * @private
     */
    _checkStartTime() {
        let self = this;
        return new Promise(function (resolve, reject) {
            if (self.#inputData.startTime) {
                self.#startTime = self.#inputData.startTime;
                resolve();
            } else {
                reject('Le format de l\'heure est invalide : '
                    + 'utilisez \'@\' (pour le début du raid) ou \'$\' (pour la fin du raid) '
                    + 'suvi de l\'heure (00:00 ou 00h00) ou du temps avant le début ou la '
                    + 'fin du raid (10, 10m ou 10min)');
            }
        });
    }

    /**
     * Permet la création du message avec la liste des participants
     * @param {TextChannel} channel
     * @private
     */
    _createParticipantMessage(channel) {
        let msg = constants.participantsMsgHeader;
        msg += utils.counterString(0, 0, 0, 0);

        channel.send(msg).then(res => {
            // pour épingler le message
            res.pin().catch((err) => console.log(err));
        }).catch((err) => console.log(err));
    }
}

module.exports = Raid;
