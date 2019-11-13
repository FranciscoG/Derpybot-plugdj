'use strict';

function hasPermission(bot, user) {
  if (!user || !user.id) {
    bot.sendChat('unrecognized user id, try again');
    return false;
  }

  // if not at least a MOD, GTFO!
  if (!bot.havePermission(user.id, bot.ROOM_ROLE.MANAGER)) {
    bot.sendChat('sorry, !shuffle can only be used by mods');
    return false;
  }

  return true;
}

module.exports = function(bot, db, data) {
  const { user } = data;
  
  if (!hasPermission(bot,user)) return;

  bot.shufflePlaylist(
    bot.myconfig.playlistID,
    function(code, _data){
      if (code === 200) {
        bot.sendChat('Ok I shuffled my one and only playlist.');
      } else {
         bot.log('error','BOT', `Could not shuffle playlist - code: ${code}`);
         bot.sendChat("Got an errror shuffling playlist for some reasons (probably API error), try again.");
      }
    }
  );

  
};

module.exports.extraCommands = ['sp'];