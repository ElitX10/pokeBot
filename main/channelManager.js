exports.createChannel = function (args, msg, client) {
    var server = msg.guild;
    var channelName = args[0];
    var channel;

    server.createChannel(channelName, "text").then(() => {

        channel = client.channels.find("name", channelName);
        channel.send("C'est parti pour un raid!");

        setTimeout(function () {
            channel.delete();
        }, 45 * 60 * 1000);

    });

}