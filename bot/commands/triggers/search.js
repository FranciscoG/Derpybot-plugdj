"use strict";

const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");

module.exports = function(bot, db, data) {
  if (!data) {
    return bot.sendChat("An error occured, try again");
  }

  if (data.args.length === 0) {
    return bot.sendChat("*usage:* !search <name, minimum 3 letters>");
  }

  if (data.args[0].length < 3) {
    return bot.sendChat(
      "Your search term should be at least 3 letters or more"
    );
  }

  var results = triggerStore.search(data.args[0], 50);

  if (results && results.length > 0) {
    bot.sendChat("only showing first 50 results: ");
    let str = results.join(", ");
    bot.sendChat(str);
  } else {
    bot.sendChat(`no results for ${data.args[0]}`);
  }
};
