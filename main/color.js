
// liste des couleurs possible :
const possibleColor = ["bleu", "blue", "red", "rouge", "yellow", "jaune"];

// fct permettant la gestion du choix de couleurs d'équipe
exports.colorPicker = function(color, msg){
  // liste des rôles pour la couleur
  const blue = msg.guild.roles.find(role => role.name === "Blue team");
  const red = msg.guild.roles.find(role => role.name === "Red team");
  const yellow = msg.guild.roles.find(role => role.name === "Yellow team");
  // utilisateur ayant demandé le changement de couleur
  const member = msg.member;

  if(possibleColor.includes(color)){
    // on enlève les rôles de couleurs existants
    const redProm = member.removeRole(red);
    const blueProm = member.removeRole(blue);
    const yellowProm = member.removeRole(yellow);
    Promise.all([redProm, blueProm, yellowProm]).then(() => {
      // attribution de la nouvelle couleur
      switch (color) {
        case "blue":
          changeColorTo(blue, msg);
          break;
        case "bleu":
          changeColorTo(blue, msg);
          break;
        case "red":
          changeColorTo(red, msg);
          break;
        case "rouge":
          changeColorTo(red, msg);
          break;
        case "yellow":
          changeColorTo(yellow, msg);
          break;
        case "jaune":
          changeColorTo(yellow, msg);
          break;
      }
    }).catch((err) => console.log(err));
  } else {
    msg.channel.send("Couleur invalide ! Veuillez choisir parmis les couleurs suivantes : "
      + possibleColor.join(', '));
  }
}

// permet d'affecter un role pour changer la couleur
changeColorTo = function(role, msg){
  msg.member.addRole(role).then(() => {
    msg.react('✅');
  }).catch((err) => console.log(err));// TODO: utiliser le logger
}
