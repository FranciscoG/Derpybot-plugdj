'use strict';

module.exports = function(bot, db, data) {
  const uid = data.user.id;
  const username = data.user.username;
  const queue = bot.getQueue();
  const boothTime = 0;
  const inQueue = false;

  for(const i = 0; i < queue.length; i++){
    if(queue[i].uid !== uid){
        boothTime += queue[i].media.songLength / 1000 / 60;
    } else {
      inQueue = true;
      break;
    }
  }

  if (!inQueue) {
    return bot.sendChat('@' + username + ', you\'re not currently in the queue!');
  }

  if (Math.round(boothTime) === 0) {
    return bot.sendChat('@' + username + ', your song will play at the end of this song!');
  }

  bot.sendChat('@' + username + ', your song will play in about ' + Math.round(boothTime) + ' minutes!');
};
