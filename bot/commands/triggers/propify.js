"use strict";
const triggerStore = require("../../store/triggerStore");
const handleChat = require("../../utilities/handleChat");
const triggersRepo = require("../../../repos/triggers");
const TriggerModel = require("../../models/trigger-model");

function displayHelp(bot) {
  handleChat([
    "Make a trigger give a prop points",
    "!propify <trigger_name> [optional_emoji]"
  ]);
}

module.exports = async function(bot, db, data) {
  const chatID = data.id;

  if (!data || !data.from || !data.args) {
    bot.log("error", "BOT", "[TRIG] ERROR: Missing required data");
    return bot.sendChat("An error occured, try again");
  }

  const isResDJ = bot.havePermission(data.from.id, bot.ROOM_ROLE.RESIDENTDJ);

  if (!isResDJ) {
    return bot.sendChat("Sorry only Resident DJs or above can !propify");
  }

  // if just "!propify" was used then we show the help info for using it
  if (data.args.length === 0) {
    return displayHelp(bot);
  }

  let triggerName = data.args[0].replace(/^!/, "");

  // check if the trigger exists
  const foundTrigger = triggerStore.triggers[triggerName + ":"];

  if (!foundTrigger) {
    return bot.sendChat(`Trigger ${triggerName} does not exist `);
  }

  foundTrigger.givesProp = true;
  if (data.args[1]) {
    foundTrigger.propEmoji = data.args[1].replace(/^:/, "").replace(/:$/, "");
  }

  const model = new TriggerModel();
  model.fromUpdate(data, foundTrigger.fbkey, foundTrigger);

  try {
    await triggersRepo.updateTrigger(db, model);
    triggerStore.addTrigger(foundTrigger.fbkey, model.data);
    var info = `[TRIG] UPDATE: ${data.from.username} propified !${triggerName}`;
    bot.log("info", "BOT", info);
    bot.moderateDeleteChat(chatID, function() {});
    bot.sendChat(`trigger for *!${triggerName}* updated!`);
  } catch (e) {
    bot.log("error", "BOT", `[TRIG] UPDATE ERROR: ${e.message}`);
  }
};
