"use strict";
const got = require("got");
const API_URL = "http://api.urbandictionary.com/v0/";

function showResult(bot, json) {
  if (!bot) {
    return;
  }

  if (!json || !json.list || json.list.length === 0) {
    return bot.sendChat("Sorry no results for that");
  }

  const first = json.list[0];

  let def = first.definition;
  let word = first.word;
  let link = first.permalink;

  bot.sendChat(`*${word}* - ${def} ${link}`);
}

async function getFirstResult(path, bot) {
  try {
    const response = await got(API_URL + path);
    if (response.statusCode === 200) {
      const json = JSON.parse(response.body);
      showResult(bot, json);
    }
  } catch (error) {
    bot.log("error", "BOT", `[!urban] ${error.message}`);
    bot.sendChat("Something happened connecting with urban dictionairy");
  }
}

module.exports = function (bot, db, data) {
  if (!bot || !data) {
    return;
  }

  if (data.args.length === 0) {
    getFirstResult("random", bot);
    return;
  }

  const search = encodeURI(data.args.join(" ").trim());
  getFirstResult("define?term=" + search, bot);
};
