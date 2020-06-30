'use strict';
/** 
 * Return the proper private items based on environment variables
*/
const env = process.env.ENV || 'prod';
module.exports = {
  settings : require( `./${env}/settings.js`),
  svcAcct : require(`./${env}/serviceAccountCredentials.json`)
};

