"use strict";


const Game = require("./gameServer");

class GameManager {

    static categories = ['fps', 'horror', 'gdr',
        'survivle', 'openworld', 'strategico','puzzle','corse','azione'];


    constructor () {
        this.games = [];
    }

    createGameWishList(games) {
        games.forEach(m => this.newGame(m.game_id, m.name, m.prezzo,
            m.image, m.relese, m.category, m.system,m.posseduri,m.whis));
    }

    // id, name, prezzo, image, relese=null, category=null, system)
    newGame(id, name, prezzo,image, relese=null, category=null, system=null,posseduti=false,whis=false) {
        this.games.push((id, name, prezzo,image, relese, category, system,posseduti,whis));
    }
}

// esportazione necessaria della classe perché la si possa usare anche altrove
module.exports = GameManager;
