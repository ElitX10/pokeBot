const utils = require('./utils.js');
const constants = require('./constants.js');

exports.handleParticipation = function(cmd, args, msg){
    const server = msg.guild;
    if(msg.channel.parentID === utils.getRaidCatId(server)){
        // récupération du message avec la liste des participants au raid
        getParticipationMsg(msg.channel).then((participationMsg) => {
            let messContent = participationMsg.content;
            let participantData = getParticipantData(messContent);
            const userMessageData = getMsgData(args, msg);

            // vérification du format de l'heure
            checkTime(userMessageData.time, msg.channel.name).then((time) => {
                // on supprime la propiété time de l'utilisateur
                delete userMessageData.time;
                if (time){
                    // on prend une copie des user présent dans la session sans horaire
                    let usersCopy = [];
                    if(participantData[0].time === null){
                        usersCopy = participantData[0].users;
                    }
                    let selectedSession = participantData.find((session) => {
                        return session.time && session.time.getTime() === time.getTime();
                    });
                    // si une session avec cette horaire existe
                    if (selectedSession) {
                        selectedSession = changeUserDataInSession(selectedSession, cmd, userMessageData);
                    } else { // sinon on créer la session
                        if(cmd === "+"){
                            let newSession = {
                                time: time,
                                // on met la copy des users avec le nvx user
                                users: usersCopy.concat([userMessageData])
                            };
                            // TODO : gérer le cas ou l'utilisateur qui créer la sessions est déjà dans la liste usersCopy
                            participantData.push(newSession);
                            // on supprime les utilisateurs de la session sans horaire
                            if(participantData[0].time === null){
                                participantData[0].users = [0];
                            }
                            // TODO message pour prevenir les autres users de la création de session
                        }
                    }
                } else {
                    let selectedSession = participantData.find((session) => {
                        return session.time === null;
                    });
                    // si une session sans horaire existe :
                    if(selectedSession){
                        selectedSession = changeUserDataInSession(selectedSession, cmd, userMessageData);
                    } else { // sinon on prend la session avec la plus petite horaire
                        selectedSession = changeUserDataInSession(participantData[0], cmd, userMessageData);
                    }
                }
                participantData = cleanData(participantData);
                participationMsg.edit(convertDataToString(participantData, msg)).then(() => {
                    msg.react('✅');
                }).catch(err=>console.log(err));
            }).catch((err) => {
                // TODO : message du bot ?
                msg.channel.send(utils.mention(msg) + err);
            });
        }).catch(err => console.log(err));
    }
}

// récupère le message pour la participation à un raid
getParticipationMsg = function(channel){
    return new Promise(function(resolve, reject){
        channel.fetchPinnedMessages().then(res => {
            const participationMsg = res.find(mess => {
                return mess.content.split('\n')[0] === constants.participantsMsgHeader;
            });
            resolve(participationMsg);
        }).catch(err => reject(err));
    });
}

// Récupère les données du message contenant les participations
getParticipantData = function(msgContent){
    let data = msgContent.split('\n');
    // on enlève les strings pour le style du msg
    data = data.filter((string) => {
        return string !== "```"
    });
    data = data.slice(1, data.length - 1);
    let finalData;
    if (data.length !== 0 && isSessionDelimiter(data[0])) {
        finalData = [];
        let customSession;
        data.forEach(item => {
            if(item.split(' ')[0] !== "**TOTAL**"){
                if(isSessionDelimiter(item)){ // nvlle session
                    if(customSession) finalData.push(customSession);
                    customSession = {
                        time: utils.stringToDate(item.split(' de ')[1]),
                        users: []
                    }
                } else { // ajout de item dans les users de la session
                    customSession.users.push(getUserData(item));
                }
            }
        });
        finalData.push(customSession);
    } else {
        finalData = [{
            time: null,
            users: data.map(user => {
                return getUserData(user);
            })
        }];
    }
    return finalData;
}

convertDataToString = function(data, msg){
    let mess = constants.participantsMsgHeader;
    let total = 0;
    data.forEach((session) => {
        if (session.time !== null) {
            mess += "\n```"
            mess += "\nSession de " + utils.dateToString(session.time);
            mess += "\n```"
        }
        // compte des utilisateurs :
        let nbrRed = countParticipant(session.users.filter(user => user.team === constants.valor));
        let nbrBlue = countParticipant(session.users.filter(user => user.team === constants.mystic));
        let nbrYellow = countParticipant(session.users.filter(user => user.team === constants.instinct));
        let nbrOther = countParticipant(session.users.filter(user => user.team === constants.questionMark));
        total += nbrRed + nbrBlue + nbrYellow + nbrOther;
        // passage des données des users en strings
        mess += session.users.map((user) => {
            if (constants.emojiListNumber[user.number - 1]){
                user.number = constants.emojiListNumber[user.number - 1]
            }
            return "\n" + user.number + " " + user.team + " **" + user.userName + "** " + user.comment;
        }).join('');
        // total mess
        mess += utils.counterString(nbrRed, nbrBlue, nbrYellow, nbrOther);
    });
    changeChannelName(total, msg.channel);
    // on met un compteurs à 0 si il n'y a plus personne
    if(data.length === 0){
        mess += utils.counterString(0, 0, 0, 0);
    }
    return mess;
}

isSessionDelimiter = function(string){
    return string.split(' de ')[0] === "Session"
}

// récupère les données d'un utilisateur à partir d'un
// string du message contenant les participations
getUserData = function(string){
    let dataString = string.split(' ');
    let nbr = dataString[0];
    if(constants.emojiListNumber.includes(nbr)){
        nbr = constants.emojiListNumber.indexOf(nbr) + 1;
    } else {
        nbr = parseInt(nbr.replace(/\*/g, ''));
    }
    const team = dataString[1];
    dataString = dataString.splice(2).join(' ').split("**");
    const userName = dataString[1];
    const comment = dataString.splice(2).join('');

    return {
        number: nbr,
        team: team,
        userName: userName,
        comment: comment.replace(/^\s*/, '')
    }
}

// récupère les données du message de l'utilisateur
getMsgData = function(args, msg){
    const nbr = parseInt(args[0]);
    const userName = msg.member.nickname ? msg.member.nickname : msg.member.user.username;
    const team = getColor(msg.member);
    // on récupère l'heure de la session si elle existe
    let time = null;
    args = args.splice(1);
    const regexp = /^\d{1,2}(h|:)\d{0,2}$/gi;
    if(regexp.test(args[0])){
        time = utils.stringToDate(args[0]);
        args = args.splice(1);
    }
    const comment = args.join(' ');
    return {
        number: nbr,
        team: team,
        userName: userName,
        time: time,
        comment: comment.replace(/^\s*/, '')
    }
}

// récupère la couleur d'un utilisateur
getColor = function(member){
    let color = constants.questionMark;
    if (member.roles.find(r => r.name === "Red team")) {
        color = constants.valor;
    } else if (member.roles.find(r => r.name === "Blue team")) {
        color = constants.mystic;
    } else if (member.roles.find(r => r.name === "Yellow team")) {
        color = constants.instinct;
    }
    return color;
}

// récupère le nombre de participation
getNumber = function(number) {
    return constants.emojiListNumber[number - 1] ?
            constants.emojiListNumber[number - 1] : '**' + number + '**';
}

// vérifie si l'heure de la session est comprise entre le début et la fin du raid
checkTime = function(time, channelName){
    return new Promise(function(resolve, reject){
        const endTime = utils.stringToDate(channelName.split('-')[channelName.split('-').length - 1]);
        const startTime = utils.addMinToTime(endTime, -constants.raidDuration);
        if (!time) resolve(null);
        if (time >= startTime && time < endTime){
            resolve(time);
        } else {
            reject("Impossible de créer une session à " + utils.dateToString(time) + ".");
        }
    });
}

// gere l'ajout ou la suppression de participation d'un user dans une session
changeUserDataInSession = function(session, cmd, userMessageData){
    const currentSession = session;
    // on cherche si l'utilisateur est déjà présent
    let selectedUser = currentSession.users.find((user) => {
        return user.userName === userMessageData.userName;
    });
    if(selectedUser){ // si il est présent on modifie le nbr de compte
        selectedUser.comment = userMessageData.comment;
        if (cmd === "+") {
            selectedUser.number += userMessageData.number;
        }else{
            selectedUser.number -= userMessageData.number;
        }
    }else{ // sinon on ajoute l'utilisateur
        if(cmd === "+"){
            currentSession.users.push(userMessageData);
        }
    }
    return currentSession;
}

cleanData = function(data){
    let cleanData = data;
    // on supprime les utilisateurs avec des nombres de participation <= 0
    cleanData = cleanData.map((session) => {
        session.users = session.users.filter((user)=>{
            return user.number > 0;
        });
        return session;
    });
    // on supprime les sessions vides et on les tri par 'time'
    cleanData = cleanData.filter((session)=>{
        return session.users.length > 0;
    }).sort(function(a,b){
        return new Date(a.time) - new Date(b.time);
    });
    return cleanData;
}

// retourne le nombre de participation pour une liste de user
countParticipant = function(users){
    let total = 0;
    if (users){
        users.forEach((user) => {
            total += user.number;
        });
    }
    return total;
}

// change le nom du salon en fct du nbr de participants
changeChannelName = function(nbr, channel) {
    let channelName = channel.name.split('-');
    channelName[0] = nbr + "";
    channel.setName(channelName.join('-')).catch(err => console.log(err));
}
