'use strict';
const roleChecker = require(process.cwd()+ '/bot/utilities/roleChecker.js');

module.exports = function(bot, db, data) {
  // if not at least a MOD, GTFO!
  if ( !roleChecker(bot, data.user, bot.ROOM_ROLE.MANAGER) ) {
    bot.sendChat('sorry, !shuffle can only be used by mods');
  }

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