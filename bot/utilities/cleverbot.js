'use strict';
const Cleverbot = require('cleverbot-node');
const settings = require(process.cwd() + '/private/get').settings;

module.exports = function(bot, message) {
  if (!bot) {
    return;
  }

  if (message.length < 1) {
    bot.sendChat("how can I be of assistance?");
    return;
  }

  const cleverbot = new Cleverbot();
  cleverbot.configure({botapi: settings.CLEVERBOT_API_KEY});
  cleverbot.write(message, function (response) {
    if (!response) {
      return bot.log('error', 'BOT', 'No response from cleverbot');
    }
    bot.sendChat(response.output);
  });
};