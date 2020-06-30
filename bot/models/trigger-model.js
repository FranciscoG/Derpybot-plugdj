require('../utilities/typedefs');
const _get = require("lodash/get");
const triggerFormatter = require(process.cwd() + "/bot/utilities/trigger-formatter.js");

 /**
  * Model to represent insert or update into the db
  */
class TriggerModel {
  /**
   * @param {TriggerModelData} data 
   */
  constructor(data = {}) {
    /**
     * @type {TriggerModelData} blank trigger object
     */
    const emptyTrig = {
      Author: "",
      Returns: "",
      Trigger: "",
      status: "created",
      lastUpdated: null,
      createdOn: Date.now(),
      createdBy: "",
      givesProp: false,
      propEmoji: "fist",
      givesFlow: false,
      flowEmoji: "surfer",
    };
    this.data = Object.assign({}, emptyTrig, data);
  }

  format(bot, data) {
    this.formatted = triggerFormatter(this.data.Returns, bot, data);
  }

  /**
   * Populate the model with data for a new Trigger
   * @param {Object} data 
   */
  fromNew(data) {
    const author = _get(data, "user.username", "unknown");
    this.data.Author = author;
    this.data.Returns = data.triggerText;
    this.data.Trigger = data.triggerName;
    this.data.createdBy = author;
  }

  /**
   * Use this when you're using the model to update a Trigger
   * @param {TriggerUpdate} newData 
   * @param {TriggerModelData} orignialValue 
   */
  fromUpdate(newData, orignialValue = {}) {
    const finalData = {
      Author: _get(newData, "user.username", "unknown"),
      Returns: newData.triggerText || orignialValue.Returns,
      Trigger: newData.triggerName,
      status: "updated",
      lastUpdated: Date.now(),
      propEmoji: newData.propEmoji || orignialValue.propEmoji,
      flowEmoji: newData.flowEmoji || orignialValue.flowEmoji,
    };
    if (typeof newData.givesProp === 'boolean') {
      finalData.givesProp = newData.givesProp;
    }
    if (typeof newData.givesFlow === 'boolean') {
      finalData.givesFlow = newData.givesFlow;
    }

    this.data = Object.assign({}, orignialValue, finalData);
  }
}

module.exports = TriggerModel;
