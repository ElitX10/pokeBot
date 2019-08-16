exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send(mention(msg) + "La commande '" + cmd
                        + "' doit être utilisée dans le salon " + expectedChannel) + ".";
    return rightChannel;
}

exports.mention = function(msg) {
    return "<@" + msg.member.user.id + "> ";
}


// emoji des équipes
exports.valor = "<:valor:610808872961048602>";
exports.mystic = "<:mystic:610809793904640019>";
exports.instinct = "<:instinct:610809791253577738>";
