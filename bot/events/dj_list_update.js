/***************************************************************
 * Event: DJ_LIST_UPDATE
 *
 * https://plugcubed.github.io/plugAPI/#plugapieventdj_list_update
 *
 * This is emitted when the waitList has changed.
 */

"use strict";
const checkHistory = require(process.cwd() + "/bot/utilities/checkHistory.js");
const _ = require("lodash");
const repo = require(process.cwd() + "/repo");

function searchUsersObj(bot, uid) {
  for (let key in bot.allUsers) {
    let user = bot.allUsers[key];
    if (user.id === uid) {
      return [key, user];
    }
  }
}

function checkNewUser(bot, db, user) {
  if (!bot || !db || !user) {
    return;
  }

  let cachedUser = searchUsersObj(bot, user.id);
  if (cachedUser && user.dubs <= 20 && !cachedUser[1].introduced) {
    // console.log(user.username, user.dubs, cachedUser[1].introduced);

    bot.sendChat(
      `${user.username} is new to the mixer, and just joined the queue. Let's all be supportive!`
    );
    cachedUser[1].introduced = true;
    repo.updateUser(db, cachedUser[0], cachedUser[1], function(err) {
      if (err) {
        bot.log(
          "error",
          "REPO",
          `Error updating introduced for user ${user.username}`
        );
      }
    });
  }
}

module.exports = function(bot, db) {
  bot.on(bot.events.DJ_LIST_UPDATE, function(data) {
    if (!data) {
      return bot.log("error", "BOT", "DJ_LIST_UPDATE: data object missing");
    }

    // console.log("DJ_LIST_UPDATE", data);

    const djs = bot.getWaitList();

    if (!djs || djs.length === 0) {
      return;
    }

    djs.forEach(function(dj) {
      // checkHistory(bot, media);
      checkNewUser(bot, db, dj);
    });
  });
};
