"use strict";
const got = require("got");

// TODO: this should be moved to new trigger code format
module.exports = async function (bot) {
  try {
    const json = await got("https://random.dog/woof.json").json();
    bot.sendChat(json.url);
  } catch (error) {
    bot.sendChat("Bad request to dog...");
  }
};
