const fs = require('fs');

exports.raidDuration = 45;
exports.raidPreparationDuration = 60;

// emoji des équipes
exports.valor = "<:valor:610808872961048602>";
exports.mystic = "<:mystic:610809793904640019>";
exports.instinct = "<:instinct:610809791253577738>";

exports.questionMark = '❔';
exports.emojiListNumber = [':one:',':two:',':three:',':four:',':five:',':six:',
                    ':seven:',':eight:',':nine:',':keycap_ten:'];

exports.participantsMsgHeader = "**Liste des participants** :";

exports.pokemonList = JSON.parse(fs.readFileSync('././data/pokemon.json')).pokemonList.filter(pokemon => {
    return pokemon.isActif;
}).sort((a,b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
});

exports.gymsList = JSON.parse(fs.readFileSync('././data/gyms.json')).gyms.sort((a,b) => {
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
});
