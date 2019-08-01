let Discord = require('discord.js');
let logger = require('winston');
let auth = require('./data/auth.json');
let color = require('./main/color.js');
let Promise = require('promise');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
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
                if (checkChannel("choix-équipe", "!team", msg)) color.colorPicker(args[0], msg);
                break;
            case "equipe":
                if (checkChannel("choix-équipe", "!equipe", msg)) color.colorPicker(args[0], msg);
                break;
        }
    }
});

checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send("La commande '" + cmd + "' doit être utilisée dans le salon " +
        expectedChannel);
    return rightChannel;
}