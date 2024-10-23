"use strict";


const db = require('./db');
const GameManager = require('../gameManagerServer');


function newGame(row) {
    const game = Object.assign(row);
    game.category = (row.category) ? row.category.split(',') : null;
    game.system = (row.system) ? row.system.split(',') : null;
    return game;
}

exports.getGames = function () {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM game";
        db.all(sql, (err, rows) => {
            if (err) {
                reject({status: 500, msg: err.message});
            } else {
                if (rows.length) {
                    const games = rows.map(row => newGame(row) );
                    console.log(games);
                    resolve(games);
                } else {
                    reject({status: 404, msg: "Errore: 0 giochi caricati nel database"})
                }
            }
        });
    })
}


exports.getGame = function (gameId) {
    return new Promise ((resolve, reject) => {
        const sql = "SELECT * FROM game WHERE game.id=?";
        db.get(sql, [gameId], (err, row) => {
            if (err) {
                reject({status:500, msg: err.message});
            } else {
                if (row) {
                    const game = newGame(row);
                    console.log(game);
                    resolve(game);
                } else {
                    reject({status: 404, msg: `Errore: nessun game con id ${gameId} nel database`});
                }
            }
        });
    });
}


exports.addGame = function (game) {
    return new Promise((resolve, reject) => {
        const name = game.name;
        const prezzo = game.prezzo;
        const image = game.image;
        const relese = game.relese ? game.relese.format("YYYY-MM-DD") : null; // Formattazione data
        let categoryList = game.categoryList || [];
        let systemList = game.systemList || [];

        // Filtra le categorie e i sistemi solo se sono parte delle liste predefinite
        if (categoryList.length) {
            categoryList = categoryList.filter(c => GameManager.categories.includes(c));
        }

        if (systemList.length) {
            systemList = systemList.filter(s => GameManager.systems.includes(s));
        }

        // Convertiamo le liste in stringa (ad esempio, per memorizzarle come CSV nel DB)
        const categories = categoryList.toString();
        const systems = systemList.toString();

        const ins = `
            INSERT INTO game (name, prezzo, image, relese, category, system) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(ins, [name, uscita, category, os, imag, prezo], function (err) {
            if (err) {
                console.log(err);
                reject({ status: 500, msg: err.message });
            } else {
                resolve(this.lastID); // Restituisce l'ID dell'ultimo gioco inserito
            }
        });
    });
}


/**
 * Delete a game.
 * @param {string} gameId - Game's unique ID.
 * @returns {Promise} - Promise object representing the deletion operation.
 */
exports.deleteGame = function (gameId) {
    return new Promise ((resolve, reject) => {
        const del = "DELETE FROM game WHERE id=?";
        db.run(del,[gameId], (err) => {
            if (err) {
                console.log(err);
                reject({status: 500, msg: err.message});
            } else {
                resolve();
            }
        });
    });
}


exports.updateGame = function (gameId, gameInfo) {
    return new Promise((resolve, reject) => {
        // Recupera il gioco esistente
        const sql = "SELECT * FROM game WHERE id = ?";
        db.get(sql, [gameId], (err, row) => {
            if (err) {
                reject({status: 500, msg: err.message});
            } else {
                if (row) {
                    // Crea un oggetto Game basato sui dati recuperati
                    const game = new Game(row.id, row.name, row.prezzo, row.image, row.relese, row.category, row.system);

                    // Se non sono stati passati nuovi valori, usa quelli attuali
                    const name = gameInfo.name || game.name;
                    const prezzo = gameInfo.prezzo || game.prezzo;
                    const image = gameInfo.image || game.image;
                    const relese = gameInfo.relese || game.relese;
                    let categoryList = gameInfo.categoryList || game.categoryList;
                    let systemList = gameInfo.systemList || game.systemList;

                    // Filtra categorie e sistemi solo se sono validi
                    if (categoryList.length) {
                        categoryList = categoryList.filter(c => GameManager.categories.includes(c));
                    }
                    if (systemList.length) {
                        systemList = systemList.filter(s => GameManager.systems.includes(s));
                    }

                    const categories = categoryList.toString();
                    const systems = systemList.toString();

                    // Esegui l'aggiornamento nel database
                    const upd = `
                        UPDATE game 
                        SET name = ?, prezzo = ?, image = ?, relese = ?, category = ?, system = ?
                        WHERE id = ?
                    `;

                    db.run(upd, [name, prezzo, image, relese, categories, systems, gameId], (err) => {
                        if (err) {
                            console.log(err);
                            reject({status: 500, msg: err.message});
                        } else {
                            resolve();
                        }
                    });
                } else {
                    reject({status: 404, msg: `Errore: nessun game con id ${gameId} nel database`});
                }
            }
        });
    });


}