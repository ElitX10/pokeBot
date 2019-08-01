exports.createChannel = function (args, msg, client) {
    var server = msg.guild;

    const pokemonName = args[0];
    const arenaName = args[1];
    const time = args[2];
    let channelName;


    if (time[0] === '@') {

    } else {
        channelName = "0-" + pokemonName + "-" + arenaName + "-" + time;
    }
    var channel;

    console.log(client);

    server.createChannel(channelName, "text").then(() => {

        channel = client.channels.find("name", channelName);
        channel.setParent("606532668313567262");
        channel.send("C'est parti pour un raid!");

        setTimeout(function () {
            channel.delete();
        }, 45 * 60 * 1000);

    });

}