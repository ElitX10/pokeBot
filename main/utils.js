exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send(mention(msg) + "La commande '" + cmd
                        + "' doit être utilisée dans le salon " + expectedChannel) + ".";
    return rightChannel;
}

exports.mention = function(msg) {
    return "<@" + msg.member.user.id + "> ";
}
