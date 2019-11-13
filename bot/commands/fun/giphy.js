'use strict';

var giphy = require(process.cwd() + '/bot/utilities/giphy.js');

module.exports = function(bot, db, data) {
  if (!data) {
    bot.log('error', 'BOT', '[GIPHY] ERROR Missing data');
    return bot.sendChat('An error occured, try again');
  }

  if (data.args.length === 0) {
    return bot.sendChat('*usage:* !giphy <search text>');
  }
  
  data.triggerText = data.args.join('+');

  giphy.getGif({random: true}, data.triggerText, function(error, url){
    if (!error && url) {
      bot.sendChat( url );
    } else {
      bot.sendChat('Bad request to giphy...');
    }
  });
};