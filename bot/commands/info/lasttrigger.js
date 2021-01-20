'use strict';
const triggerStore = require('../../store/triggerStore.js');

module.exports = function(bot, db, data) {
  
  if (!data) {
    bot.log('error', 'BOT', '[TRIG] ERROR: Missing data');
    return bot.sendChat('An error occured, try again');
  }

  const lastTrig = triggerStore.getLast();

  if (lastTrig) {
    let trigname = lastTrig.Trigger;
    return bot.sendChat(`!${trigname} was the most recently ${lastTrig.status} trigger by ${lastTrig.Author}`);
  }

};