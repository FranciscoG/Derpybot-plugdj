
/**  
 * use inside an async function to pause the function for x milliseconds
 * usage:
 * const sleep = require('path/to/this/file/sleep.js');
 * await sleep(5000);
 * 
 * @param {number} ms time to sleep in milliseconds, default 1s
 * @returns {Promise}
 */
module.exports = function(ms) {
  return new Promise(function(resolve, reject){
    setTimeout(resolve, ms || 1000);
  });
};