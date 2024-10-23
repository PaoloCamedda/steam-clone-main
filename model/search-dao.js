"use strict";
const db = require('./db');

function searchGames({ name, category, system }) {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM game WHERE 1=1'; // Aggiunto WHERE 1=1 per semplificare l'aggiunta di filtri
        const queryParams = [];

        // Filtro per nome
        if (name) {
            query += ' AND name LIKE ?';
            queryParams.push(`%${name}%`);
        }

        // Filtro per categoria
        if (category) {
            const categories = category.split(',').map(cat => cat.trim());
            const placeholders = categories.map(() => 'category LIKE ?').join(' OR ');
            query += ` AND (${placeholders})`;
            queryParams.push(...categories.map(cat => `%${cat}%`));
        }

        // Filtro per sistema operativo
        if (system) {
            query += ' AND so LIKE ?'; // Utilizza "so" per il database
            queryParams.push(`%${system}%`);
        }

        db.all(query, queryParams, (err, rows) => {
            if (err) {
                return reject(err);
            } else {
                if (rows.length) {
                    const games = rows.map(row => {
                        row.category = (row.category) ? row.category.split(',') : null; // Gestione delle categorie
                        return row;
                    });
                    console.log(games); // Per debug
                    resolve(games);
                } else {
                    resolve([]); // Restituisci un array vuoto se non ci sono risultati
                }
            }
        });
    });
}

module.exports = {searchGames};
