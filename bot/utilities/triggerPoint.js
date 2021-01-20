"use strict";
const repos = require("../../repos");
const userStore = require(process.cwd() + "/bot/store/users.js");

function successMsg(recipient, pointType, pointEmoji) {
  if (pointType === "flow") {
    return `@${recipient.username} now has ${recipient[pointType]} flowpoint :${pointEmoji}:`;
  }
  return `@${recipient.username} now has ${recipient[pointType]} props :${pointEmoji}:`;
}

function noRepeatPointMsg(username, pointEmoji) {
  return `@${username}, you have already given a :${pointEmoji}: for this song`;
}

/**
 * Save point to db and send chat message
 * @param {Object} bot       bot api instance
 * @param {Object} db        Firebase instance
 * @param {Object} data      pass through of the data object from the event
 * @param {Object} recipient target User who is getting the point
 * @param {string} pointType what type of point: props or flow
 * @param {string} repeatCheck property to check in the currently playing song
 * @param {string} pointEmoji which emoji to display
 * @returns {Promise.resolve<string>} with success message
 */
async function addPoint(
  bot,
  db,
  data,
  recipient,
  pointType,
  repeatCheck,
  pointEmoji
) {
  const user = await repos.users.incrementUser(db, recipient, pointType);
  if (!user) {
    Promise.reject("user not found");
  }
  userStore.addPoint(repeatCheck, data.user.id);
  return Promise.resolve(successMsg(user, pointType, pointEmoji));
}

/**
 * @param {object} bot PlugAPI instance
 * @param {object} db Firebase admin database instance
 * @param {BotCommand} data event object from bot.events.CHAT_COMMAND
 * @param {string} trig the current trigger text being processed
 * @param {"prop"|"flow"} type
 * @param {string} [emoji]
 * @returns {Promise<string[]>} array of strings that will be sent to the chat
 */
module.exports = async function(bot, db, data, trig, type, emoji) {
  const messages = [];

  if (data.user.username === bot.getUser().username) {
    messages.push("I am not allowed to award points");
    return Promise.resolve(messages);
  }

  // default to prop
  const pointType = "props"; // this must match the name in the db
  const repeatCheck = "usersThatPropped";
  const pointEmoji = emoji || "fist";

  if (type === "flow") {
    pointType = "flow"; // this must match the name in the db
    repeatCheck = "usersThatFlowed";
    pointEmoji = emoji || "surfer";
  }

  // send the trigger no matter what but remove the +prop/+flow stuff
  const re = new RegExp("\\+" + pointType + "?(=[a-z0-9_-]+)?$", "i");
  const strippedMsg = trig.replace(re, "");
  if (strippedMsg !== "") {
    messages.push(strippedMsg);
  }

  if (!bot.getDJ()) {
    messages.push("There is no DJ playing!");
    return Promise.resolve(messages);
  }

  if (!bot.myconfig.allow_multi_prop) {
    // no repeat giving
    if (userStore.hasId(repeatCheck, data.user.id)) {
      messages.push(noRepeatPointMsg(data.user.username, pointEmoji));
      return Promise.resolve(messages);
    }
  }

  // the person being propped
  const dj = bot.getDJ();

  // can not give points to self
  // but don't show a warning, just remain silent
  if (data.user.username === dj.username) {
    return Promise.resolve(messages);
  }

  try {
    let pointMsg = await addPoint(
      bot,
      db,
      data,
      dj,
      pointType,
      repeatCheck,
      pointEmoji
    );
    messages.push(pointMsg);
  } catch (e) {
    bot.log(
      "error",
      "BOT",
      `triggerPoint could not incrementUser: ${e.message}`
    );
  }

  return Promise.resolve(messages);
};
