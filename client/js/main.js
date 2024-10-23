"use strict";

import GameController from "./gameController";

const mainContainer = document.querySelector("main");
const navbar = document.querySelector("#navLinks")

const controller = new GameController(navbar, mainContainer);