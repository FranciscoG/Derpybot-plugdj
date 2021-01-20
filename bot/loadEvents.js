"use strict";
const fs = require("fs");

/**
 *
 * @param {import('bot/utilities/typedefs').DerpyBot} bot
 * @param {import('firebase-admin').database.Database} db
 */
module.exports = function (bot, db) {
  //loop through events directory and require each while passing the bot and db
  const events = process.cwd() + "/bot/events";
  fs.readdirSync(events).forEach(function (file) {
    if (file.indexOf(".js") > -1) {
      const event = require(events + "/" + file);
      if (typeof event === "function") {
        event(bot, db);
      } else if (typeof event === "object") {
        event.main(bot, db);
      }
    }
  });
};
