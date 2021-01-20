"use strict";
const admin = require("firebase-admin");
const config = require("../private/get");
const settings = config.settings;
const svcAcct = config.svcAcct;
const BASEURL = settings.FIREBASE.BASEURL;

function database(serviceAccount, BASEURL, optionalAppName) {
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

const db = database(svcAcct, BASEURL);

module.exports = db;
