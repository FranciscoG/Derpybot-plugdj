const _get = require("lodash/get");

class Trigger {
  constructor() {
    /**
     * @property {string} key the firebase key where the trigger is stored
     */
    this.key = null;

    this.data = {
      /**
       * @property {string} Author persion who created or last updated this trigger
       */
      Author: "",
      /**
       * @property {string} Returns Trigger text
       */
      Returns: "",
      /**
       * @property {string} Trigger Trigger name
       */
      Trigger: "",
      /**
       * @property {'created'|'updated'} status
       */
      status: "created",
      /**
       * @property {number} lastUpdated timestamp of last update
       */
      lastUpdated: null,
      /**
       * @property {number} createdOn timestamp of when it was created
       */
      createdOn: Date.now(),
      /**
       * @property {string} createdBy who original created this trigger
       */
      createdBy: ""
    };
  }

  
  fromNew(data) {
    const author = _get(data, "user.username", "unknown");
    this.data.Author = author;
    this.data.Returns = data.triggerText;
    this.data.Trigger = data.triggerName.toLowerCase() + ":";
    this.data.createdBy = author;
  }
  
  validate(newData, key) {
    const missing = ["triggerText", "triggerName"].filter(path => {
      return !_get(newData, path);
    });
    if (!key) {
      missing.push("firebase key");
    }
    if (missing.length > 0) {
      throw new Error(
        `Trigger data is missing required: ${missing.join(", ")}`
      );
    }
  }

  fromUpdate(newData, triggerKey, orignialValue = {}) {
    this.key = triggerKey;
    this.data.Author = newData.user.username;
    this.data.Returns = newData.triggerText || orignialValue.Returns;
    this.data.Trigger = newData.triggerName.toLowerCase() + ":";
    this.data.status = "updated";
    this.data.lastUpdated = Date.now();
    this.data.createdOn = orignialValue.createdOn || null;
    this.data.createdBy = orignialValue.createdBy || null;
  }
}

module.exports = Trigger;
