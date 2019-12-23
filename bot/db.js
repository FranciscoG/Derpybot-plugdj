"use strict";
var admin = require("firebase-admin");
const config = require(process.cwd() + "/private/get");
const settings = config.settings;
const svcAcct = config.svcAcct;
var BASEURL = settings.FIREBASE.BASEURL;

function Database(serviceAccount, BASEURL, optionalAppName) {
  if (!serviceAccount || !BASEURL) {
    throw new Error("Missing databse credentials for Database");
  }

  // returns an instances of admin.app
  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: BASEURL
    },
    optionalAppName
  );

  return admin.database();
}

var db = new Database(svcAcct, BASEURL);

module.exports = db;
