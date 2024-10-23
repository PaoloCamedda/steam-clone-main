"use strict";

const moment = require('moment');

class Game {


    constructor (id, name, prezzo, image, relese=null, category=null, system,posseduti =false,whis=false) {
        // Costruttore della classe Game per creare istanze
        this.game_id = id;
        this.name = name;
        this.prezzo = prezzo;
        this.image = image;
        this.categoryList = [];
        this.systemList = [];
        this.posseduti = posseduti;
        this.whis = whis;


        moment.locale('it');

        if (relese)
            this.relese = moment(relese);


        if (system && typeof system === "string") {
            this.systemList.push(category);
        }



        if (category && typeof category === "string") {
            this.categoryList.push(category);
        }


        if (category && Array.isArray(category)) {

            this.categoryList = category.filter((item, index) => category.indexOf(item) === index);
        }
    }
}

module.exports = Game;