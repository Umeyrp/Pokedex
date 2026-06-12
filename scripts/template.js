function getPokemonCardsTemplate(pokemon, typesText) {
    return `<article onclick="openPokemonDialog(${pokemon.id})"
                        class="pokemon-card">

                    <div class="name">#${pokemon.id} ${pokemon.name}</div>

                    <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">

                    <div class="type">
                        ${typesText}
                    </div>
                    <div class="card-background" style="background-color: ${colours[pokemon.types[0].type.name]};"></div>
                </article>`;
}

function getNoFoundTemplate() {
    return `<div class="empty-state">
                <img src="./assets/icon/pokeball_icon.png" height="80">
                <h2>No Pokémon found</h2>
                <p>Try a different name or avoid typos.</p>
            </div>`;
}

async function getDialogTemplate(pokemon, typesText, statsHtml, evo) {
    return `<div class="detail-header"
                    style="background:${colours[pokemon.types[0].type.name]}">
                    <h2>#${pokemon.id} ${pokemon.name.toUpperCase()}</h2>
                    <img src="${pokemon.sprites.other["official-artwork"].front_default}" width="160">
                </div>
                <div class="dialog-content">
                    <div class="section-title">Types</div>
                    <p>${typesText}</p>
                    <div class="section-title">Stats</div>
                    <div class="stats">
                        ${statsHtml}
                    </div>
                    <div class="section-title">Evolution</div>
                    <div class="evo-flow">
                        ${await renderEvoTemplate(evo)}
                    </div>
                </div>
                <button data-id="prev-button" onclick="openPreviousDialog(${pokemon.id})">Previous</button> <button data-id="next-button" onclick="openNextDialog(${pokemon.id})">Next</button>`;
}

function getEvoTemplate(pokemon, names, i) {
    return `<div class="evo-item">
                <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">
                <div>${names[i]}</div>
            </div>`;
}

