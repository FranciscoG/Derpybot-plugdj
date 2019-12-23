"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");

/**
 * Insert leaderboard info for the month
 * @param  {Object}   db       Firebase Object
 * @param  {string}   id       Leader id whic is a combination of month + year
 * @param  {Object}   leaderObj Leaderboard information
 */
const insertLeaderMonth = function(db, id, leaderObj) {
  return db
    .ref("leaderboard")
    .child(id)
    .set(leaderObj);
};

module.exports = {
  insertLeaderMonth: insertLeaderMonth
};
