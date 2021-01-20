'use strict';
const skipService = require(process.cwd() + '/bot/utilities/skips');

function doSkip(bot) {
  bot.moderateForceSkip(function(err){
    if (err) {
      bot.log('error','BOT', `error skipping song ${err.message}`);
      bot.sendChat("Sorry I couldn't skip this song.");
    }
  });
}

module.exports = function(bot, db, data) {

  // if just !skip
  // or if too many arguments, then just plain skipping
  if (data.args.length === 0 || data.args.length > 1) {
    doSkip(bot);
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
      doSkip(bot);
        break;
  }

};
