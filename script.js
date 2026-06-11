let allPokemon = [];
let lastFetchedPokemon = [];
let pokeIDCounter_start = 1;
let pokeIDCounter_end = 20;

const dialogRef = document.getElementById('pokeinfo');
const contentRef = document.getElementById('content');

async function init() {
    if (!getPokemonFromLocalStorage()) await fetchPokemons(), savePokemonInLocalStorage();;
    renderPokemon(allPokemon);
}

async function fetchPokemons() {
    startLoading();
    const promises = [];
    try {
        for (let id = pokeIDCounter_start; id <= pokeIDCounter_end; id++) {
            promises.push(fetchPokemonById(id));
        }
        const fetchedPokemon = await Promise.all(promises);
        allPokemon.push(...fetchedPokemon);
        lastFetchedPokemon = fetchedPokemon;
    } catch (error) {
        console.error('Loading error:', error);
    }
    finishLoading();
}

function savePokemonInLocalStorage() {
    if (!getPokemonFromLocalStorage()) {
        localStorage.setItem("pokemon", JSON.stringify(allPokemon));
    }
}

function getPokemonFromLocalStorage() {
    const localPokemon = JSON.parse(localStorage.getItem("pokemon"));
    if (localPokemon && localPokemon.length > 0) {
        allPokemon = localPokemon;
        return true;
    }
}

function finishLoading() {
    hideLoadingFeedback();
    showLoadMoreButton();
}

function startLoading() {
    showLoadingFeedback();
    hideLoadMoreButton();
}

async function fetchMorePokemons() {
    pokeIDCounter_start += 20;
    pokeIDCounter_end += 20;
    await fetchPokemons();
    appendFetchedPokemon(lastFetchedPokemon);
}

function appendFetchedPokemon(pokemonArray) {
    contentRef.innerHTML += getPokemonTemplate(pokemonArray);
    showLoadMoreButton();
}

function searchPokemon() {
    const search_input = document.getElementById('search_pokemon_input').value.toLowerCase();
    if (search_input.length < 3 || search_input == "") return renderPokemon(allPokemon), showLoadMoreButton();
    startLoading();
    const searchedPokemon = allPokemon.filter(pokemon => pokemon.name.includes(search_input));
    if (searchedPokemon.length === 0) {
        showNoFoundMessage();
    } else {
        renderPokemon(searchedPokemon);
    }
    hideLoadMoreButton();
    hideLoadingFeedback();
}

function showNoFoundMessage() {
    contentRef.innerHTML = `<div class="empty-state">
                                <img src="./assets/icon/pokeball_icon.png" height="80">
                                <h2>Kein Pokémon gefunden</h2>
                                <p>Versuch einen anderen Namen oder Tippfehler zu vermeiden.</p>
                            </div>`;
}

function renderPokemon(pokemonArray) {
    contentRef.innerHTML = getPokemonTemplate(pokemonArray);
    finishLoading();
}
function getPokemonTemplate(pokemonArray) {
    let html = "";
    pokemonArray.forEach(pokemon => {
        let typesText = "";
        for (let i = 0; i < pokemon.types.length; i++) {
            typesText += pokemon.types[i].type.name;

            if (i < pokemon.types.length - 1) {
                typesText += " / ";
            }
        }
        html += `<article onclick="showPokeDetails(${pokemon.id})"
                        class="pokemon_card"
                        style="background-color: ${colours[pokemon.types[0].type.name]};">

                    <div class="name">#${pokemon.id} ${pokemon.name}</div>

                    <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">

                    <div class="type">
                        ${typesText}
                    </div>
                </article>`;
    });
    return html;
}

function hideLoadMoreButton() {
    document.getElementById('load_more').disabled = true;
    document.getElementById('load_more').style.display = "none";
}

function showLoadMoreButton() {
    document.getElementById('load_more').disabled = false;
    document.getElementById('load_more').style.display = "block";
}

function showLoadingFeedback() {
    document.getElementById('loading').hidden = false;
}

function hideLoadingFeedback() {
    document.getElementById('loading').hidden = true;
}

function showModal() {
    dialogRef.showModal();
}

async function showPokeDetails(pokeId) {
    const pokemon = getPokemonById(pokeId);
    const evo = await fetchEvoChain(pokemon);
    const stats = getPokeStats(pokemon);
    let typesText = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        typesText += pokemon.types[i].type.name;
        if (i < pokemon.types.length - 1) {
            typesText += " / ";
        }
    }
    let statsHtml = "";
    for (let i = 0; i < stats.length; i++) {
        statsHtml += `<div>${stats[i]}</div>`;
    }
    let html = `<div class="detail-header"
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
                        ${await getEvoTemplate(evo)}
                    </div>
                </div>`;
    dialogRef.innerHTML = html;
    showModal();
}

async function getEvoTemplate(evo) {
    let chain = evo.chain;
    let names = [];
    while (chain) {
        names.push(chain.species.name);
        chain = chain.evolves_to[0];
    }
    let promises = [];
    for (let i = 0; i < names.length; i++) {
        promises.push(fetchPokemonByName(names[i]));
    }
    const pokemons = await Promise.all(promises);
    let html = "";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        html += `
        <div class="evo-item">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}" height="80">
            <div>${names[i]}</div>
        </div>
        `;
    }
    return html;
}

async function fetchPokemonByName(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const pokemon = await response.json();
    return pokemon;
}

async function fetchPokemonById(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const pokemon = await response.json();
    return pokemon;
}

function getPokeStats(pokemon) {
    const pokeStats = [];
    pokemon.stats.forEach(stats => {
        pokeStats.push(stats.stat.name);
    });
    return pokeStats;
}

async function fetchPokeSpecies(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const species = await response.json();
    return species;
}

async function fetchEvoChain(pokemon) {
    const species = await fetchPokeSpecies(pokemon.species.url);
    const response = await fetch(species.evolution_chain.url);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const evo = await response.json();
    return evo;
}

function getPokemonById(pokeId) {
    const pokemon = allPokemon.find(pokemon => pokemon.id == pokeId);
    return pokemon;
}