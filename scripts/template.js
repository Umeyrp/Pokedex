function getPokemonCardsTemplate(pokemon) {
    return `<button data-id="card" class="pokemon-card" onclick="openPokemonDialog(${pokemon.id})">
                <div class="name">#${pokemon.id} ${pokemon.name}</div>
                <img data-id="card-image" src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">
                <div class="type">
                    ${getPokemonTypeTemplate(pokemon)}
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

async function getDialogTemplate(pokemon, evo) {
    return `<div class="pokedemon-dialog" style="--type:${colours[pokemon.types[0].type.name]};">
                <div class="pokedemon-dialog-header">
                    <button class="close-btn" onclick="closeModal()">✕</button>
                    <div class="pokedemon-dialog-title">
                        <span class="pokemon-id">#${pokemon.id}</span>
                        <h1>${pokemon.name}</h1>
                        <div class="pokemon-types">
                            ${getPokemonTypeTemplateDialog(pokemon)}
                        </div>
                    </div>
                    <div class="image-wrap">
                        <img src="${pokemon.sprites.other["official-artwork"].front_default}">
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
                                ${await renderEvoTemplate(evo)}
                            </div>
                        </section>
                    </div>
                </div>
                <button class="nav left" onclick="openPreviousDialog(${pokemon.id})">‹</button>
                <button class="nav right" onclick="openNextDialog(${pokemon.id})">›</button>
            </div>`;
}

function getEvoTemplate(pokemon, names, i) {
    return `<div class="evo-item">
                <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">
                <div>${names[i]}</div>
            </div>`;
}

function getPokemonTypeTemplate(pokemon) {
    let html = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        html += `<div class="type-badge" style="background-color:${colours[pokemon.types[i].type.name]}">
                            <p>${pokemon.types[i].type.name.toUpperCase()}</p>
                        </div>`;
    }
    return html;
}

function getPokemonTypeTemplateDialog(pokemon) {
    let html = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        html += `<p class="type-badge-dialog" style="background-color:${colours[pokemon.types[i].type.name]}">${pokemon.types[i].type.name.toUpperCase()}</p>`;
    }
    return html;
}