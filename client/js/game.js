"use strict";

class Game {


    constructor(gameObj) {
        this.setProperties(gameObj);
        this.id = gameObj.id;
    }

    setProperties(gameObj) {
        this.name = gameObj.name;
        this.category = gameObj.category;
        moment.locale('it');
        if (gameObj.release) {
            this.release = moment(gameObj.release,"YYYY-MM-DD");
        }
        this.image = (gameObj.image) ;
        this.prezzo = (gameObj.prezzo) ;
        this.system = (gameObj.system) ;
    }
}

export default Game;