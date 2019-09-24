exports.checkChannel = function (expectedChannel, cmd, msg) {
    const rightChannel = msg.channel.name === expectedChannel;
    if (!rightChannel) msg.channel.send(exports.mention(msg) + "La commande '" + cmd
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

exports.questionMark = '❔';
exports.emojiListNumber = [':one:',':two:',':three:',':four:',':five:',':six:',
                    ':seven:',':eight:',':nine:',':keycap_ten:'];

// retourne l'id de la catégory pour les raids
exports.getRaidCatId = function(server) {
    return server.channels.find(channel => channel.name === "raids").id;
}
