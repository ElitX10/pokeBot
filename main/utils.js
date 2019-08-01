exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send("La commande '" + cmd + "' doit être utilisée dans le salon " +
        expectedChannel);
    return rightChannel;
}