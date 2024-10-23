"use strict";

export function createAdminButtons() {

    return `<div class="list-group list-group-flush border mt-4 border-4" id="admin-btns">
                <button data-id="new" class="list-group-item list-group-item-action" id="new-btn" data-bs-toggle="modal" data-bs-target="#newMovieModal">
                    <img src="/svg/plus-circle.svg" alt="aggiungi gioco allo store"> Crea un film
                </button>
                <button data-id="clean" class="list-group-item list-group-item-action" id="clean-btn" data-bs-toggle="modal" data-bs-target="#confirmModal">
                    <img src="/svg/calendar2-x.svg" alt="cancella giochi"> Rimuovi 
                </button>
            </div>  `;
}

