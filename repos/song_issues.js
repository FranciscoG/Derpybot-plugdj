"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");

/**
 * This is not being used right now but I was tracking songs that 
 * had issues so I could have some bad tracks to test with. I gathered up
 * a good enough list of stuff that I stopped using it. Leaving this here
 * just in case I need this again later.
 */

/**
 * Pretty self explanatory
 * @param  {Object}   db       Firebase Object
 * @param  {Object}   media    DubApi's current media info object
 * @param  {String|Int} id     data.media.cid
 * @param  {String} reason      what the issue was
 * @param  {Function} callback
 */
const trackSongIssues = function(db, ytResponse, media, reason) {
  var songIssues = db.ref("/song_issues");

  ytResponse.reason = reason;
  ytResponse.date = new Date();
  ytResponse.timestamp = Date.now();

  var saveObj = Object.assign({}, ytResponse, media);

  songIssues.child(media.cid).set(saveObj, function(err) {
    if (err) {
      log("error", "REPO", "trackSongIssues: Error saving for id " + media.cid);
    }
  });
};

const getSongIssue = function(db, cid) {
  return db
    .ref("song_issues")
    .child(cid)
    .once("value");
};

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
  trackSongIssues: trackSongIssues,
  getSongIssue: getSongIssue
};
