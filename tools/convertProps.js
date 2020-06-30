#!/usr/bin/env node
"use strict";
process.env.ENV = "test";
const fs = require("fs");
const db = require("../bot/db.js");

/**
 *
 * @param {string} key firebase db key for the trigger
 * @param {Object} trig the stored trigger object at that key
 * @returns {Promise} with the result from firebase db.set
 */
function removeProp(trig) {
  const returns = `${trig.Returns}`;
  var last = returns.split(" ").pop().split("=");

  if (last.length > 1) {
    trig.propEmoji = last[1];
  }

  trig.givesProp = true;
  trig.lastUpdated = Date.now();
  trig.Returns = returns.replace(/\+prop=?.*$/, "");

  return trig;
}

function removeFlow(trig) {
  const returns = `${trig.Returns}`;
  var last = returns.split(" ").pop().split("=");

  if (last.length > 1) {
    trig.flowEmoji = last[1];
  }

  trig.givesFlow = true;
  trig.lastUpdated = Date.now();
  trig.Returns = returns.replace(/\+flow=?.*$/, "");

  return trig;
}

// step one, move triggers into new location
// step 2 check for flow and prop triggers and update them

// const badKeys = [".", "$", "[", "]", "#", "/"];
const re = new RegExp("[\\.\\$\\[\\]#\\/]", "g");

(async function () {
  const snapshot = await db.ref("triggers").once("value");
  const val = snapshot.val();
  const newObj = {};
  const bad = {};

  Object.keys(val).forEach((key) => {
    const trigData = val[key];
    const trigger = trigData.Trigger.replace(/:$/, "");
    trigData.Trigger = trigger;
    if (re.test(trigger)) {
      bad[trigger] = trigData;
    } else {
      newObj[trigger] = trigData;
    }
  });

  Object.keys(newObj).forEach((key) => {
    const trigData = newObj[key];

    if (`${trigData.Returns}`.includes("+prop")) {
      newObj[key] = removeProp(trigData);
    }

    if (`${trigData.Returns}`.includes("+flow")) {
      newObj[key] = removeFlow(trigData);
    }
  });

  fs.writeFileSync(`./converted.json`, JSON.stringify(newObj, null, 2), "utf8");
  fs.writeFileSync(`./bad.json`, JSON.stringify(bad, null, 2), "utf8");

  process.exit(0);
})();
