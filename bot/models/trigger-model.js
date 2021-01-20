const _get = require("lodash/get");
/**
 * @typedef {import('../utilities/typedefs').TriggerModelData} TriggerModelData
 * 
 * @typedef {import('../utilities/typedefs').BotCommand} BotCommand
 */

/**
 * @type {TriggerModelData}
 */
const triggerModel = {
  Author: "",
  Returns: "",
  Trigger: "",
  status: "created",
  lastUpdated: null,
  createdOn: null,
  createdBy: "",
  givesProp: false,
  propEmoji: "fist",
  givesFlow: false,
  flowEmoji: "surfer"
};

/**
 *
 * @param {BotCommand} newData
 * @param {TriggerModelData} orignialValue
 */
function updateTrigger(newData, orignialValue = {}) {
  if (!newData.triggerText) {
    console.error('trigger-model', 'updateTrigger', 'missing triggerText');
    return orignialValue;
  }
  const finalData = {
    Author: _get(newData, "user.username", "unknown"),
    Returns: newData.triggerText || orignialValue.Returns,
    status: "updated",
    lastUpdated: Date.now(),
  };
  if (typeof newData.propEmoji === "string") {
    finalData.propEmoji = newData.propEmoji;
  }
  if (typeof newData.flowEmoji === "string") {
    finalData.flowEmoji = newData.flowEmoji;
  }
  if (typeof newData.givesProp === "boolean") {
    finalData.givesProp = newData.givesProp;
  }
  if (typeof newData.givesFlow === "boolean") {
    finalData.givesFlow = newData.givesFlow;
  }

  return Object.assign({}, triggerModel, orignialValue, finalData);
}

/**
 *
 * @param {import('plugapi')} bot instance of PlugAPI bot
 * @param {BotCommand} data the object from the incoming chat command event
 * @param {TriggerModelData?} triggerObj an existing trigger to be updated
 */
module.exports = function model(bot, data, triggerObj) {
  if (!bot || !data) {
    console.error('trigger-model', 'model', 'missing bot or data object');
    return;
  }

  if (triggerObj) {
    return updateTrigger(data, triggerObj);
  }

  const newModel = Object.assign({}, triggerModel);
  newModel.createdOn = Date.now();

  const author = _get(data, "user.username", "unknown");
  newModel.Author = author;
  newModel.createdBy = author;
  newModel.Returns = data.triggerText;
  newModel.Trigger = data.triggerName;
};
