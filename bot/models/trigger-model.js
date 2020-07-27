require("../utilities/typedefs");
const _get = require("lodash/get");

const triggerModel = {
  /**
   * @type {string} creator or the last person to update the trigger
   */
  Author: "",
  /**
   * @type {string} The text of the trigger to be sent to chat
   */
  Returns: "",
  /**
   * @type {string} The lookup name of the trigger
   */
  Trigger: "",
  /**
   * @type {'created'|'updated'}
   */
  status: "created",
  /**
   * @type {number?} when this trigger was last update - ms since unix epoch timestamp
   */
  lastUpdated: null,
  /**
   * @type {number} when this trigger was create - ms since unix epoch timestamp
   */
  createdOn: null,
  /**
   * @type {string} original author of the trigger
   */
  createdBy: "",
  /**
   * @type {boolean} whether this trigger gives a prop point. default: false
   */
  givesProp: false,
  /**
   * @type {string} emoji to be shown during propping. default: "fist"
   */
  propEmoji: "fist",
  /**
   * @type {boolean} whether this trigger gives a flow point. default: false
   */
  givesFlow: false,
  /**
   * @type {string} emoji to be shown during flow point. default: "surfer"
   */
  flowEmoji: "surfer",
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
 * @param {PlugApi} bot instance of PlugAPI bot
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
