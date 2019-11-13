'use strict';
var skipService = require(process.cwd() + '/bot/utilities/skips');

module.exports = function(bot, db, data) {

  // if just !skip
  // or if too many arguments, then just plain skipping
  if (data.args.length === 0 || data.args.length > 1) {
    bot.moderateForceSkip(function(success){
      if (!success) {
        return bot.sendChat("Sorry I couldn't skip this song.");
      }
    });
    return;
  }

  switch(data.args[0].toLowerCase()){
    case 'broke':
    case 'broken':
        skipService.broken(bot, db, data);
        break;
    case 'nsfw':
        skipService.nsfw(bot, db, data);
        break;
    case 'op': 
        skipService.op(bot, db, data);
        break;
    case 'theme':
    case 'offtheme':
    case 'topic':
    case 'offtopic':
    case 'genre':
        skipService.theme(bot, db, data);
        break;
    case 'troll':
        skipService.troll(bot, db, data);
        break;
    default:
      bot.moderateForceSkip(function(success){
        if (!success) {
          bot.sendChat("Sorry I couldn't skip this song.");
        }
      });
        break;
  }

};
