'use strict';
var log = require('jethro');
log.setTimestampFormat(null, 'YYYY-MM-DD HH:mm:ss:SSS');
var _ = require('lodash');

/**
 * Find a user by user.id
 * @param  {Object}   db       Firebase database instance
 * @param  {int}      userid   
 * @returns {Promise}
 */
var findUserById = async function(db, userid) { 
  const ref = db.ref('users').child(userid);
  const snapshot = await ref.once('value');
  return snapshot.val();
};

/**
 * Update a users data in the db
 * @param  {Object}   db       Firebase database instance
 * @param  {number}   userid
 * @param  {Object}   data     Object containing key/values of what is to be updated
 * @returns null
 */
var updateUser = async function(db, userid, data) {
  var updateRef = db.ref('users').child(userid);
  return await updateRef.update(data);
};

/**
 * Update the entire db.users object as a whole
 * @param {Object} db  Firebase instance
 * @param {Object} data all user data
 * @returns {Promise}
 */
var updateAllUsers = function(db, data) {
  if (db && data) {
    return db.ref('users').set(data);
  } else {
    return Promise.reject('missing required arguments');
  }
};

/**
 * Takes in a data object provided by DT and only returns an object
 * of the items we need in order to keep our DB small
 */
function refineUser(data){
  return {
    'isPlugDJ' : true,
    'props' : data.props || 0,
    'flow' : data.flow || 0,
    'DateAdded' : data.DateAdded || new Date(),
    'LastConnected': data.LastConnected || Date.now(),
    'username' : data.username || '404unknown',
    'id' : data.id,
    'introduced' : data.introduced || false,
    'pp': data.pp || 0,  // plug points
    'logType' : data.logType || 'inserted'
  };
}

/**
 * Pretty self explanatory
 * @param  {Object}   db       Firebase Object
 * @param  {Object}   user     DT user object
 * @returns null
 */
var insertUser = async function(db, user) {
  var usersRef = db.ref('users');
  var extraStuff = refineUser(user);
  var finalNewUser = Object.assign({}, user, extraStuff);

  // replace undefined with nulls becaue Firebase doesnt like undefined
  Object.keys(finalNewUser).forEach(function(key){
    if ( finalNewUser[key] === void(0)/* aka undefined */ ){ 
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
var logUser = async function(db, user) {
  const ref = db.ref('users');
  const userRef = ref.child(user.id);
  const snapshot = await userRef.once('value');
  const val = snapshot.val();

  if (!val) {
    let userLogInfo = refineUser(user);
    await insertUser(db, userLogInfo);
    user.logType = 'inserted';
    return user;
  } else {
    let userLogInfo = refineUser(val);
    userLogInfo.username = user.username;
    await updateUser(db, user.id, userLogInfo);
    user.logType = 'updated';
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
var incrementUser = async function(db, user, thing, callback) {
  const ref = db.ref('users/' + user.id + '/' + thing);

  try {
    await ref.transaction(
      // increment prop by 1
      function (currentValue) {
        return (currentValue || 0) + 1;
      }
    );
    return await findUserById(db, user.id);
  } catch (e) {
    log('error', 'REPO', 'incrementUser:' + e.message);
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
var getLeaders = function(db, prop, limit, callback) {
  return db.ref('users')
    .orderByChild(prop)
    .limitToLast(limit)
    .once('value', function(snapshot) {
      callback(snapshot.val());
    });
};

/**
 * Get a trigger from the database
 * @param  {Object}   bot         dubapi instance
 * @param  {Object}   db          Firebase instance
 * @param  {String}   triggerName trigger to look up
 * @param  {Function} callback    
 */
var getTrigger = function (bot, db, triggerName, callback) {
  db.ref('triggers')
    .orderByChild('Trigger')
    .equalTo(triggerName.toLowerCase() + ':')
    .once('value', function(snapshot) {
      var val = snapshot.val();
      if (typeof callback === 'function') {
        return callback(val);
      }
  });
};

/**
 * Updates a trigger in the DB
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Trigger data, see function for details, needs {Author, Returns, Trigger}
 * @param {Object} orignialValue  original value from firebase of trigger
 * @return {Firebase.Promise}
 */
var updateTrigger = function(db, data, triggerKey, orignialValue){
  if (!triggerKey || !data || !data.triggerText || !data.triggerName) { return; }

  if (!orignialValue) { orignialValue = {}; }

  var dbTrig = db.ref('triggers/'+triggerKey);

  var updateObj = {
    Author: data.user.username,
    Returns: data.triggerText || orignialValue.Returns,
    Trigger: data.triggerName.toLowerCase() + ':',
    status: 'updated',
    lastUpdated : Date.now(),
    createdOn : orignialValue.createdOn || null,
    createdBy : orignialValue.createdBy || null
  };

  // console.log(updateObj);

  db.ref('lastTrigger').set(updateObj).then(function(err)  {
    if (err) { console.log('repo.lastTrigger.set', err); }
  });
  return dbTrig.set(updateObj);
};

/**
 * Insert a new trigger into the DB
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Trigger data, see function for details, needs {Author, Returns, Trigger}
 * @return {Firebase.Promise}
 */
var insertTrigger  = function(db, data) {
  if (!data || !data.triggerName || !data.triggerText) { return; }
  
  var author = _.get(data, 'user.username', 'unknown');

  let newTrigger = {
    Author: author,
    Returns: data.triggerText,
    Trigger: data.triggerName.toLowerCase() + ':',
    status: 'created',
    lastUpdated : null,
    createdOn : Date.now(),
    createdBy : author
  };

  db.ref('lastTrigger').set(newTrigger);
  return db.ref('triggers').push().set(newTrigger);
};

/**
 * Delete a trigger in the db
 * @param  {Object} db         Firebase Instance
 * @param  {String} triggerKey The key of the location of the trigger
 * @return {Firebase.Promise}  Returns a promise
 */
var deleteTrigger = function(db, triggerKey, oldTrigger) {
  if (!triggerKey) { return; }

  oldTrigger.status = "deleted";
  db.ref('lastTrigger').set(oldTrigger);
  return db.ref('triggers/' + triggerKey).set(null);
};

/**
 * Inserts to trigger history
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Trigger data returned from Firebase
 * @return {Firebase.Promise}
 */
var logTriggerHistory  = function(db, msg, data) {
  if (!data || !data.triggerName || !data.triggerText) { return; }
  
  var author = _.get(data, 'user.username', 'unknown');

  return db.ref('triggerHistory').push().set({
    Author: author,
    Returns: data.Returns,
    Trigger: data.Trigger,
    status: data.status,
    lastUpdated : data.lastUpdated,
    createdOn : data.createdOn,
    createdBy : data.createdBy,
    msg : msg
  });
};

/**
 * Pretty self explanatory
 * @param  {Object}   db       Firebase Object
 * @param  {Object}   media    DubApi's current media info object
 * @param  {String|Int} id     data.media.cid
 * @param  {String} reason      what the issue was
 * @param  {Function} callback 
 */
var trackSongIssues = function(db, ytResponse, media, reason) {
  var songIssues = db.ref('/song_issues');
  
  ytResponse.reason = reason;
  ytResponse.date = new Date();
  ytResponse.timestamp = Date.now();

  var saveObj = Object.assign({}, ytResponse, media);

  songIssues.child(media.cid).set(saveObj, function(err){
    if (err) { 
      log('error', 'REPO', 'trackSongIssues: Error saving for id ' + media.cid);
    }
  });
};

var getSongIssue = function(db, cid){
  return db.ref('song_issues')
    .child(cid)
    .once('value');
};



var saveSong = function(db, cid, saveObj) {
  var song_stats = db.ref('song_stats');
  song_stats.child(cid)
    .set(saveObj, function(err){
      if (err) { 
        log('error', 'REPO', 'song_stats: Error saving for id ' + cid);
      }
    });
};

var getSong = function(db, cid) {
  return db.ref('song_stats')
    .child(cid)
    .once('value');
};

/**
 * Insert leaderboard info for the month
 * @param  {Object}   db       Firebase Object
 * @param  {string}   id       Leader id whic is a combination of month + year
 * @param  {Object}   leaderObj Leaderboard information
 */
var insertLeaderMonth = function(db, id, leaderObj) {
  return db.ref('leaderboard').child(id).set(leaderObj);
};

module.exports = {
  logUser  : logUser,
  findUserById  : findUserById,
  updateUser  : updateUser,
  updateAllUsers  : updateAllUsers,
  getLeaders : getLeaders,
  incrementUser : incrementUser,
  getTrigger : getTrigger,
  updateTrigger : updateTrigger,
  insertTrigger : insertTrigger,
  deleteTrigger : deleteTrigger,
  trackSongIssues : trackSongIssues,
  getSongIssue : getSongIssue,
  saveSong : saveSong,
  getSong : getSong,
  insertLeaderMonth : insertLeaderMonth,
  logTriggerHistory :logTriggerHistory 
};