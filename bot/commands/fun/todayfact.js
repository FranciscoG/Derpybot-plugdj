"use strict";
const got = require("got");

module.exports = async function (bot, db) {
  try {
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const factApi = `http://numbersapi.com/${month}/${day}`;
    const response = await got(factApi);
    const result = "Bad request to facts...";
    if (response.statusCode === 200) {
      result = response.body;
    }
    bot.sendChat(result);
  } catch (error) {
    bot.sendChat("Bad request to facts...");
    bot.log("error", "BOT", `[!todayfact] ${error.message}`);
  }
};
