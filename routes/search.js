const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();
const gameDao = require('../model/search-dao');

router.get('/', [
    query('name').optional().isString().withMessage('Name must be a string'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('image').optional().isString().withMessage('System must be a string'),
    query('system').optional().isString().withMessage('System must be a string'),
    query('release').optional().isISO8601().withMessage('Release must be a valid date in ISO8601 format'),
    query('prezzo').optional().isFloat().withMessage('Price must be a valid number') // Aggiunto per cercare per prezzo
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, system } = req.query;

    try {
        const results = await gameDao.searchGames({ name, category,system}); // Assicurati che il tuo DAO abbia questa funzione
        res.json(results);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;