"use strict";

var express = require('express');
const {check, validationResult} = require('express-validator'); // validation middleware
var router = express.Router();

const gamesdao = require('../model/games-dao');


router.get('/', (req,res) => {
    const categories = GameManager.categories;
    res.json({categories:categories});
});

router.get('/:gameId', (req,res) => {
    gamesdao.getGame(req.params.gameId)
        .then((game) => res.json({id:game.id, category: game.category}))
        .catch((err) => res.status(err.status).json(err.msg));
});


module.exports = router;