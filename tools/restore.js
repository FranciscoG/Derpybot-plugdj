/* eslint no-console: 0 */
/************************************************************************
Restore from backup
************************************************************************/
"use strict";
process.env.ENV = process.env.ENV || "test";
const path = require("path");
const db = require(path.resolve(__dirname, "../bot/db.js"));

const file = process.argv[2];
if (!file) {
  console.error("missing file to restore from");
  process.exit(1);
}
const dataFile = require(path.resolve(__dirname, file));
db.ref("triggers")
  .set(dataFile)
  .then(() => {
    process.exit(0);
  })
  .catch(console.error);
