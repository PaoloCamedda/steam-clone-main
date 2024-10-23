"use strict";

const db = require('./db');

function autocomplete(name) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT name FROM game WHERE name LIKE ? LIMIT 10';
      const queryParams = [`%${name}%`];
  
      db.all(query, queryParams, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows.map(row => row.name));
      });
    });
  }
  
  module.exports = { autocomplete };
