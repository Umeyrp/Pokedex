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
    contentRef.innerHTML = getNoFoundTemplate();
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
        html += getPokemonCardsTemplate(pokemon, typesText);
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

async function openPokemonDialog(pokeId) {
    const pokemon = getPokemonById(pokeId);
    const evo = await fetchEvoChain(pokemon);
    const stats = getPokemonStats(pokemon);
    const statsHtml = getPokemonStatsTemplate(stats);
    const typesText = getPokemonTypes(pokemon);
    dialogRef.innerHTML = await getDialogTemplate(pokemon, typesText, statsHtml, evo);
    showModal();
}

function getPokemonTypes(pokemon) {
    let typesText = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        typesText += pokemon.types[i].type.name;
        if (i < pokemon.types.length - 1) {
            typesText += " / ";
        }
    }
    return typesText;
}

async function renderEvoTemplate(evo) {
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
        html += getEvoTemplate(pokemon, names, i);
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

function getPokemonStats(pokemon) {
    const pokeStats = [];
    pokemon.stats.forEach(stats => {
        pokeStats.push([stats.stat.name, stats.base_stat]);
    });
    return pokeStats;
}

function getPokemonStatsTemplate(stats) {
    let statsHtml = "";
    for (let i = 0; i < stats.length; i++) {
        statsHtml += `<div>${stats[i]}</div>`;
    }
    return statsHtml;
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

function openPreviousDialog(pokeId) {
    let newId = pokeId - 1;
    if (newId < 1) {
        newId = pokeIDCounter_end;
    }
    openPokemonDialog(newId);
}

function openNextDialog(pokeId) {
    let newId = pokeId + 1;
    if (newId > pokeIDCounter_end) {
        newId = 1;
    }
    openPokemonDialog(newId);
}