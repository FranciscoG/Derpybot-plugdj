const PlugAPI = require("plugapi");
const admin = require("firebase-admin");
const isObj = require('lodash/isPlainObject');

const FACTORIES = {
  bot: (bot) => bot instanceof PlugAPI,
  db: (db) => db instanceof admin.database.Database,
  data: (data) => isObj(data),
};

/**
 * test required arguments are instances of specific classes or types
 * @param {string[]} required array or required dep types, must match FACTORIES keys
 * @param  {...any} deps remaining arguments must be in same order as required array
 */
function checkArgs(required, ...deps) {
  for (let i = 0; i < required.length; i++) {
    // current argument to be tested
    const dep = deps[i]; // example: bot
    if (!dep) {
      return false;
    }

    // type of testing to be done
    const type = required[i]; // example: 'bot'

    // use type to access corresponding test function
    const testFunc = FACTORIES[type]; 

    if (!testFunc(dep)) {
      return false;
    }
  }

  return true;
}

module.exports = checkArgs;
