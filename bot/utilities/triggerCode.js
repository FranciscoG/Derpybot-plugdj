/// require('../utilities/typedefs');
var request = require("request");
var _get = require("lodash/get");

/**
 * Mini programming language for triggers
 * usage:
 *
 * Single Command per line
 * {ACTION jsonPath FROM source}
 *  - must be surround in brackets with nothing outside the brackets
 *  - ACTION = right now the only ACTION is GET for GET requests
 *  - jsonPath = is a string to pass into lodash.get that represents the path
 *    to the nested json property you want to get
 *  - FROM  = just for clarity to indicate the next item is the source
 *  - source = must be a URL that returns a JSON response and does not need authentication
 *
 * example: '{ GET obj[0].name FROM http://blabla.com/{0} }'
 */

/* 
  example:
  
  create trigger like this:
  !trigger wiki {GET [3][0] FROM https://en.wikipedia.org/w/api.php?action=opensearch&search={0}&limit=1&namespace=0&format=json}

  then use it like this:
  !wiki black+cats
 */

/**
 *
 *
 * @param {array} trig trigger text
 * @returns
 */
function parseTrigger(trig) {
  const nodes = trig
    .substring(1, trig.length - 1) // remove open/close brackets
    .trim()
    .split(" ");

  /**
   * For now this is super super simple and only handles GET requests
   * nodes[0] should always always === "GET"
   * nodes[2] should always always === "FROM"
   * so we can ignore them.. for now.
   */

  return {
    action: nodes[0],
    jsonPath: nodes[1],
    url: nodes[3],
  };
}

/**
 * parse a code trigger and execute it
 * @param {string} trigger
 * @param {BotCommand} data
 */
module.exports = function (trigger, data) {
  var deets = parseTrigger(trigger);
  var url = deets.url;

  // the url should contain {n} (n = any number) so that you can replace
  // it with dynamic info from the trigger command arguments
  if (/(\{\d\})+/g.test(url) && !data.args.length) {
    return "This trigger requires more data";
  }

  if (data.args.length > 0) {
    // if you put {@} in the url it will take all of the arguments and join them
    // with a "+" and replace it
    if (url.includes("{@}")) {
      url = url.replace("{@}", data.args.join("+"));
    } else {
      data.args.forEach((p, i) => {
        url = url.replace(`{${i}}`, p);
      });
    }
  }

  var options = {
    url: url,
    headers: {
      Accept: "application/json",
    },
  };

  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
        return;
      }

      if (!error && response.statusCode === 200) {
        try {
          let json = JSON.parse(body);
          let result = _get(json, deets.jsonPath, "No results");
          resolve(result);
        } catch (e) {
          reject(e); // json parsing error
        }
        return;
      }

      reject(`Bad request with code: ${response.statusCode}`);
    });
  });
};
