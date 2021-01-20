'use strict';
const triggerStore = require('../../store/triggerStore.js');
const triggerPoint = require('../../utilities/triggerPoint.js');

module.exports = function(bot, db, data) {
  const randomTrigger = triggerStore.randomFlow();

  if (randomTrigger) {
    const formatted = triggerStore.format(randomTrigger, bot, data);
    bot.sendChat('Trigger name: ' + randomTrigger.Trigger);
    return triggerPoint(bot, db, data, formatted, "flow" );
  }

};