'use strict';
/**
 * !front
 * Move a user to the front of the queue
 * usage: !front @username
 */

module.exports = function(bot, db, data) {
  if (!bot.havePermission(data.user.id, bot.ROOM_ROLE.BOUNCER)) {
    bot.sendChat(
      `@${data.user.username}, only room bouncers or above can kickskip`
    );
    return;
  }

  if (data.mentions.length === 0) {
    bot.sendChat(`@${data.user.username} you didn't select a user. You need to @[username] to move them to the front of the waitlist`);
    return;
  }

  if (data.mentions.length > 1) {
    bot.sendChat(`@${data.user.username} you can only move one person to the front of the waitlist at a time`);
    return;
  }

  if (data.mentions.length === 0 && data.args.length > 0) {
    bot.sendChat(`@${data.user.username} you need to @[username] to move them to the front of the waitlist`);
    return;
  }
  
  // finally 
  const recipient = bot.mentions[0];
  const queuePosition = bot.getWaitListPosition(recipient.id);
  
  if (queuePosition > 0) {
    bot.moderateMoveDJ(recipient.id, 0, function(){});
  } else if (queuePosition === 0){
    bot.sendChat(`@${recipient.username} is already at the front of the waitlist`);
  } else{
    bot.sendChat(`@${recipient.username} is not in the waitlist`);
  }

};