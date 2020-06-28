"use strict";
/* eslint no-console: 0 */
/************************************************************************

Load the Triggers data file and create new keys in Firebase
This is just in case we lost all the triggers  But Backs up should
be made as well

require:
make sure you update the dataFile location and name 

************************************************************************/
const path = require("path");
const db = require(path.resolve(__dirname, "../bot/db.js"));

const file = process.argv[2];
const dataFile = require(file);

dataFile.forEach(function (el, i) {
  db.ref("triggers")
    .push()
    .set(
      {
        Author: el.Author,
        Returns: el.Returns,
        Trigger: el.Trigger,
      },
      function (err) {
        if (err) {
          console.log(err);
        }

        if (i + 1 >= dataFile.length) {
          setTimeout(function () {
            process.exit();
          }, 3000);
        }
      }
    );
});
