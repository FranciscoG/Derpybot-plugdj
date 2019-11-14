"use strict";
/************************************
 * !kickskip
 * Skips the current DJ and kicks out of the waitlist
 */
module.exports = function(bot, db, data) {
  if (!bot.havePermission(data.user.id, bot.ROOM_ROLE.BOUNCER)) {
    bot.sendChat(
      `@${data.user.username}, only room bouncers or above can kickskip`
    );
    return;
  }
  const dj = bot.getDJ();
  bot.moderateForceSkip(function() {
    bot.moderateRemoveDJ(dj.id, function() {
      bot.sendChat(
        `@${dj.username} you have been skipped and removed from the waitlist.`
      );
    });
  });
};
