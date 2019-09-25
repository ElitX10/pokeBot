const utils = require('./utils.js');

exports.handleParticipation = function(cmd, args, msg){
    const server = msg.guild;
    if(msg.channel.parentID === utils.getRaidCatId(server)){
        getParticipationMsg(msg.channel).then((participationMsg) => {
            let messContent = participationMsg.content;
            let participantData = getParticipantData(messContent);
            const userMessageData = getMsgData(args, msg);

            // console.log(participantData);
            console.log(userMessageData);

            checkTime(userMessageData.time, msg.channel.name).then((time) => {
                if (time){
                    console.log(time);
                } else {

                }
            }).catch((err) => {
                // TODO : message du bot ?
                console.log(err);
            });

            const msgHasSessionsTime = false;
            const sessionExist = false;
            const noSession = false;
            if(msgHasSessionsTime){ //TODO gérer les sessions
                if (sessionExist){
                    // TODO prendre la session
                } else {
                    // TODO créer la session
                }
            } else {
                // TODO trouver la session avec le plus de joueur
            }
            // TODO check cmd format
            if(cmd === "+"){
                const splitMsg = messContent.split('\n');
                const msgStart = splitMsg[0];

                // const nbr = getNumber(parseInt(args[0]));
                // const userName = msg.member.nickname;
                // const color = getColor(msg.member);
                // const comment = args.splice(1).join(' ');
                //
                // let users = '\n' + nbr + ' ' + color + ' **' + userName + '** ' + comment + '\n';

                // const mess = msgStart + users + msgEnd;
                // participationMsg.edit(mess).catch(err=>console.log(err));
            } else {
                let msg = "**Liste des participants** :";
                msg += "\n**TOTAL** : " + utils.valor + " x**0** | "
                    + utils.mystic + " x**0** | "+ utils.instinct +" x**0** ";
                participationMsg.edit(msg).catch(err=>console.log(err));
            }

        }).catch(err => console.log(err));
    }
}

// récupère le message pour la participation à un raid
getParticipationMsg = function(channel){
    return new Promise(function(resolve, reject){
        channel.fetchPinnedMessages().then(res => {
            const participationMsg = res.find(mess => {
                return mess.content.split('\n')[0] === "**Liste des participants** :";
            });
            resolve(participationMsg);
        }).catch(err => reject(err));
    });
}

// Récupère les données du message contenant les participations
getParticipantData = function(msgContent){
    let data = msgContent.split('\n');
    data = data.slice(1, data.length - 1);
    let finalData;
    if (isSessionDelimiter(data[0])) {
        finalData = [];
        let customSession;
        data.forEach(item => {
            if(isSessionDelimiter(item)){
                if(customSession) finalData.push(customSession);
                customSession = {
                    time: item.split(' : ')[1],
                    users: []
                }
            } else {
                customSession.users.push(item);
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

    // console.log(finalData);
    // console.log(finalData[0].users);
    return finalData;
}

convertDataToString = function(data){

}

isSessionDelimiter = function(string){
    return string.split(' : ')[0] === "Session"
}

// récupère les données d'un utilisateur à partir d'un
// string du message contenant les participations
getUserData = function(string){
    let dataString = string.split(' ');
    let nbr = dataString[0];
    if(utils.emojiListNumber.includes(nbr)){
        nbr = utils.emojiListNumber.indexOf(nbr) + 1;
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
        user: userName,
        comment: comment.replace(/^\s*/, '')
    }
}

// récupère les données du message de l'utilisateur
getMsgData = function(args, msg){
    const nbr = parseInt(args[0]);
    const userName = msg.member.nickname ? msg.member.nickname : msg.member.userName;
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
        user: userName,
        time: time,
        comment: comment.replace(/^\s*/, '')
    }
}

// récupère la couleur d'un utilisateur
getColor = function(member){
    let color = utils.questionMark;
    if (member.roles.find(r => r.name === "Red team")) {
        color = utils.valor;
    } else if (member.roles.find(r => r.name === "Blue team")) {
        color = utils.mystic;
    } else if (member.roles.find(r => r.name === "Yellow team")) {
        color = utils.instinct;
    }
    return color;
}

// récupère le nombre de participation
getNumber = function(number) {
    return utils.emojiListNumber[number - 1] ?
            utils.emojiListNumber[number - 1] : '**' + number + '**';
}

// vérifie si l'heure de la session est comprise entre le début et la fin du raid
checkTime = function(time, channelName){
    return new Promise(function(resolve, reject){
        const endTime = utils.stringToDate(channelName.split('-')[channelName.split('-').length - 1]);
        const startTime = utils.addMinToTime(endTime, -utils.raidDuration);
        if (!time) resolve(null);
        if (time >= startTime && time < endTime){
            resolve(time);
        } else {
            reject("Impossible de créer une session à " + utils.dateToString(time) + ".");
        }
    });
}
