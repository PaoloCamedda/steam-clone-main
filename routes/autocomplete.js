"use strict";

const express = require('express');
const { query, validationResult } = require('express-validator');
const router = express.Router();
const autocompleteDao = require('../model/autocomplete-dao');

router.get('/', [
    query('name').isString().withMessage('Name deve essere una stringa')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.query;

    try {
        const results = await autocompleteDao.autocomplete(name);
        res.json(results);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;