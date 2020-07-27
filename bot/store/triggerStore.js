"use strict";
const fuzzysort = require("fuzzysort");
const repos = require('../../repos');
const triggerFormatter = require(process.cwd() + "/bot/utilities/trigger-formatter.js");

var TriggerStore = {
  triggers: {},
  propGivers: {},
  flowGivers: {},
  lastTrigger: {},
  format: triggerFormatter,

  getRandom: function (bot, data) {
    const trigKeys = Object.keys(this.triggers);
    const randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    const trig = this.triggers[randKey];

    if (!trig) return null;
    return trig;
  },

  randomProp: function () {
    const trigKeys = Object.keys(this.propGivers);
    const randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    return this.propGivers[randKey];
  },

  randomFlow: function () {
    const trigKeys = Object.keys(this.flowGivers);
    const randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    return this.flowGivers[randKey];
  },

  /**
   * Using fuzzy search algo to search through all the triggers
   * @param {string} term what to search for, can be partial word
   * @param {number} returnLimit some searches produce too many values, use this to limit the total returned
   * @returns {array}
   */
  search: function (term, returnLimit) {
    if (!term) {
      return [];
    }

    const options = {
      limit: returnLimit,
      allowTypo: true, // if you don't care about allowing typos
      threshold: -10000, // don't return bad results
    };

    var results = fuzzysort.go(term, Object.keys(this.triggers), options);
    return results.map(function (el) {
      return el.target;
    });
  },

  /**
   * If search returns zero results it will remove a letter and try again until
   * there are only 3 letters left.
   * @param {string} term what to search for
   * @param {number} returnLimit limit amount returned
   * @returns {array}
   */
  recursiveSearch: function (term, returnLimit) {
    if (!term) {
      return [];
    }

    const options = {
      limit: returnLimit,
      allowTypo: true, // if you don't care about allowing typos
      threshold: -10000, // don't return bad results
    };

    var finds = fuzzysort.go(term, Object.keys(this.triggers), options);
    if (finds.length === 0 && term.length > 3) {
      term = term.slice(0, term.length - 1);
      return this.recursiveSearch(term, returnLimit);
    }

    return finds.map(function (el) {
      return el.target;
    });
  },

  getLast: function () {
    return this.lastTrigger;
  },

  /**
   * @param {string} trigger the trigger to look up
   * @returns {TriggerModelData?}
   */
  get: function (trigger) {
    let found = this.triggers[trigger] || null;

    if (!found) {
      return null;
    }

    return found;
  },

  updateGivers: function (trig) {
    if (trig.givesFlow) {
      this.flowGivers[trig.Trigger] = trig;
    }

    if (trig.givesProp) {
      this.propGivers[trig.Trigger] = trig;
    }
  },

  /**
   * Takes in the data from firebase and processes it so that we can easily
   * access it from within this object and also prepare for fuzzy search
   * @param {object} bot PlugAPI instance
   * @param {object} val raw return from firebase db all the entire Trigger storage
   */
  setTriggers: function (bot, val) {
    bot.log("info", "BOT", "Trigger cache updated");
    this.triggers = val;

    Object.values(val).forEach(this.updateGivers.bind(this));
  },

  removeTrigger: function (triggerName) {
    if (this.triggers[triggerName]) {
      delete this.triggers[triggerName];
    }
  },

  init: function (bot, db) {
    var triggers = db.ref("triggers");

    // Get ALL triggers and store them locally
    // this will run everytime a trigger is updated or created
    triggers.on(
      "value",
      (snapshot) => {
        let val = snapshot.val();
        this.setTriggers.call(this, bot, val);
      },
      (error) => {
        bot.log("error", "BOT", "error getting triggers from firebase");
      }
    );

    // remove deleted from local store of triggers
    triggers.on("child_removed", (snapshot) => {
      let triggerDeleted = snapshot.val();
      if (typeof triggerDeleted !== "object" || !triggerDeleted.Trigger) {
        bot.log("error", "BOT", "error from triggers child_removed event: " + triggerDeleted);
        return;
      }
      this.removeTrigger.call(this, triggerDeleted.Trigger);
    });

    var lastTrigger = db.ref("lastTrigger");
    lastTrigger.on(
      "value",
      (snapshot) => {
        var val = snapshot.val();
        bot.log("info", "BOT", "lastTrigger updated");
        this.lastTrigger = val;
      },
      function (error) {
        bot.log("error", "BOT", "error getting lastTrigger from firebase");
      }
    );
  },

  /**
   * for unit testing
   */
  initSync: async function (bot, db) {
    const [err, allTriggers] = await repos.triggers.getAllTriggers(db);
    if (err) {
      bot.log("error", "BOT", `error getting triggers from firebase: ${err.message}`);
      return;
    }
    this.setTriggers.call(this, bot, allTriggers);
  },
};

module.exports = TriggerStore;
