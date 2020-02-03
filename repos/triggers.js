"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");
const _get = require("lodash/get");

/**
 *
 * @param {object} db firebase db instance
 * @returns {array}
 */
const getAllTriggers = async function(db) {
  const ref = db.ref("triggers");
  const snapshot = await ref.once("value");
  return snapshot.val();
};

/**
 * Get a trigger from the database
 * @param  {Object}   db          Firebase instance
 * @param  {String}   triggerName trigger to look up
 * @param  {Function} callback
 */
const getTrigger = function(db, triggerName, callback) {
  return db
    .ref("triggers")
    .orderByChild("Trigger")
    .equalTo(triggerName.toLowerCase() + ":")
    .once("value", function(snapshot) {
      var val = snapshot.val();
      if (typeof callback === "function") {
        return callback(val);
      }
    });
};

const getTriggerAsync = async function(db, triggerName) {
  const ref = db
    .ref("triggers")
    .orderByChild("Trigger")
    .equalTo(triggerName.toLowerCase() + ":");
  const snapshot = await ref.once("value");
  return Promise.resolve(snapshot.val());
};

/**
 * Updates a trigger in the DB
 * @param  {Object} db   Firebase instance
 * @param  {TriggerModel} model instance of TriggerModel
 * @return {Firebase.Promise}
 */
const updateTrigger = async function(db, model) {
  if (!model || !model.key || !model.data.Returns || !model.data.Trigger) {
    throw new Error("missing some data trying to update trigger");
  }

  var dbTrig = db.ref("triggers/" + model.key);

  // update the last trigger in the background
  db.ref("lastTrigger")
    .set(model.data)
    .then(function(err) {
      if (err) {
        console.log("repo.lastTrigger.set", err.message);
      }
    });

  return dbTrig.set(model.data);
};

/**
 * Insert a new trigger into the DB
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Trigger data, see function for details, needs {Author, Returns, Trigger}
 * @return {Firebase.Promise}
 */
const insertTrigger = async function(db, data) {
  if (!data || !data.triggerName || !data.triggerText) {
    throw new Error("missing triggerName or triggerText");
  }

  var author = _get(data, "user.username", "unknown");

  let newTrigger = {
    Author: author,
    Returns: data.triggerText,
    Trigger: data.triggerName.toLowerCase() + ":",
    status: "created",
    lastUpdated: null,
    createdOn: Date.now(),
    createdBy: author
  };

  // dont care to wait lastTrigger because it's not important
  db.ref("lastTrigger").set(newTrigger);
  const newRef = db.ref("triggers").push();
  await newRef.set(newTrigger);
  const snapshot = await newRef.once("value");
  const val = snapshot.val();
  val.fbkey = snapshot.key;
  return Promise.resolve(val);
};

/**
 * Delete a trigger in the db
 * @param  {Object} db         Firebase Instance
 * @param  {String} triggerKey The key of the location of the trigger
 * @param  {Object} oldTrigger
 * @return {Firebase.Promise}  Returns a promise
 */
const deleteTrigger = function(db, triggerKey, oldTrigger) {
  if (!triggerKey) {
    return;
  }

  if (typeof oldTrigger === "object") {
    oldTrigger.status = "deleted";
    db.ref("lastTrigger").set(oldTrigger);
  }
  return db.ref("triggers/" + triggerKey).remove();
};

module.exports = {
  getTrigger: getTrigger,
  getTriggerAsync: getTriggerAsync,
  updateTrigger: updateTrigger,
  insertTrigger: insertTrigger,
  deleteTrigger: deleteTrigger,
  getAllTriggers: getAllTriggers
};
