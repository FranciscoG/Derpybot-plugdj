'use strict';
var fs = require("fs");

module.exports = function(bot, db) {
    //loop through events directory and require each while passing the bot and db
    var events = process.cwd() + "/bot/events";
    fs.readdirSync(events).forEach(function(file) {
        if (file.indexOf(".js") > -1) {
            var event = require(events + "/" + file);
            if (typeof event === "function") {
                event(bot, db);
            } else if (typeof event === "object") {
                event.main(bot, db);
            }
        }
    });
};
