const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./data/auth.json');
const colorManager = require('./main/colorManager.js');
const channelManager = require('./main/channelManager.js');
const participationManager = require('./main/participationManager.js');
const raidManager = require('./main/raidManager.js');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorManagerize: true
});
logger.level = 'debug';

const client = new Discord.Client();
client.login(auth.token);

client.on('ready', () => {
    logger.info("Connected as " + client.user.tag);
});

client.on('message', (msg) => {
    const symbole = msg.content.substring(0, 1);
    if (["!", "+", "-"].includes(symbole)) {
        let args = msg.content.substring(1).split(' ');

        if (symbole === "!") {
            let cmd = args[0];
            args = args.splice(1);
            switch (cmd) {
                case "team":
                case "equipe":
                    colorManager.changeUserColor(args[0], msg, cmd);
                    break;
                case "raid":
                    channelManager.createChannel(args, msg);
                    break;
                case "list":
                case "liste":
                    channelManager.list(args[0], msg); // TODO pv list pokemon dans les salons dans cat raid
                    break;
                case "pokemon":
                    raidManager.changePokemon(args[0], msg);
                    //TODO : cmd pour indique le pokemon dans un raid (si egg)
                    break;
            }
        } else {
            participationManager.handleParticipation(symbole, args, msg);
        }
    }
    // suppression des messages indiquant qu'un message à été épinglé
    if(msg.type === "PINS_ADD") msg.delete().catch((err) => console.log(err));
});
