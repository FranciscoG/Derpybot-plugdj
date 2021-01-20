"use strict";
/**
 * @typedef {import('../bot/utilities/typedefs').TriggerModelData} TriggerModelData
 */

/**
 *
 * @param {object} db firebase db instance
 * @returns {Promise<[Error?, TriggerModelData[]?]>}
 */
const getAllTriggers = async function (db) {
  try {
    const ref = db.ref("triggers");
    const snapshot = await ref.once("value");
    return [null, snapshot.val()];
  } catch (err) {
    return [err, null];
  }
};

/**
 * Get a trigger from the database
 * @param  {Object}   db          Firebase instance
 * @param  {String}   triggerName trigger to look up
 * @returns {Promise<[Error?, TriggerModelData?]>}
 */
const getTrigger = async function (db, triggerName) {
  try {
    const snapshot = await db.ref("triggers").child(triggerName).once("value");
    return [null, snapshot.val()];
  } catch (err) {
    return [err, null];
  }
};

/**
 * Insert new, or update existing, trigger into the DB
 * @param  {Object} db   Firebase instance
 * @param  {TriggerModelData} model Trigger data, see function for details, needs {Author, Returns, Trigger}
 * @return {Promise<true>}
 * @throws
 */
const insertTrigger = async function (db, model) {
  if (!model || !model.Returns || !model.Trigger) {
    throw new Error("missing triggerText or TriggerName");
  }

  updateLastTrigger(db, model);

  const newRef = await db.ref("triggers/" + model.Trigger);
  await newRef.set(model);
  return true;
};

/**
 * Delete a trigger in the db
 * @param  {Object} db Firebase Instance
 * @param  {TriggerModelData} data
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
