/***************************************************************
 * Event: chat-message
 *
 * Event fired for every new chat message
 */
'use strict';
const cleverbot = require( process.cwd() + '/bot/utilities/cleverbot.js');

module.exports = function(bot, db) {
  
  // docs: https://plugcubed.github.io/plugAPI/#plugapieventchat
  bot.on(bot.events.CHAT, function(data) {
    if (!bot.myconfig.cleverbot) {
      return;
    }

    const botName = '@'+bot.getUser().username;
  
    if (data.message.indexOf(botName) === 0) {
      let cb_message = data.message.substring(botName.length, data.message.length).trim();
      return cleverbot(bot, cb_message);
    }

  });
};
