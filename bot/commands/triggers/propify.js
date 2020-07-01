"use strict";
const repo = require("../../../repos/triggers");
const TriggerModel = require("../../models/trigger-model");

function displayHelp(bot) {
  const chats = [
    "Make a trigger give a prop points",
    "!propify <trigger_name> [optional_emoji]"
  ];
  return bot.sendChat(chats.join(`\n`));
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

  let [ triggerName, propEmoji ] = data.args;

  triggerName = triggerName.replace(/^!/, "");

  const [getErr, foundTrigger] = await repo.getTrigger(db, triggerName);
  if (getErr) {
    bot.log("error", "BOT", `[TRIG] GET ERROR: ${getErr.message}`);
    return bot.sendChat('An error occured :-(');
  }

  if (!foundTrigger) {
    return bot.sendChat(`Trigger ${triggerName} does not exist `);
  }

  foundTrigger.givesProp = true;
  if (propEmoji) {
    foundTrigger.propEmoji = propEmoji.replace(/^:/, "").replace(/:$/, "");
  }

  const model = new TriggerModel();
  model.fromUpdate(data, foundTrigger);

  try {
    await repo.insertTrigger(db, model);
    const info = `[TRIG] UPDATE: ${data.from.username} propified !${triggerName}`;
    bot.log("info", "BOT", info);
    bot.moderateDeleteChat(chatID, function() {});
    return bot.sendChat(`trigger *!${triggerName}* propified!`);
  } catch (e) {
    bot.log("error", "BOT", `[TRIG] UPDATE ERROR: ${e.message}`);
  }
};
