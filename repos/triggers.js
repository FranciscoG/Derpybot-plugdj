"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");
const _get = require("lodash/get");

/**
 * @typedef {import('../bot/models/trigger-model').TriggerModelData} TriggerModelData
 */

/**
 *
 * @param {object} db firebase db instance
 * @returns {array}
 */
const getAllTriggers = async function (db) {
  const ref = db.ref("triggers");
  const snapshot = await ref.once("value");
  return snapshot.val();
};

/**
 * Get a trigger from the database
 * @param  {Object}   db          Firebase instance
 * @param  {String}   triggerName trigger to look up
 * @returns {Promise.resolve<[Error, TriggerModelData]>}
 */
const getTrigger = async function (db, triggerName) {
  try {
    const snapshot = await db.ref("triggers/" + triggerName);
    return [null, snapshot.val()];
  } catch (err) {
    return [err, null];
  }
};

/**
 * Insert new, or update existing, trigger into the DB
 * @param  {Object} db   Firebase instance
 * @param  {TriggerModel} data Trigger data, see function for details, needs {Author, Returns, Trigger}
 * @return {Promise<true>}
 * @throws
 */
const insertTrigger = async function (db, model) {
  if (!model || !model.data.Returns || !model.data.Trigger) {
    throw new Error("missing triggerText or TriggerName");
  }

  updateLastTrigger(db, model.data);

  const newRef = await db.ref("triggers/" + model.data.Trigger);
  await newRef.set(model.data);
  return true;
};

/**
 * Delete a trigger in the db
 * @param  {Object} db Firebase Instance
 * @param  {TriggerModelData} model
 * @return {Promise<true>}
 * @throws
 */
const deleteTrigger = async function (db, data) {
  if (!data.Trigger) {
    return;
  }

  data.status = "deleted";

  updateLastTrigger(db, data);

  await db.ref("triggers/" + data.Trigger).remove();
  return true;
};

function updateLastTrigger(db, data) {
  // update lastTrigger without waiting for it
  db.ref("lastTrigger")
    .set(data)
    .catch((err) => {
      console.error("repo.lastTrigger.set", err.message);
    });
}

module.exports = {
  getTrigger: getTrigger,
  insertTrigger: insertTrigger,
  deleteTrigger: deleteTrigger,
  getAllTriggers: getAllTriggers,
};
