function getPokemonCardsTemplate(pokemon, index) {
    return `<button data-id="card" class="pokemon-card" onclick="openPokemonDialog(${pokemon.id},${index})">
                <div class="name">#${pokemon.id} ${pokemon.name}</div>
                <img data-id="card-image" src="${(!pokemon.sprites.other["official-artwork"].front_default) ? pokemon.sprites.other["home"].front_default : pokemon.sprites.other["official-artwork"].front_default}" height="80">
                <div class="type">
                    ${renderPokemonTypeTemplate(pokemon)}
                </div>
                <div class="card-background" style="background-color: ${colours[pokemon.types[0].type.name]};"></div>
            </button>`;
}

function getNoFoundTemplate() {
    return `<div class="empty-state">
                <img src="./assets/icon/pokeball_icon.png" height="80">
                <h2>No Pokémon found</h2>
                <p data-id="not-found">Try a different name or avoid typos.</p>
            </div>`;
}

async function getDialogTemplate(pokemon, evo, index) {
    return `<div class="pokedemon-dialog" style="--type:${colours[pokemon.types[0].type.name]};">
                <div class="pokedemon-dialog-header">
                    <button class="close-btn" onclick="closeModal()">✕</button>
                    <div class="pokedemon-dialog-title">
                        <span class="pokemon-id">#${pokemon.id}</span>
                        <h1>${pokemon.name}</h1>
                        <div class="pokemon-types">
                            ${renderPokemonTypeTemplateDialog(pokemon)}
                        </div>
                    </div>
                    <div class="image-wrap">
                        <img src="${(!pokemon.sprites.other["showdown"].front_default) ? ((!pokemon.sprites.other["official-artwork"].front_default) ? pokemon.sprites.other["home"].front_default : pokemon.sprites.other["official-artwork"].front_default) : pokemon.sprites.other["showdown"].front_default}">
                    </div>
                </div>
                <div class="pokedemon-dialog-body">
                    <div class="tab-buttons">
                        <button class="tab active" onclick="switchTab('stats')">Stats</button>
                        <button class="tab" onclick="switchTab('evo')">Evolution</button>
                    </div>
                    <div class="tab-content">
                        <section id="stats" class="tab-panel active">
                            <div class="stats-card">
                                <canvas id="myChart"></canvas>
                            </div>
                        </section>
                        <section id="evo" class="tab-panel">
                            <div class="evo-card">
                                ${await renderEvoTemplate(evo, pokemon.id)}
                            </div>
                        </section>
                    </div>
                </div>
                <button class="nav left" onclick="openPreviousDialog(${index})">‹</button>
                <button class="nav right" onclick="openNextDialog(${index})">›</button>
            </div>`;
}

function getEvoTemplate(pokemon, pokeId, currentIndex) {
    return `<div class="evo-item ${(pokeId == pokemon.id) ? "evo-active" : ""}" onclick="openPokemonDialog(${pokemon.id}, ${currentIndex})">
                <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">
                <p>${pokemon.name.toUpperCase()}</p>
            </div>`;
}

function getPokemonTypeTemplate(pokemon, i) {
    return `<div class="type-badge" style="background-color:${colours[pokemon.types[i].type.name]}">
                            <p>${pokemon.types[i].type.name.toUpperCase()}</p>
                        </div>`;
}

function getPokemonTypeTemplateDialog(pokemon, i) {
    return `<p class="type-badge-dialog" style="background-color:${colours[pokemon.types[i].type.name]}">${pokemon.types[i].type.name.toUpperCase()}</p>`;
}