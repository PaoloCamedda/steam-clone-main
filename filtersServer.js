"use strict";
const moment = require('moment');


class Filter {

    constructor(gameManager, filterType) {
        this.gameManager = gameManager;
        this.filterType = filterType;
    }


    apply(category = null) {
        switch (this.filterType) {
            case 'all':
                return this.gameManager.games;
            case 'under10':
                return this.getGamesUnder10();
            case 'under5':
                return this.getGamesUnder5();
            case 'nonposseduti':
                return this.getUnownedGames();
            case 'news':
                return this.getGameNew();
            case 'category':
                if (category == 'all-categories') {
                    return this.gameManager.games;
                } else {
                    return this.getGameListByCategory(category);
                }
            default:
                return this.gameManager.games;
        }
    }

    /**
     * Gets the list of games
     * @returns {Array}
     */
    getGameNew() {
        return this.gameManager.games.filter(m => {
            if (m.release) {
                return moment(m.release).isSame(moment(), 'month');
            }
            return false;
        });
    }


    getGamesUnder5() {
        return this.gameManager.games.filter(game => game.prezzo < 5);
    }


    getGamesUnder10() {
        return this.gameManager.games.filter(game => game.prezzo < 10);
    }


    getGameListByCategory(category) {
        return this.gameManager.games.filter(m => m.categoryList.includes(category));
    }

    getUnownedGames(games) {
        return games.filter(game => !game.posseduti);
    }


}

module.exports = Filter;