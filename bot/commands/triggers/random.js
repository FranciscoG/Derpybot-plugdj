"use strict";
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerPoint = require("../../utilities/triggerPoint");

module.exports = function (bot, db, data) {
  if (!data) {
    return bot.sendChat("An error occured, try again");
  }

  /************************************************
   * This handles just calling !random by itself
   */
  if (data.args.length === 0) {
    const randomTrigger = triggerStore.getRandom(bot, data);

    if (randomTrigger) {
      bot.sendChat("Trigger name: " + randomTrigger.Trigger);
      const formatted = triggerStore.format(randomTrigger.Returns, bot, data);
      bot.sendChat(formatted);
    }
    return;
  }

  /************************************************
   * This handles doing random with filter
   */

  const [searchTerm] = data.args;

  if (searchTerm.length < 3) {
    return bot.sendChat("Your random filter should be at least 3 letters or more");
  }

  // get list of
  const results = triggerStore.search(searchTerm);

  if (!results || results.length === 0) {
    return bot.sendChat(`No results for the random filter: ${searchTerm}`);
  }

  const ran = results.random();

  // check if it's an exsiting trigger
  const trig = triggerStore.get(ran);
  const formatted = triggerStore.format(trig.Returns, bot, data);

  if (!trig) {
    return bot.sendChat(`*!${data.trigger}* is not a recognized command or trigger`);
  }

  bot.sendChat(`Trigger name: ${ran}`);

  if (trig.givesProp) {
    return triggerPoint(bot, db, data, formatted, "prop");
  } else if (trig.givesFlow) {
    return triggerPoint(bot, db, data, formatted, "flow");
  }

  return bot.sendChat(formatted);
};
