"use strict";

import page from "//unpkg.com/page/page.mjs"
import GamesManager from './gameManager.js';
import { createMainContainer } from "./templates/main-template.js";
import { getUser, updUser, doLogin, doLogout, doSignup, checkSession } from './userManager.js';
import Filter from './filters.js';
import { createLoginForm } from './templates/login-template.js';
import { createSignupLink } from './templates/signuplink-template.js';
import { createAlert } from './templates/alert-template.js';
import { noGame } from "./templates/icons-template.js"
import { createUserGameRow } from './templates/usergame-template.js';
import { createAllGameRow } from './templates/allgame-template.js';
import { createNavLinks } from './templates/navbar-template.js';
import { createProfileLinks } from './templates/profilelinks-template.js';
import { createProfileTable } from './templates/profile-template.js';
import { createCategoriesDropDown } from './templates/categories-template.js';
import { createUsersDropDownItems } from './templates/usersdropdownitems-template.js';

class GamesController {
    /**
     * Crea una nuova istanza di GamesController.
     *
     * @param {HTMLElement} navbar - L'elemento della navbar contenente i link alle diverse pagine del sito.
     * @param {HTMLElement} mainContainer - L'elemento container dove verranno visualizzati film e barra laterale.
     */
    constructor(navbar, mainContainer) {
        // Inizializzazione delle variabili di istanza
        /**
         * @type {HTMLElement}
         * @description The container element where games and sidebar will be displayed.
         */
        this.mainContainer = mainContainer;

        /**
         * @type {HTMLElement}
         * @description The navbar element containing links to different site's pages.
         */
        this.navbar = navbar;

        page('/', '/mygames');

        page('/login', () => {
            this.currentPage = 'login';
            this.loginPage()
        });

        page('/allgames', () => {
            checkSession(this.isAdmin)
                .then((user)=> {
                    this.currentPage = 'allgames';
                    if(this.userId) {
                        this.gamesPage();
                    } else {
                        this.initLoggedPage(user);
                        this.gamesPage();
                    }
                })
                .catch((err) => {
                    console.log(err);
                    page.redirect('/login');
                });
        });

        page('/mygames', () => {
            checkSession(this.isAdmin)
                .then((user)=> {
                    this.currentPage = 'mygames';
                    if(this.userId) {
                        this.gamesPage();
                    } else {
                        this.initLoggedPage(user);
                        this.gamesPage();
                    }
                })
                .catch((err) => {
                    console.log(err);
                    page.redirect('/login');
                });
        });

        page('/list/:userId', (ctx) => {
            checkSession(this.isAdmin)
                .then((user)=> {
                    this.currentPage = 'mygames';
                    if(this.userId) {
                        this.currentPage = `list/${ctx.params.userId}`;
                        this.gamesPage();
                    } else {
                        this.initLoggedPage(user);
                        this.gamesPage();
                    }
                })
                .catch((err) => {
                    console.log(err);
                    page.redirect('/login');
                });
        });

        page('/profile', () => {
            checkSession(this.isAdmin)
                .then((user)=> {
                    this.currentPage = 'profile';
                    if(this.userId) {
                        this.profilePage();
                    } else {
                        this.initLoggedPage(user);
                        this.profilePage();
                    }
                })
                .catch((err) => {
                    console.log(err);
                    page.redirect('/login');
                });
        });

        page('/logout', this.logout);

        page('*', this.notfound)

        page();
    }


    /**
     * Inizializza la pagina una volta che l'utente ha effettuato il login, creando tutti gli elementi HTML necessari per la navigazione.
     *
     * @param {Object} user - L'oggetto utente con le informazioni dell'utente corrente.
     */
    initLoggedPage(user) {

        /**
         * @type {number}
         * @description The ID of the current user.
         */
        this.userId = user.id;

        /**
         * @type {boolean}
         * @description true if the current user has administrator's priviledges
         */
        if (user.admin) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
        }

        document.getElementById("signup-logout").innerHTML = '';
        document.getElementById("profile").innerHTML = '';

        this.mainContainer.innerHTML = createMainContainer();
        this.gamesContainer = document.getElementById("game-list");

        document.getElementById("admin-btns").hidden = true;

        this.navbar.innerHTML = '';
        const navLinks = createNavLinks(this.isAdmin);
        this.navbar.insertAdjacentHTML('beforeend', navLinks);
        document.getElementById('search-form').addEventListener('submit', this.onSubmitSearch);
        document.getElementById('search-field').addEventListener('input', this.onInputSearch);

        this.addProfileLink();

        this.sidebar = document.getElementById("left-sidebar");
        this.manageFilters();

        document.getElementById("users-dropdown").innerHTML = '';
        createUsersDropDownItems(this.userId).then((itemslist) => {
            document.getElementById("users-dropdown").innerHTML = itemslist;
        })
    }

    /**
     * Mostra la pagina di login.
     */
    loginPage() {
        try {
            this.navbar.innerHTML = '';

            this.mainContainer.hidden=true;

            document.getElementById("profile").innerHTML = '';
            document.getElementById("profile").innerHTML = createLoginForm();
            document.getElementById("profile").hidden = false;

            document.getElementById('login-form').addEventListener('submit', this.onSubmitLogin);

            document.querySelector("#signup-modal form").addEventListener("submit", this.onSubmitSignup);
            document.getElementById("signup-logout").innerHTML =  createSignupLink();
            const signupModal = document.getElementById("signup-modal");
            // Event listener per resettare il form quando la finestra modale si apre
            if (signupModal) {
                signupModal.addEventListener('show.bs.modal', event => {
                    signupModal.querySelector("form").reset();
                })
            }
        } catch(error) {
            this.showErrorMsg(error);
        }
    }

    /**
     * Mostra la pagina dei film.
     */
    gamesPage() {
        /**
         * @type {GamesManager}
         * @description The game manager instance for handling game-related operations.
         */
        this.gameManager = new GamesManager();
        this.fillGamessContainer();

        this.mainContainer.hidden=false;
        document.getElementById("profile").hidden = true;

        this.navbar.querySelector(".active[data-link]").classList.remove("active");
        const link = (this.currentPage.includes('/')) ? "lists" : this.currentPage;
        const navActiveLink = navLinks.querySelector(`[data-link=${link}]`);
        navActiveLink.classList.add("active");
    }

    /**
     * Mostra la pagina del profilo.
     */
    profilePage() {
        document.querySelector("main").hidden=true;
        document.getElementById("profile").hidden = false;
        getUser(this.userId)
            .then(user => {
                const profileTable = document.getElementById("profile");
                profileTable.innerHTML = createProfileTable(user);
                profileTable.querySelectorAll("a").forEach(el => {
                    el.addEventListener("click", (event) => {
                        const btn = event.currentTarget.dataset.btn;
                        document.getElementById(btn).disabled = !document.getElementById(btn).disabled;
                    })
                });
                profileTable.querySelectorAll("input").forEach(el => {
                    const form = profileTable.querySelector(".needs-validation");
                    el.addEventListener("change", (event) => {
                        if (!form.checkValidity()) {
                            event.preventDefault()
                            event.stopPropagation()
                        } else {

                            const newValue = event.target.value;
                            const userId = this.userId;
                            const propertyName = event.target.id.replace("profile_", "");
                            const user = {
                                id: userId,
                                [propertyName]: newValue
                            };

                            updUser(userId, user)
                                .then();
                            console.log(newValue);
                        }
                        form.classList.add('was-validated')
                    })
                });
            })
            .catch((error) => {
                this.showErrorMsg(error);
            });
    }

    /**
     * Mostra la pagina di gestione dei film.
     */
    manageGamessPage() {
        document.querySelector("main").hidden=true;
        document.getElementById("profile").hidden = false;
        getUser(this.userId)
            .then(user => {
                const profileTable = document.getElementById("profile");
                profileTable.innerHTML = createProfileTable(user);
                profileTable.querySelectorAll("a").forEach(el => {
                    el.addEventListener("click", (event) => {
                        const btn = event.currentTarget.dataset.btn;
                        document.getElementById(btn).disabled = !document.getElementById(btn).disabled;
                    })
                });
                profileTable.querySelectorAll("input").forEach(el => {
                    const form = profileTable.querySelector(".needs-validation");
                    el.addEventListener("change", (event) => {
                        if (!form.checkValidity()) {
                            event.preventDefault()
                            event.stopPropagation()
                        } else {

                            const newValue = event.target.value;
                            const userId = this.userId;
                            const propertyName = event.target.id.replace("profile_", "");
                            const user = {
                                id: userId,
                                [propertyName]: newValue
                            };

                            updUser(userId, user)
                                .then();
                            console.log(newValue);
                        }
                        form.classList.add('was-validated')
                    })
                });
            })
            .catch((error) => {
                this.showErrorMsg(error);
            });
    }

    /**
     * Gestisce la route della pagina non trovata.
     */
    notfound = () => {
        const alertMessage = document.getElementById('alert-message');
        // add an alert message in DOM
        alertMessage.innerHTML = createAlert('danger', "Pagina non trovata");
        setTimeout(() => {
            alertMessage.innerHTML = '';
            page.redirect('/');
        }, 3000);

    }

    /**
     * Aggiunge il link al profilo dell'utente nella barra di navigazione.
     */
    addProfileLink () {
        this.profileLinks = document.getElementById("profileNav");
        this.profileLinks.innerHTML = '';
        this.profileLinks.insertAdjacentHTML('beforeend', createProfileLinks());
    }

    /**
     * Mostra un messaggio di errore all'utente.
     *
     * @param {Error} error - L'errore da visualizzare.
     */
    showErrorMsg = async (error) => {
        const errorMsg = error;
        const alertMessage = document.getElementById('alert-message');
        // add an alert message in DOM
        alertMessage.innerHTML = createAlert('danger', errorMsg);
        // automatically remove the flash message after 3 sec
        setTimeout(() => {
            alertMessage.innerHTML = '';
        }, 3000);
    }

    /**
     * Riempe il container dei film con i dati appropriati in base alla pagina corrente.
     */
    fillGamessContainer = () => {
        if (this.currentPage==='mygames') {
            this.showUserGamess(this.userId);
        } else if (this.currentPage === 'allgames') {
            this.showAllGamess();
        } else {
            const otherUserId = parseInt(this.currentPage.split('/')[1]);
            this.showUserGamess(otherUserId);
        }
    }

    /**
     * Mostra tutti i film.
     */
    showAllGamess() {
        const userId = (this.isAdmin) ? null : this.userId;
        // Crea la wishlist dell'utente e mostrala in tabella
        this.gameManager.getAllGamess(userId)
            .then((games) => {
                this.displayGamess(games);
            }).catch((error) => {
            if (!userId) {
                page.redirect('/login');
            }
            this.showAllGamessTable([]);
            this.showErrorMsg(error);
        });
    }

    /**
     * Displays all games in the games container.
     * @param  {Array} games - The array of game objects to display.
     */
    showAllGamessTable(games) {
        document.getElementById("user-wishlist").innerText="Catalogo";
        let gameTable = this.gamesContainer.querySelector("table > tbody");
        gameTable.innerHTML = '';
        // controlla se la lista di film è definita e se contiene almeno un elemento
        if (games && games.length) {
            document.getElementById("game-list").classList.add("game-list");

            games.forEach((game) => {
                gameTable.insertAdjacentHTML("beforeend",createAllGameRow(game, this.isAdmin)); // create table row with a js template
                // remove add button if user is admin
                if (this.isAdmin) {
                    // add behaviors to table row's controls
                    document.getElementById(`title_${game.id}`).addEventListener('change', (e) => {
                        game.title = e.target.value;
                        this.onChangeGames(game);
                    })
                    document.getElementById(`deadline_${game.id}`).addEventListener('change', (e) => {
                        game.deadline = e.target.value;
                        this.onChangeGames(game);
                    })
                    document.getElementById(`dlt_${game.id}`).addEventListener('click', () => {
                        this.onClickDelete(game);
                    })
                } else {
                    // add behaviors to table row's controls
                    document.getElementById(`add_${game.id}`).addEventListener('click', () => {
                        this.onClickAdd(game);
                    })
                }

            });
        }
        else {
            document.getElementById("game-list").classList.remove("game-list");
            gameTable.innerHTML = noGame();
        }
    }

    showUserGamess(userId) {
        // Crea la wishlist dell'utente e mostrala in tabella
        this.gameManager.getUserGamess(userId)
            .then((games) => {
                if(userId!= this.userId && !this.isAdmin) {
                    this.gameManager.games = games.filter ((m)=> m.visibility);
                }

                document.getElementById("admin-btns").hidden = true;

                // abilita i pulsanti del menu di sinistra che servono solo per i film nella lista degli utenti
                this.sidebar.querySelectorAll('div > button[data-group="wishlist"]').forEach( el_a => {
                    el_a.disabled = false;
                });
                // Mostra i film all'avvio dell'applicazione
                this.showUserGamessTable(this.gameManager.games,userId);
                // Crea e mostra l'elenco delle categorie nella barra laterale, ognuno con un event listener
                this.fillCategoriesMenu();


            }).catch((error) => {
            if (!userId) {
                page.redirect('/login');
            }
            this.showUserGamessTable([],this.userId);
            this.showErrorMsg(error);
        });
    }

    /**
     * Displays user's games in the games container.
     * @param  {Array} games - The array of game objects to display.
     */
    showUserGamessTable(games, userId) {
        if (userId === this.userId) {
            getUser(this.userId).then((user)=>{
                document.getElementById("user-wishlist").innerText = `La tua lista dei desideri (${user.username})`
            });
        } else {
            const otherUserId = parseInt(this.currentPage.split('/')[1]);
            getUser(otherUserId).then((user)=>{
                document.getElementById("user-wishlist").innerText = `La lista dei desideri di ${user.username}`
            });
        }
        let gameTable = this.gamesContainer.querySelector("table > tbody");
        gameTable.innerHTML = '';
        // controlla se la lista di film è definita e se contiene almeno un elemento
        if (games && games.length) {
            document.getElementById("game-list").classList.add("game-list");

            games.forEach((game) => {
                gameTable.insertAdjacentHTML("beforeend",createUserGameRow(game,this.currentPage)); // create table row with a js template

                if (userId === this.userId) {
                    // add behaviors to table row's controls
                    gameTable.querySelector(`input#viewed_${game.id}`).addEventListener('change',  (e) => {
                        this.onChangeViewed(e,game);
                    });
                    document.getElementById(`unm_${game.id}`).addEventListener('click', (e) => {
                        this.onClickUnmissable(e,game);
                    })
                    document.getElementById(`vis_${game.id}`).addEventListener('click', (e) => {
                        this.onClickVisibility(e,game);
                    })
                    document.getElementById(`dlt_${game.id}`).addEventListener('click', () => {
                        this.onClickRemove(game);
                    })
                } else if (!this.isAdmin) {
                    // add behaviors to table row's controls
                    document.getElementById(`add_${game.id}`).addEventListener('click', () => {
                        this.onClickAdd(game);
                    })
                } else {
                    document.getElementById(`add_${game.id}`).remove();
                }
            });
        } else {
            document.getElementById("game-list").classList.remove("game-list");
            gameTable.innerHTML = noGame();
        }
    }

    /**
     * Adds click event listeners to filter elements.
     */
    manageFilters () {
        this.sidebar.querySelectorAll('div > button').forEach( el_a => {
            el_a.disabled = false;
            el_a.addEventListener('click', e => {
                this.onClickFilter(e);
            });
        });
        this.sidebar.querySelector('.active').classList.remove('active');
        this.sidebar.querySelector('button[data-id="all"]').classList.add('active');
    }

    /**
     * Event listener for the submission of the login form. Handle the login.
     * @param {*} event
     */
    onSubmitLogin = (event) => {
        event.preventDefault();
        const form = event.target;

        if(form.checkValidity()) {
            doLogin(form.username.value, form.password.value)
                .then((user) => {

                    this.initLoggedPage(user);

                    // welcome the user
                    const alertMessage = document.getElementById('alert-message');
                    alertMessage.innerHTML = createAlert('success', `Welcome ${user.username}!`);
                    // automatically remove the flash message after 3 sec
                    setTimeout(() => {
                        alertMessage.innerHTML = '';
                    }, 3000);
                    if (this.isAdmin) {
                        page.redirect('/allgames');
                    } else {
                        page.redirect('/mygames');
                    }
                })
                .catch((error) => {
                    this.showErrorMsg(error);
                });
        }
    }

    /**
     * Gestisce l'evento di input per l'autocomplete.
     * Invoca l'API /autocomplete per ottenere suggerimenti basati sull'input corrente.
     *
     * @param {Event} event - L'evento di input.
     */
    onInputSearch = async (event) => {
        const query = event.target.value;

        if (query.length < 1) {
            this.clearSuggestions();
            return;
        }

        const apiUrl = `/autocomplete?title=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const suggestions = await response.json();
            this.showSuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching autocomplete results:', error);
        }
    }

    /**
     * Mostra i suggerimenti di autocomplete aggiornando il datalist.
     *
     * @param {string[]} suggestions - Un array di suggerimenti per l'autocomplete.
     */
    showSuggestions(suggestions) {
        const dataList = document.getElementById('suggestions');
        dataList.innerHTML = '';

        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            dataList.appendChild(option);
        });
    }

    /**
     * Pulisce i suggerimenti di autocomplete dal datalist.
     */
    clearSuggestions() {
        const dataList = document.getElementById('suggestions');
        dataList.innerHTML = '';
    }

    /**
     * Gestisce l'evento di submit del form di ricerca.
     * Invoca l'API /search per cercare i film basati sull'input dell'utente.
     *
     * @param {Event} event - L'evento di submit.
     */
    onSubmitSearch = async (event) => {
        event.preventDefault();

        const searchField = document.getElementById('search-field');
        const query = searchField.value;

        const apiUrl = `/search?title=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const results = await response.json();
            document.getElementById("filter-title").innerText='Risultati della ricerca'
            this.displayGamess(results);
            document.getElementById("search-form").reset();
        } catch (error) {
            console.error('Error fetching search results:', error);
            this.showAllGamessTable([]);
            this.showErrorMsg(error);
            document.getElementById("search-form").reset();
        }
    };

    /**
     * Mostra i film ottenuti dalla ricerca.
     *
     * @param {Object[]} games - Un array di oggetti film.
     */
    displayGamess = (games) => {
        // Mostra i film all'avvio dell'applicazione
        this.showAllGamessTable(games);

        // Disabilita i pulsanti del menu di sinistra che servono solo per i film nella lista degli utenti
        this.sidebar.querySelectorAll('div > button[data-group="wishlist"]').forEach(el_a => {
            el_a.disabled = true;
        });

        // Crea e mostra l'elenco delle categorie nella barra laterale, ognuno con un event listener
        this.fillCategoriesMenu();

        // Mostra i pulsanti riservati all'amministratore
        if (this.isAdmin) {
            document.getElementById("admin-btns").hidden = false;
            this.initModals();
        } else {
            document.getElementById("admin-btns").hidden = true;
        }
    }

    /**
     * Gestisce l'evento di submit del form di registrazione.
     * Invoca l'API per registrare un nuovo utente.
     *
     * @param {Event} event - L'evento di submit.
     */
    onSubmitSignup = async (event) => {
        event.preventDefault();
        const form = event.target;

        if (form.checkValidity()) {
            try {
                const userObj = {
                    firstname: form.firstname.value,
                    lastname: form.lastname.value,
                    username: form.newusername.value,
                    password: form.newpassword.value,
                    email: form.email.value
                }
                const user = await doSignup(userObj);

                // Mostra un messaggio di benvenuto all'utente
                const alertMessage = document.getElementById('alert-message');
                alertMessage.innerHTML = createAlert('success', `${user.username}'s registration complete!`);
                // Rimuove automaticamente il messaggio flash dopo 3 secondi
                setTimeout(() => {
                    alertMessage.innerHTML = '';
                }, 3000);

                document.querySelector("#signup-modal .btn-close").click();
                form.classList.remove('was-validated');
                page.redirect('/login');
            } catch (error) {
                this.showErrorMsg(error);
            }
        }
        form.classList.add('was-validated');
    }



    /**
     * Handles the change event from the game's input controls
     * @param  {Object} game - The game to be update d
     */
    onChangeGames = (game) => {
        this.gameManager.updGames(game)
            .then(() => {
                page.redirect(`/${this.currentPage}`)
            })
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the click event that leads to permanent removal of a game in the catalogue
     * @param  {Object} game - The game to be update removed
     */
    onClickDelete = (game) => {
        this.gameManager.dltGames(game)
            .then(() => {
                this.showAllGamess();
                this.triggerClickActiveFilter();
            })
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the change event for the viewed checkbox.
     * @param  {Event} event - The change event object.
     * @param  {Object} game - The game object to update.
     */
    onChangeViewed = async (event,game) => {
        game.viewed = event.target.checked;
        this.gameManager.updUserGames(this.userId, game)
            .then()
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the change event for the unmissable button
     * @param  {Event} event - The change event object.
     * @param  {Object} game - The game object to update.
     */
    onClickUnmissable = (event,game) => {
        game.unmissable = !Boolean(event.currentTarget.dataset.unmissable); // flip the boolean value of the data-unmissable attribute
        this.gameManager.updUserGames(this.userId, game)
            .then(() => this.triggerClickActiveFilter())
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the change event for the visibility button
     * @param  {Event} event - The change event object.
     * @param  {Object} game - The game object to update.
     */
    onClickVisibility = (event,game) => {
        game.visibility = !Boolean(event.currentTarget.dataset.visibility); // flip the boolean value of the data-unmissable attribute
        this.gameManager.updUserGames(this.userId, game)
            .then(() => this.triggerClickActiveFilter())
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the delete button click event on user's wishlist.
     * @param  {Object} game - The game to be removed from the wishlist.
     */
    onClickRemove = (game) => {
        this.gameManager.dltFromUserGamess(this.userId,game)
            .then(() => {
                this.showUserGamess(this.userId);
                this.triggerClickActiveFilter();
            })
            .catch((error) => { this.showErrorMsg(error) } );
    }

    /**
     * Handles the add button click event.
     * @param  {Object} game - The game to add in the wishlist.
     */
    onClickAdd = (game) => {
        this.gameManager.addUserGames(this.userId,game)
            .then(() => {
                page.redirect(`/${this.currentPage}`)
            })
            .catch((error) => { this.showErrorMsg(error) } );
    }


    /**
     * Handles the filter click event.
     * @param  {Event} event - The click event object.
     */
    onClickFilter = (event) => {
        const el = event.target;
        // Ottieni il tipo di filtro dalla proprietà `data-id` dell'elemento
        const filterType = el.dataset.id;
        // Rimuovi la classe 'active' dal link attivo e aggiungila al link selezionato
        this.sidebar.querySelector('.active').classList.remove('active');
        el.classList.add('active');
        // Applica il filtro e ottieni i film filtrati
        let filter = new Filter(this.gameManager, filterType);
        let games = filter.apply();
        // Aggiorna l'intestazione del filtro con il tipo selezionato
        let header = document.getElementById("filter-title");
        header.innerText = this.sidebar.querySelector("button.active").innerText;
        // Mostra i film filtrati
        if (this.currentPage === 'mygames') {
            this.showUserGamessTable(games, this.userId);
        } else if (this.currentPage === 'allgames') {
            this.showAllGamessTable(games);
        } else {
            const otherUserId = parseInt(this.currentPage.split('/')[1]);
            this.showUserGamessTable(games, otherUserId);
        }
    }

    /**
     * Triggers a click event on the currently active filter.
     */
    triggerClickActiveFilter() {
        const event = new Event('click');
        const activeFilter = this.sidebar.querySelector("button.active");
        activeFilter.dispatchEvent(event);
    }

    /**
     * Populates the dropdown menu with the list of game categories.
     * Adds an event listener to each category to handle the click event.
     */
    fillCategoriesMenu() {
        let dd_menu = this.sidebar.querySelector(".dropdown-menu");
        let categories = [];
        if (this.currentPage === 'allgames') {
            categories = GamesManager.categories;
        } else {
            categories = this.gameManager.getUserCategories();
        }

        dd_menu.innerHTML = createCategoriesDropDown(categories);
        // Add event listeners to handle category clicks in the dropdown menu
        this.addFiltersByCategory();
    }

    /**
     * Adds event listeners to each category in the dropdown menu.
     * Handles the click event to filter games by the selected category.
     */
    addFiltersByCategory() {
        this.sidebar.querySelectorAll('.dropdown-menu button').forEach(cat => {
            cat.addEventListener('click', e => {
                const el = e.target;
                // Get the category from the element's data-id property
                const category = el.dataset.id;
                // Remove the 'active' class from the currently active main menu link
                this.sidebar.querySelectorAll('.active').forEach(
                    el => el.classList.remove('active')
                );
                // Add the 'active' class to the "Categories" main menu link and the clicked category
                document.getElementById("category").classList.add('active');
                el.classList.add('active');
                // Apply the category filter and get the filtered games
                let filter = new Filter(this.gameManager, 'category');
                let games = filter.apply(category);
                // Update the filter header with the selected category
                let header = document.getElementById("filter-title");
                header.innerText = `Categoria: ${el.innerText}`;
                // Display the filtered games
                if (this.currentPage === 'mygames') {
                    this.showUserGamessTable(games, this.userId);
                } else if (this.currentPage === 'allgames') {
                    this.showAllGamessTable(games);
                } else {
                    const otherUserId = parseInt(this.currentPage.split('/')[1]);
                    this.showUserGamessTable(games, otherUserId);
                }
                // Update the active category state in the sidebar
                this.updateActiveCategory(category);
            });
        });
    }

    /**
     * Updates the active category in the sidebar.
     *
     * @param {string} filterCat - The category to be marked as active.
     */
    updateActiveCategory(filterCat) {
        let dd_menu = this.sidebar.querySelector(".dropdown-menu");
        dd_menu.querySelector('button.active').classList.remove('active');
        dd_menu.querySelector(`button[data-id="${filterCat}"`).classList.add('active');
    }

    initModals() {
        const newGamesModal = document.getElementById("newGamesModal");
        const cleanModal = document.getElementById("confirmModal");

        newGamesModal.addEventListener('show.bs.modal', event => {
            const form = newGamesModal.querySelector("form");
            form.classList.remove('was-validated');
            form.reset();

        });

        newGamesModal.querySelector("#film-category").innerHTML = '';
        GamesManager.categories.forEach(cat => {
            let option = document.createElement('option');
            option.setAttribute('value', cat);
            option.innerText = cat;
            newGamesModal.querySelector("#film-category").appendChild(option);
        });

        const newGamesBtn = newGamesModal.querySelector("#new-game-btn");
        newGamesBtn.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            this.onSubmitNewGames(event,newGamesModal);
        });
        const confirmBtn = cleanModal.querySelector("#confirm-btn");
        confirmBtn.addEventListener("click", event => {
            this.onClickCleaning(cleanModal);
        });
    }

    onSubmitNewGames = (event, newGamesModal) => {
        const form = newGamesModal.querySelector(".needs-validation");
        form.classList.add('was-validated');

        if (form.checkValidity()) {
            const game = {
                title: newGamesModal.querySelector("#film-title").value,
                deadline: newGamesModal.querySelector("#film-deadline").value
            };
            const opzioni = newGamesModal.querySelector("#film-category");
            game.category = Array.from(opzioni.selectedOptions).map(op => op.value);

            this.gameManager.addGames(game)
                .then((id) => {
                    console.log('new game id',id);
                    newGamesModal.querySelector("#close-newGamesModal").click();
                    this.triggerClickActiveFilter();
                })
                .catch(error => console.log('Failed to add data on server: ', error));
        }

    }

    onClickCleaning = (cleanModal) => {
        const today = moment();

        const tbd = this.gameManager.games.filter(game => today.isAfter(game.deadline));
        const promises = tbd.map(game => this.gameManager.dltGames(game));
        Promise.all(promises).then((values) => {
            console.log('promises kept',values);
            cleanModal.querySelector("#close-confirmModal").click();
            this.triggerClickActiveFilter();
        })
    }

    /**
     * Perform the logout
     */
    logout = async () => {
        await doLogout();
        this.userId = null;
        page.redirect('/login');
    }
}

export default GamesController;