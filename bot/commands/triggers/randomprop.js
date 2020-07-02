'use strict';
const triggerStore = require('../../store/triggerStore.js');
const triggerPoint = require('../../utilities/triggerPoint.js');

module.exports = function(bot, db, data) {
  var randomTrigger = triggerStore.randomProp();

  if (randomTrigger && randomTrigger.Returns && randomTrigger.Trigger) {
    const formatted = triggerStore.format(randomTrigger, bot, data);
    bot.sendChat('Trigger name: ' + randomTrigger.Trigger);
    return triggerPoint(bot, db, data, formatted, "prop" );
  }

};