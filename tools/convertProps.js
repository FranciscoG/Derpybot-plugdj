#!/usr/bin/env node
"use strict";
process.env.ENV = "test";
var db = require("../bot/db.js");

/**
 *
 * @param {string} key firebase db key for the trigger
 * @param {Object} trig the stored trigger object at that key
 * @returns {Promise} with the result from firebase db.set
 */
function removeProp(key, trig) {
  var last = trig.Returns.split(" ")
    .pop()
    .split("=");

  if (last.length > 1) {
    trig.propEmoji = last[1];
  }

  trig.givesProp = true;
  trig.lastUpdated = Date.now();
  trig.Returns = `${trig.Returns}`.replace(/\+prop=?.*$/, "");

  var dbTrig = db.ref("triggers/" + key);
  return dbTrig.set(trig);
}

function removeFlow(key, trig) {
  var last = trig.Returns.split(" ")
    .pop()
    .split("=");

  if (last.length > 1) {
    trig.flowEmoji = last[1];
  }

  trig.givesFlow = true;
  trig.lastUpdated = Date.now();
  trig.Returns = `${trig.Returns}`.replace(/\+flow=?.*$/, "");

  var dbTrig = db.ref("triggers/" + key);
  return dbTrig.set(trig);
}

/**
 * inserts a new trigger into the db
 * @param {Object} trig
 * @returns {Promise.resolve<string>} the new key
 */
async function addNewTrigger(trig) {
  const newRef = db.ref("triggers").push();
  await newRef.set(trig);
  const snapshot = await newRef.once("value");
  return Promise.resolve(snapshot.key);
}

async function getNewKey(oldKey, trig) {
  console.log("re-inserting", oldKey, trig.Trigger);
  const newKey = await addNewTrigger(trig);
  console.log(oldKey, 'is now stored at', newKey);
  await db.ref("triggers/" + oldKey).remove();
  return Promise.resolve(newKey);
}

(async function() {
  const snapshot = await db.ref("triggers").once("value");
  const val = snapshot.val();

  Object.keys(val).forEach(async key => {
    var trig = val[key];
    let _key = key;
    
    // if (key === `${trig.Trigger}`.replace(/:$/, "")) { 
    //   _key = await getNewKey(key, trig);
    // }
    
    if (`${trig.Returns}`.includes("+prop")) {
      console.log(_key, trig.Trigger, trig.Returns);
      // await removeProp(_key, trig);
    }

    if (`${trig.Returns}`.includes("+flow")) {
      console.log(_key, trig.Trigger, trig.Returns);
      // await removeFlow(_key, trig);
    }
  });

})();
