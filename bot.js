let Discord = require('discord.js');
let logger = require('winston');
let auth = require('./data/auth.json');
let colorManager = require('./main/colorManager.js');
let channelManager = require('./main/channelManager.js');

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
    if (msg.content.substring(0, 1) === "!") {
        let args = msg.content.substring(1).split(' ');
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
            case "liste":
                channelManager.list(args[0], msg);
        }
    }
});
