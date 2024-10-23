"use strict";

const sqlite3 = require('sqlite3').verbose();

const DBFILE = './model/game-users.db';

const db = new sqlite3.Database(DBFILE, (err) => {
    if (err) {
        console.log(err);
        throw err;
    }

    db.get("PRAGMA foreign_keys = ON");
  });

  // esportazione necessaria dell'oggetto db perché lo si possa usare anche altrove
module.exports = db;