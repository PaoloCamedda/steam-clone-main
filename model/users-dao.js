"use strict";


// modules import
const db = require('./db');
const bcrypt = require('bcrypt');
const GameManager = require('../gameManagerServer');
const Filter = require('../filtersServer');


function removeTrailingComma(str) {
    if (str.endsWith(',')) {
        return str.slice(0, -1);
    }
    return str;
}

/**
 * Get users in db.
 * @param {string} userId - User's unique ID.
 * @returns {Promise} - Promise object representing the list of users.
 */
exports.getUsers = function () {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM user";
        db.all(sql, (err, rows) => {
            if (err) {
                reject({status: 500, msg: err.message});
            } else {
                if (rows.length) {
                    const users = rows;
                    resolve(users);
                } else {
                    reject({status: 404, msg: "Errore: nessun user nel db"})
                }
            }
        });
    });
}

exports.getUserByUsername = function (username) {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM user WHERE user.username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject({status:500, msg: err.message});
            } else {
                if (row) {
                    const user = row;
                    user.checkPassword = function(password) {
                        if(bcrypt.compareSync(password, user.password)) return true;
                        else return false;
                    }
                    resolve(user);
                } else {
                    reject({ status: 404, message: `Incorrect username='${username}'` });
                }
            }
        });
    });
}

/**
 * Get a user by ID.
 * @param {string} userId - User's unique ID.
 * @returns {Promise} - Promise object representing the user.
 */
exports.getUser = function (userId) {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM user WHERE user.id=?";
        db.get(sql, [userId], (err, row) => {
            if (err) {
                reject({status:500, msg: err.message});
            } else {
                if (row) {
                    const user = row;
                    resolve(user);
                } else {
                    reject({status: 404, msg: `Errore: nessun user con id ${userId} nel db`});
                }
            }
        });
    });
}


/**
 * Get games in user's wishlist.
 * @param {string} userId - User's unique ID.
 * @param {Object} query - Query parameters for filtering games.
 * @returns {Promise} - Promise object representing the list of games.
 */
exports.getGamesInWishlist = function (userId, query) {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM game,list WHERE game.id = list.game_id AND list.user_id = ?";
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject({status:500, msg: err.message});
            } else {
                if (rows.length) {
                    let games = rows.map((row) => ({
                        id: row.game_id,
                        name: row.name,
                        relese: row.relese,
                        category: (row.category) ? row.category.split(',') : null,
                        prezzo: row.prezzo,
                        image :row.image,
                        system:  (row.system) ? row.system.split(',') : null
                    }) );

                    const filter = query.filter;
                    if (filter) {
                        const gameManager = new GameManager();
                        gameManager.createGameWishList(games);//Cambiare nome dopo aver fatto il gamemanager in client

                        const filterType = new Filter(gameManager,filter);
                        if (filter==='category') {
                            const category = query.category;
                            if (category) {
                                games = filterType.apply(category);
                            }
                            else {
                                games = filterType.apply('all-categories');
                            }
                        } else {
                            games = filterType.apply();
                        }
                    }
                    resolve(games);
                } else {
                    reject({status: 404, msg: `errore: nessun gioco nei preferiti ${userId}`});
                }
            }
        });
    });
}



/**
 * Add a game to the user's wishlist.
 * @param {string} userId - User's unique ID.
 * @param {string} gameId - Game's unique ID.
 * @param {Object} gameInfo - Additional information about the game.
 * @returns {Promise} - Promise object representing the addition operation.
 */
exports.addGameInWishList = function (userId,gameId,gameInfo) {
    return new Promise ((resolve, reject) => {
        // controlla se il game non sia già nella wishlist dell'utente
        const sql = "SELECT * FROM list WHERE user_id = ? AND game_id = ?";
        db.all(sql, [userId, gameId], (err, rows) => {
            if (err) {
                reject({status: 500, msg: err.message})
            } else {
                if (rows.length) {
                    reject({status:422, msg: `errore: gioco con id ${gameId} già presentenei preferiti ${userId}.` });
                }
                else {

                    const ins = "INSERT INTO list (game_id, user_id, posseduto,preferito) VALUES (?,?,?,?)";
                    db.run(ins,[gameId,userId,  posseduti,whis],
                        (err) => {
                            if (err) {
                                reject({status: 500, msg: err.message});
                            } else {
                                resolve();
                            }
                        });
                }
            }
        });
    });
}

/**
 * Delete a game from the user's wishlist.
 * @param {string} userId - User's unique ID.
 * @param {string} gameId - Game's unique ID.
 * @returns {Promise} - Promise object representing the deletion operation.
 */
exports.deleteGameInWishList = function (userId,gameId) {
    return new Promise ((resolve, reject) => {
        const del = "DELETE FROM list WHERE game_id=? AND user_id=?";
        db.run(del,[gameId,userId], (err) => {
            if (err) {
                reject({status: 500, msg: err.message});
            } else {
                resolve();
            };
        });
    });
}

/**
 * Update a game in the user's wishlist.
 * @param {string} userId - User's unique ID.
 * @param {string} gameId - Game's unique ID.
 * @param {Object} gameInfo - Updated information about the game.
 * @returns {Promise} - Promise object representing the update operation.
 */
exports.updateGameInWishList = function (userId,gameId,gameInfo) {
    return new Promise ((resolve, reject) => {
        // controlla se il game è nella wishlist dell'utente, altrimenti restituisce un errore
        const sql = "SELECT * FROM list WHERE list.user_id = ? AND list.game_id=?";
        db.get(sql, [userId, gameId], (err, row) => {
            if (err) {
                reject({status: 500, msg: err.message});
            } else {
                if (row) {
                    const posseduti = (typeof gameInfo.posseduti!=='undefined') ? gameInfo.posseduti : row.posseduti;
                    const whis = (typeof gameInfo.whis!=='undefined') ? gameInfo.whis : row.whis;


                    const upd = "UPDATE list SET unmissable = ?, visibility = ?, viewed = ? WHERE user_id = ? AND game_id=?";
                    db.run(upd,[userId, gameId,posseduti, whis],  (err) => {
                        if (err) {
                            reject({status: 500, msg: err.message});
                        } else {
                            resolve();
                        }
                    });
                } else {
                    reject({status: 422, msg: `errore: gioco con id ${gameId} non presente nei preferiti ${userId}.`})
                }
            }
        });
    });
}

/**
 * Create a new user, eventually after a signup
 * @param {Object} user - User's info.
 * @returns {Promise} - Promise object representing the update operation.
 */
exports.createUser = function(user) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO user (firstname, lastname, username, password, email) VALUES (?, ?, ?, ?, ?)';
        // create the hash as an async call, given that the operation may be CPU-intensive (and we don't want to block the server)
        bcrypt.hash(user.password, 10).then((hash => {
            db.run(sql, [user.firstname, user.lastname, user.username, hash, user.email], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        }));
    });
}

exports.updateUser = function(user) {
    return new Promise((resolve, reject) => {
        if (!user) {
            reject();
        }
        // costruisce la clausola SET in base alle proprietà di user valorizzate
        const fn_str = (user.firstname) ? `firstname = ?,` : ``;
        const ln_str = (user.lastname) ? `lastname = ?,` : ``;
        const em_str = (user.email) ? `email = ?,` : ``;
        let set_str = fn_str+ln_str+em_str;
        set_str = removeTrailingComma(set_str);

        // costruisce il secondo parametro di db.run in base alle proprietà di user valorizzate
        const param_list = [];
        if (user.firstname) param_list.push(user.firstname);
        if (user.lastname) param_list.push(user.lastname);
        if (user.email) param_list.push(user.email);
        param_list.push(user.id);

        const upd = `UPDATE user SET ${set_str} WHERE id = ?`;
        db.run(upd, param_list, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}
