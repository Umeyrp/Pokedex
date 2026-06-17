let allPokemon = [];
let lastFetchedPokemon = [];
let currentPokemons = [];
let allPokemonNames = [];
const pokemonFirstLoad = 20;
let pokeIDCounter_start = 1;
let pokeIDCounter_end = pokemonFirstLoad;
let maxPokemonId = false;

const dialogRef = document.getElementById('pokeinfo');
const contentRef = document.getElementById('content');

async function init() {
    if (!getPokemonFromLocalStorage()) await fetchPokemons(), savePokemonInLocalStorage();
    renderPokemon(allPokemon);
    getAllPokemonNames();
}

async function fetchPokemons() {
    if (maxPokemonId) return hideLoadMoreButton();
    startLoading();
    const promises = [];
    try {
        for (let id = pokeIDCounter_start; id <= pokeIDCounter_end; id++) {
            promises.push(fetchPokemonById(id));
            if (id >= 1025) { maxPokemonId = true; break; }
        }
        await pushFetchedPokemonInArray(promises);
    } catch (error) {
        console.error('Loading error:', error);
    }
    finishLoading();
    if (maxPokemonId) hideLoadMoreButton();
}

async function pushFetchedPokemonInArray(promises) {
    const startIndex = allPokemon.length;
    const fetchedPokemon = await Promise.all(promises);
    fetchedPokemon.forEach((pokemon, index) => {
        if (pokemon.id > pokemonFirstLoad) {
            pokemon.globalIndex = startIndex + index;
        }
    });
    allPokemon.push(...fetchedPokemon);
    currentPokemons = allPokemon;
    lastFetchedPokemon = fetchedPokemon;
}

async function fetchMorePokemons() {
    pokeIDCounter_start += pokemonFirstLoad;
    pokeIDCounter_end += pokemonFirstLoad;
    await fetchPokemons();
    appendFetchedPokemon(lastFetchedPokemon);
}

function appendFetchedPokemon(pokemonArray) {
    contentRef.innerHTML += getPokemonTemplate(pokemonArray);
}

async function getAllPokemonNames() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const data = await response.json();
    allPokemonNames = data.results;
}

async function fetchSearchedPokemon(search_input, searchedAlready) {
    let searchedPokemon_2 = allPokemonNames.filter(pokemon => pokemon.name.includes(search_input)).map(pokemon => pokemon.url.split("/").filter(Boolean).at(-1));
    searchedPokemon_2 = searchedPokemon_2.slice(searchedAlready);
    const promises = searchedPokemon_2.map(pokeId => {
        return fetchPokemonById(pokeId);
    });
    const fetchedSearchedPokemon = await Promise.all(promises);
    return fetchedSearchedPokemon;
}

async function searchPokemon() {
    const search_input = document.getElementById('search_pokemon_input').value.toLowerCase();
    if (!validateSearchInput(search_input)) return renderPokemon(allPokemon), showLoadMoreButton();
    startLoading();
    const searchedPokemon_1 = allPokemon.filter(pokemon => pokemon.name.includes(search_input));
    const searchedPokemon_2 = await fetchSearchedPokemon(search_input, searchedPokemon_1.length);
    const searchedPokemon = [...searchedPokemon_1, ...searchedPokemon_2];

    if (searchedPokemon.length === 0) {
        showNoFoundMessage();
    } else {
        currentPokemons = searchedPokemon;
        renderPokemon(currentPokemons);
    }
    if (search_input != "") {
        hideLoadMoreButton();
    }
    hideLoadingFeedback();
}

function getPokemonTemplate(pokemonArray) {
    let html = "";
    pokemonArray.forEach((pokemon, index) => {
        if (pokemon.globalIndex) index = pokemon.globalIndex;
        html += getPokemonCardsTemplate(pokemon, index);
    });
    return html;
}

async function openPokemonDialog(pokeId, index) {
    const pokemon = await getPokemonById(pokeId);
    const evo = await fetchEvoChain(pokemon);
    const stats = getPokemonStats(pokemon);
    dialogRef.innerHTML = await getDialogTemplate(pokemon, evo, index);
    if (index == -1 || currentPokemons.length == 1) hidePaginationButtons();
    renderChart(stats);
    showModal();
}

function getPokemonStats(pokemon) {
    const pokeStats = [];
    pokemon.stats.forEach(stats => {
        pokeStats.push([stats.stat.name, stats.base_stat]);
    });
    return pokeStats;
}

async function renderEvoTemplate(evo, pokeId) {
    const ids = getPokemonEvoChain(evo.chain);
    const promises = [];
    for (let i = 0; i < ids.length; i++) {
        promises.push(fetchPokemonById(ids[i]));
    }
    const pokemons = await Promise.all(promises);
    let html = "";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const index = getIndexByPokemonId(pokemon.id);
        html += getEvoTemplate(pokemon, pokeId, index);
    }
    return html;
}

function getPokemonEvoChain(chain) {
    let ids = [];
    while (chain) {
        ids.push(chain.species.url.split("/").filter(Boolean).at(-1));
        chain = chain.evolves_to[0];
    }
    return ids;
}

function getIndexByPokemonId(pokeId) {
    const index = currentPokemons.findIndex((pokemon) => pokemon.id == pokeId);
    return index;
}

function hidePaginationButtons() {
    document.querySelectorAll(".nav").forEach(button => {
        button.style.display = "none";
    });
}

function renderPokemonTypeTemplateDialog(pokemon) {
    let html = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        html += getPokemonTypeTemplateDialog(pokemon, i);
    }
    return html;
}

function renderPokemonTypeTemplate(pokemon) {
    let html = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        html += getPokemonTypeTemplate(pokemon, i);
    }
    return html;
}

async function renderStatsTemplate(stats) {
    let html = "";
    for (let i = 0; i < stats.length; i++) {
        html += getStatsTemplate(stats[i][0], stats[i][1]);
    }
    return html;
}

function renderChart(stats) {
    const ctx = document.getElementById('myChart');
    const names = [];
    const values = [];

    for (let i = 0; i < stats.length; i++) {
        let name = stats[i][0];

        if (name === "special-attack") name = "s. attack";
        if (name === "special-defense") name = "s. defense";

        names.push(name.toUpperCase());
        values.push(stats[i][1]);
    }

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: names,
            datasets: [{
                data: values,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                r: {
                    min: 0,
                    max: 255,
                    ticks: {
                        stepSize: 100,
                        color: "#5555",
                        display: false,
                    },
                    beginAtZero: true,
                    pointLabels: {
                        color: "#333",
                        font: { size: 16, weight: 600, family: "Pixelify Sans" },
                    },
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
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

async function fetchPokemonByUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const pokemon = await response.json();
    return pokemon;
}

async function fetchEvoChain(pokemon) {
    const species = await fetchPokemonByUrl(pokemon.species.url);
    const response = await fetch(species.evolution_chain.url);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    const evo = await response.json();
    return evo;
}

async function getPokemonById(pokeId) {
    let pokemon = allPokemon.find(pokemon => pokemon.id == pokeId);
    if (!pokemon) {
        pokemon = await fetchPokemonById(pokeId);
    }
    return pokemon;
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

function closeModal() {
    dialogRef.close();
}

function renderPokemon(pokemonArray) {
    currentPokemons = pokemonArray;
    contentRef.innerHTML = getPokemonTemplate(currentPokemons);
    finishLoading();
}

function showNoFoundMessage() {
    contentRef.innerHTML = getNoFoundTemplate();
}

function finishLoading() {
    hideLoadingFeedback();
    showLoadMoreButton();
}

function startLoading() {
    showLoadingFeedback();
    hideLoadMoreButton();
}

function openPreviousDialog(index) {
    const lastIndex = currentPokemons.length - 1;
    let newIndex = index - 1;
    if (newIndex < 0) {
        newIndex = lastIndex;
    }
    const pokeId = currentPokemons[newIndex].id
    openPokemonDialog(pokeId, newIndex);
}

function openNextDialog(index) {
    const lastIndex = currentPokemons.length - 1;
    let newIndex = index + 1;
    if (index == lastIndex) {
        newIndex = 0;
    }
    const pokeId = currentPokemons[newIndex].id
    openPokemonDialog(pokeId, newIndex);
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}

function validateSearchInput(inputValue) {
    const warning = document.getElementById("search-warning");
    const isValid = inputValue.length > 2;
    if (!isValid) {
        warning.style.display = inputValue ? "block" : "none";
    } else {
        warning.style.display = "none";
    }
    return isValid;
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

function enableOutsideClickClose(dialogRef) {
    dialogRef.addEventListener("click", (event) => {
        if (event.target === dialogRef) {
            dialogRef.close();
        }
    });
}

enableOutsideClickClose(dialogRef);