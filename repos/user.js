"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");

/**
 * Find a user by user.id
 * @param  {Object}   db       Firebase database instance
 * @param  {int}      userid
 * @returns {Promise}
 */
const findUserById = async function(db, userid) {
  const ref = db.ref("users").child(userid);
  const snapshot = await ref.once("value");
  return snapshot.val();
};

/**
 * Update a users data in the db
 * @param  {Object}   db       Firebase database instance
 * @param  {number}   userid
 * @param  {Object}   data     Object containing key/values of what is to be updated
 * @returns null
 */
const updateUser = async function(db, userid, data) {
  var updateRef = db.ref("users").child(userid);
  return await updateRef.update(data);
};

/**
 * Update the entire db.users object as a whole
 * @param {Object} db  Firebase instance
 * @param {Object} data all user data
 * @returns {Promise}
 */
const updateAllUsers = function(db, data) {
  if (db && data) {
    return db.ref("users").set(data);
  } else {
    return Promise.reject("missing required arguments");
  }
};

/**
 * Takes in a data object provided by DT and only returns an object
 * of the items we need in order to keep our DB small
 */
function refineUser(data) {
  return {
    isPlugDJ: true,
    props: data.props || 0,
    flow: data.flow || 0,
    DateAdded: data.DateAdded || new Date(),
    LastConnected: data.LastConnected || Date.now(),
    username: data.username || "404unknown",
    id: data.id,
    introduced: data.introduced || false,
    pp: data.pp || 0, // plug points
    logType: data.logType || "inserted"
  };
}

/**
 * Pretty self explanatory
 * @param  {Object}   db       Firebase Object
 * @param  {Object}   user     DT user object
 * @returns null
 */
const insertUser = async function(db, user) {
  var usersRef = db.ref("users");
  var extraStuff = refineUser(user);
  var finalNewUser = Object.assign({}, user, extraStuff);

  // replace undefined with nulls becaue Firebase doesnt like undefined
  Object.keys(finalNewUser).forEach(function(key) {
    if (finalNewUser[key] === void 0 /* aka undefined */) {
      finalNewUser[key] = null;
    }
  });
  return await usersRef.child(user.id).set(finalNewUser);
};

/**
 * Logs a user to the db
 * @param  {Object}   db       Firebase object
 * @param  {Object}   user     PlugAPI user object: https://plugcubed.github.io/plugAPI/#user
 * @returns {Object}  passs back the user object with logType property
 */
const logUser = async function(db, user) {
  const ref = db.ref("users");
  const userRef = ref.child(user.id);
  const snapshot = await userRef.once("value");
  const val = snapshot.val();

  if (!val) {
    let userLogInfo = refineUser(user);
    await insertUser(db, userLogInfo);
    user.logType = "inserted";
    return user;
  } else {
    let userLogInfo = refineUser(val);
    userLogInfo.username = user.username;
    await updateUser(db, user.id, userLogInfo);
    user.logType = "updated";
    return user;
  }
};

/**
 * Increment by 1, a value of a user
 * @param  {Object}   db       Firebase Object
 * @param  {Object}   user
 * @param  {String}   thing    The property to be incremented by
 * @returns {Promise}
 */
const incrementUser = async function(db, user, thing, callback) {
  const ref = db.ref("users/" + user.id + "/" + thing);

  try {
    await ref.transaction(
      // increment prop by 1
      function(currentValue) {
        return (currentValue || 0) + 1;
      }
    );
    return await findUserById(db, user.id);
  } catch (e) {
    log("error", "REPO", "incrementUser:" + e.message);
    throw e;
  }
};

/**
 * Sort by a specific user property and return array
 * @param  {Object}   db       Firebase database obj
 * @param  {string}   prop     name of the property to sort by
 * @param  {int}      limit
 * @param  {Function} callback
 */
const getLeaders = function(db, prop, limit, callback) {
  return db
    .ref("users")
    .orderByChild(prop)
    .limitToLast(limit)
    .once("value", function(snapshot) {
      callback(snapshot.val());
    });
};

module.exports = {
  logUser: logUser,
  findUserById: findUserById,
  updateUser: updateUser,
  updateAllUsers: updateAllUsers,
  getLeaders: getLeaders,
  incrementUser: incrementUser
};
