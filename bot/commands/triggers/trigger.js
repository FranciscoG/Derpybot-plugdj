"use strict";
var repo = require(process.cwd() + "/repo");
var Verifier = require(process.cwd() + "/bot/utilities/verify.js");
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const TriggerModel = require('../../models/trigger-model');
const triggersRepo = require("../../../repos/triggers");

function displayHelp(bot) {
  bot.sendChat("*create/update:* !trigger trigger_name trigger_text");
  bot.sendChat("*delete:* !trigger trigger_name");
  bot.sendChat('Don\'t add the "!" before trigger_name');
}

module.exports.extraCommands = ["triggers"];
module.exports = function(bot, db, data) {
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

  const model = new TriggerModel();
  let triggerName = data.args[0];

  // remove the leading "!" if there is one
  if (triggerName.charAt(0) === "!") {
    triggerName = triggerName.substring(1);
  }

  let triggerText = data.args
    .slice(1)
    .join(" ")
    .trim();

  data.triggerName = triggerName;
  data.triggerText = triggerText;

  repo.getTrigger(db, triggerName, async function(val) {
    /*********************************************************
     * Create Trigger
     * min role:  Resident DJs
     */
    if (!val && triggerText) {
      if (/^\{.+\}$/.test(triggerText) && !isMod) {
        bot.sendChat("Sorry only Mods can create code triggers");
        return;
      }

      if (!isResDJ) {
        bot.sendChat("Sorry only ResidentDJs and above can create triggers");
        return;
      }

      try {
        let newTrigger = await repo.insertTrigger(db, data);
        triggerStore.addTrigger(newTrigger.fbkey, newTrigger);
        var inf = `[TRIG] ADDED by ${data.from.username} -> !${triggerName} -> ${triggerText}`;
        bot.log("info", "BOT", inf);
        bot.moderateDeleteChat(chatID, function() {});
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

    if (!val && !triggerText) {
      // trying to delete a trigger that doesn't exist
      return bot.sendChat("You can't delete a trigger that doesn't exist");
    }

    /*********************************************************
     * Update Trigger
     * min role:  Manager
     */
    var keys;
    var foundTrigger;
    if (val && triggerText) {
      let fbkey = Object.keys(val)[0];
      foundTrigger = val[fbkey];

      try {
        model.validate(data, fbkey); // will throw if fails
        model.fromUpdate(data, fbkey, foundTrigger);
        await triggersRepo.updateTrigger(db, model);
        triggerStore.addTrigger(fbkey, model.data);
        var info = `[TRIG] UPDATE: ${data.from.username} changed !${triggerName} FROM-> ${foundTrigger.Returns} TO-> ${triggerText}`;
        bot.log("info", "BOT", info);
        bot.moderateDeleteChat(chatID, function() {});
        bot.sendChat(`trigger for *!${triggerName}* updated!`);
      } catch (e) {
        bot.log("error", "BOT", `[TRIG] UPDATE ERROR: ${e.message}`);
      }
    }

    /*********************************************************
     * Delete Trigger Section
     * min role:  Mods
     */
    if (val && !triggerText) {
      keys = Object.keys(val);

      let verify = new Verifier(bot, data, "delete trigger " + triggerName);

      verify
        .then(userChoice => {
          if (!userChoice) {
            bot.sendChat(`ok, \`${triggerName}\` trigger delete canceled`);
            return;
          }

          repo
            .deleteTrigger(db, keys[0], val[keys[0]])
            .then(function() {
              var info = `[TRIG] DEL by ${data.from.username} -> !${triggerName}`;
              bot.log("info", "BOT", info);
              bot.sendChat(`Trigger for *!${triggerName}* deleted`);
            })
            .catch(function(err) {
              if (err) {
                bot.log("error", "BOT", `[TRIG] DEL ERROR: ${err}`);
              }
            });
        })
        .catch(() => {
          bot.log(
            "info",
            "BOT",
            `${triggerName} - trigger delete cancelled by timeout`
          );
        });
    }
  });
};
