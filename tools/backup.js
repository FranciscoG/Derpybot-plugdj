#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../');
const db = require(root + '/bot/db.js');


/*************************************
  Back up our DB via Cron.  Mainly
  to backup triggers
*/

const d = new Date().toLocaleString().replace(/[\\/\s:]+/g, '-').replace(',','');

db.ref().once('value', function(snapshot) {
  const val = snapshot.val();
  if (val !== null) {
    // save backups outside of the repo
    const loc = root + '/../Derpy-backups';
    fs.writeFileSync(`${loc}/backup-${d}.json`, JSON.stringify(val), 'utf8');
    process.exit();
  }
});