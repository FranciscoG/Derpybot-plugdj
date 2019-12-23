"use strict";
var repo = require(process.cwd() + "/repo");
const triggerFormatter = require(process.cwd() +
  "/bot/utilities/trigger-formatter.js");
const _ = require("lodash");
const fuzzysort = require("fuzzysort");

var TriggerStore = {
  triggers: {},
  propGivers: {},
  flowGivers: {},
  lastTrigger: {},

  getRandom: function(bot, data) {
    var trigKeys = Object.keys(this.triggers);
    var randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    var trig = this.triggers[randKey];
    var theReturn = null;
    if (trig) {
      theReturn = triggerFormatter(trig.Returns, bot, data);
    }
    return { Trigger: trig.Trigger, Returns: theReturn };
  },

  randomProp: function() {
    var trigKeys = Object.keys(this.propGivers);
    var randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    return this.propGivers[randKey];
  },

  randomFlow: function() {
    var trigKeys = Object.keys(this.flowGivers);
    var randKey = trigKeys[Math.floor(Math.random() * trigKeys.length)];
    return this.flowGivers[randKey];
  },

  /**
   * Using fuzzy search algo to search through all the triggers
   * @param {string} term what to search for, can be partial word
   * @param {number} returnLimit some searches produce too many values, use this to limit the total returned
   * @returns {array}
   */
  search: function(term, returnLimit) {
    if (!term) {
      return [];
    }

    const options = {
      limit: returnLimit,
      allowTypo: true, // if you don't care about allowing typos
      threshold: -10000 // don't return bad results
    };

    var results = fuzzysort.go(term, Object.keys(this.triggers), options);
    return results.map(function(el) {
      return el.target.replace(/\:$/, "");
    });
  },

  /**
   * If search returns zero results it will remove a letter and try again untl
   * there are only 3 letters left.
   * @param {string} term what to search for
   * @param {number} returnLimit limit amount returned
   * @returns {array}
   */
  recursiveSearch: function(term, returnLimit) {
    if (!term) {
      return [];
    }

    const options = {
      limit: returnLimit,
      allowTypo: true, // if you don't care about allowing typos
      threshold: -10000 // don't return bad results
    };

    var finds = fuzzysort.go(term, Object.keys(this.triggers), options);
    if (finds.length === 0 && term.length > 3) {
      term = term.slice(0, term.length - 1);
      return this.recursiveSearch(term, returnLimit);
    }

    return finds.map(function(el) {
      return el.target.replace(/\:$/, "");
    });
  },

  getLast: function() {
    return this.lastTrigger;
  },

  /**
   * @param {string} trigger the trigger to look up
   * @param {object} bot PlugAPI object
   * @param {object} data data from PlugAPI chat message
   * @param {boolean} full whether to return full trigger object or just the text
   * @returns {string}
   */
  get: function(trigger, bot, data, full) {
    var found = null;

    if (this.triggers[trigger.toLowerCase() + ":"]) {
      found = this.triggers[trigger + ":"];
    }

    if (found && !full) {
      found = triggerFormatter(found.Returns, bot, data);
    }

    if (typeof found === "string") {
      return found.trim();
    }
    return null;
  },

  // append: function(bot, db, data, trig) {
  //   // if not at least a MOD, GTFO!
  //   if ( !bot.havePermission(data.user.id, bot.ROOM_ROLE.MANAGER) ) {
  //     return bot.sendChat('Sorry only mods (or above) can do this');
  //   }

  //   if (!this.triggers[data.trigger + ":"]) {
  //     return bot.sendChat(`The trigger !${data.trigger} does not exist, ergo you can not append to it`);
  //   }

  //   // first we need to remove the "+=" from the array
  //   data.args.shift();
  //   // move the trigger name for existing updateTrigger function
  //   data.triggerName = data.trigger;
  //   // combine old trigger value with new trigger value
  //   data.triggerText = trig.Returns + ' ' + data.args.join(' ');

  //   // updateTrigger = function(db, data, triggerKey, orignialValue){
  //   repo.updateTrigger(db, data, data.trigger, trig)
  //       .then(function(){
  //         var info = `[TRIG] UPDATE: ${data.user.username} changed !${data.triggerName} FROM-> ${trig.Returns} TO-> ${data.triggerText}`;
  //         bot.log('info', 'BOT', info);
  //         bot.sendChat(`trigger for *!${data.triggerName}* updated!`);
  //       })
  //       .catch(function(err){
  //         if (err) { bot.log('error', 'BOT',`[TRIG] UPDATE ERROR: ${err}`); }
  //       });
  // },

  updateGivers: function(trig) {
    let val = trig.Returns;

    // because there was a trigger that returned as a num
    if (typeof val === "number") {
      val = val + ""; // coerce to a number
    }
    // just in case it's not still not a string
    if (typeof val !== "string") {
      return;
    }

    if (val.indexOf("+flow") >= 0) {
      this.flowGivers[trig.Trigger] = trig;
    } else if (val.indexOf("+prop") >= 0) {
      this.propGivers[trig.Trigger] = trig;
    }
  },

  /**
   * Takes in the data from firebase and processes it so that we can easily
   * access it from within this object and also prepare for fuzzy search
   * @param {object} bot PlugAPI instance
   * @param {object} val raw return from firebase db all the entire Trigger storage
   */
  setTriggers: function(bot, val) {
    bot.log("info", "BOT", "Trigger cache updated");

    Object.keys(val).forEach(key => {
      var thisTrig = val[key];
      this.addTrigger(key, thisTrig);
      this.updateGivers(thisTrig);
    });
  },

  /**
   * Adds or Updates trigger in the local store
   * @param {string} key the firebase key
   * @param {object} trig the trigger data
   */
  addTrigger: function(key, trig) {
    trig.fbkey = key;
    this.triggers[trig.Trigger] = trig;
  },

  removeTrigger: function(triggerName) {
    if (this.triggers[triggerName]) {
      delete this.triggers[triggerName];
    }
  },

  init: function(bot, db) {
    var triggers = db.ref("triggers");

    // Get ALL triggers and store them locally
    // this will run everytime a trigger is updated or created
    triggers.on(
      "value",
      snapshot => {
        let val = snapshot.val();
        this.setTriggers.call(this, bot, val);
      },
      error => {
        bot.log("error", "BOT", "error getting triggers from firebase");
      }
    );

    // remove deleted from local store of triggers
    triggers.on("child_removed", snapshot => {
      let triggerDeleted = snapshot.val();
      if (typeof triggerDeleted !== "object" || !triggerDeleted.Trigger) {
        bot.log(
          "error",
          "BOT",
          "error from triggers child_removed event: " + triggerDeleted
        );
        return;
      }
      this.removeTrigger.call(this, triggerDeleted.Trigger);
    });

    var lastTrigger = db.ref("lastTrigger");
    lastTrigger.on(
      "value",
      snapshot => {
        var val = snapshot.val();
        bot.log("info", "BOT", "lastTrigger updated");
        this.lastTrigger = val;
      },
      function(error) {
        bot.log("error", "BOT", "error getting lastTrigger from firebase");
      }
    );
  },

  /**
   * for unit testing
   */
  initSync: async function(bot, db) {
    try {
      const allTriggers = await repo.getAllTriggers(db);
      this.setTriggers.call(this, bot, allTriggers);
    } catch (e) {
      bot.log(
        "error",
        "BOT",
        `error getting triggers from firebase: ${e.message}`
      );
    }
  }
};

module.exports = TriggerStore;
