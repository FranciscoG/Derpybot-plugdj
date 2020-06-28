require('../utilities/typedefs');
const _get = require("lodash/get");

 /**
  * Model to represent insert or update into the db
  */
class TriggerModel {
  constructor() {
    /**
     * @type {TriggerModelData} blank trigger object
     */
    this.data = {
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
      flowEmoji: "surfer"
    };
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
   * @param {TriggerUpdate} newData 
   */
  validate(newData) {
    const missing = ["triggerText", "triggerName"].filter(path => {
      return !_get(newData, path);
    });
    
    if (missing.length > 0) {
      throw new Error(
        `Trigger data is missing required: ${missing.join(", ")}`
      );
    }
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
