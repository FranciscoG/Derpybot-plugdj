"use strict";
const repo = require("../../../repos/triggers");
const verify = require(process.cwd() + "/bot/utilities/verify.js");
// const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const TriggerModel = require("../../models/trigger-model");

const badKeyChars = new RegExp("[\\.\\$\\[\\]#\\/]", "g");

function displayHelp(bot) {
  const chats = [
    "*create/update:* !trigger trigger_name trigger_text",
    "*delete:* !trigger trigger_name",
    'Don\'t add the "!" before trigger_name',
    `Trigger names can NOT contain the following characters: . $ [ ] # /`
  ];
  return bot.sendChat(chats.join(`\n`));
}

module.exports.extraCommands = ["triggers"];
module.exports = async function (bot, db, data) {
  const chatID = data.id;

  if (!data || !data.from || !data.from.username) {
    bot.log("error", "BOT", "[TRIG] ERROR: Missing data or username");
    return bot.sendChat("An error occured, try again");
  }

  const isMod = bot.havePermission(data.from.id, bot.ROOM_ROLE.MANAGER);
  const isResDJ = bot.havePermission(data.from.id, bot.ROOM_ROLE.RESIDENTDJ);

  // if just "!trigger" was used then we show the help info for using it
  if (data.args.length === 0) {
    return displayHelp(bot);
  }

  let triggerName = data.args[0];

  // remove the leading "!" if there is one
  if (triggerName.charAt(0) === "!") {
    triggerName = triggerName.substring(1);
  }

  let triggerText = data.args.slice(1).join(" ").trim();

  data.triggerName = triggerName;
  data.triggerText = triggerText;

  const [getErr, existingTrigger] = await repo.getTrigger(db, triggerName);

  if (getErr) {
    console.error(getErr);
    return;
  }

  /*********************************************************
   * Create Trigger
   * min role:  Resident DJs
   */
  if (!existingTrigger && triggerText) {
    if (/^\{.+\}$/.test(triggerText) && !isMod) {
      bot.sendChat("Sorry only Mods can create code triggers");
      return;
    }

    if (!isResDJ) {
      bot.sendChat("Sorry only ResidentDJs and above can create triggers");
      return;
    }

    if (badKeyChars.test(triggerName)) {
      bot.sendChat(`Trigger names can NOT contain the following characters: . $ [ ] # /`);
      return;
    }

    try {
      const newTrigModel = new TriggerModel();
      newTrigModel.fromNew(data);

      await repo.insertTrigger(db, newTrigModel);

      var inf = `[TRIG] ADDED by ${data.from.username} -> !${triggerName} -> ${triggerText}`;
      bot.log("info", "BOT", inf);
      bot.moderateDeleteChat(chatID, function () {});
      bot.sendChat(`trigger for *!${triggerName}* created, try it out!`);
    } catch (e) {
      bot.log("error", "BOT", `[TRIG] ADD: ${e.message}`);
      bot.sendChat("Error creating new trigger.");
    }
    return;
  }

  // everything below this block is mod only action
  if (!isMod) {
    bot.sendChat("Sorry only Mods and above can update or delete a triggers");
    return;
  }

  if (!existingTrigger && !triggerText) {
    // trying to delete a trigger that doesn't exist
    return bot.sendChat("You can't delete a trigger that doesn't exist");
  }

  /*********************************************************
   * Update Trigger
   * min role:  Manager
   */

  if (existingTrigger && triggerText) {
    try {
      const updateModel = new TriggerModel();
      updateModel.fromUpdate(data, existingTrigger);

      await repo.insertTrigger(db, updateModel);

      var info = `[TRIG] UPDATE: ${data.from.username} changed !${triggerName} FROM-> ${existingTrigger.Returns} TO-> ${triggerText}`;
      bot.log("info", "BOT", info);
      bot.moderateDeleteChat(chatID, function () {});
      bot.sendChat(`trigger for *!${triggerName}* updated!`);
    } catch (e) {
      bot.log("error", "BOT", `[TRIG] UPDATE ERROR: ${e.message}`);
    }
  }

  /*********************************************************
   * Delete Trigger Section
   * min role:  Mods
   */
  if (existingTrigger && !triggerText) {
    try {
      const userChoice = verify(bot, data, "delete trigger " + triggerName);

      if (!userChoice) {
        bot.sendChat(`ok, \`${triggerName}\` trigger delete canceled`);
        return;
      }

      await repo.deleteTrigger(db, existingTrigger);
      const info = `[TRIG] DEL by ${data.from.username} -> !${triggerName}`;
      bot.log("info", "BOT", info);
      bot.sendChat(`Trigger *!${triggerName}* deleted`);
    } catch (err) {
      if (err.message === "cancelled by timeout") {
        bot.log("info", "BOT", `${triggerName} - trigger delete cancelled by timeout`);
        return;
      }
      bot.log("error", "BOT", `[TRIG] DEL ERROR: ${err}`);
    }
  }
};
