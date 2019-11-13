'use strict';

module.exports = function(bot, db, data) {
  if(!bot.hasPermission(data.user, 'queue-order')) {
    return;
  }

  if (typeof(data.args) === "undefined" || data.args.length === 0) {
    bot.sendChat("@" + data.user.username + " you didn't select a user. You need to @[username] to lock their queue");
    return;
  }

  if (data.args.length > 1) {
    bot.sendChat("@" + data.user.username + " you can only one lock one user's queue at a time");
    return;
  }

  if (data.args[0].charAt(0) !== "@") {
    bot.sendChat("@" + data.user.username + " you need to @[username] to lock their queue");
    return;
  }

  var recipient = bot.getUserByName(data.args[0].replace("@",""));
  var queuePosition = bot.getQueuePosition(recipient.id);
  
  if (queuePosition > 0) {
    bot.moderatePauseDJ(recipient.id, 0, function(){});
  } else {
    bot.sendChat("@" + recipient.username + " is not in the queue");
  }
};

module.exports.extraCommands = ['pause'];
