let allPokemon = [];
let lastFetchedPokemon = [];
let pokeIDCounter_start = 1;
let pokeIDCounter_end = 20;
let maxPokemonId = false;

const dialogRef = document.getElementById('pokeinfo');
const contentRef = document.getElementById('content');

async function init() {
    if (!getPokemonFromLocalStorage()) await fetchPokemons(), savePokemonInLocalStorage();
    renderPokemon(allPokemon);
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
    const fetchedPokemon = await Promise.all(promises);
    allPokemon.push(...fetchedPokemon);
    lastFetchedPokemon = fetchedPokemon;
}

async function fetchMorePokemons() {
    pokeIDCounter_start += 20;
    pokeIDCounter_end += 20;
    await fetchPokemons();
    appendFetchedPokemon(lastFetchedPokemon);
}

function appendFetchedPokemon(pokemonArray) {
    contentRef.innerHTML += getPokemonTemplate(pokemonArray);
}

function searchPokemon() {
    const search_input = document.getElementById('search_pokemon_input').value.toLowerCase();
    if (!validateSearchInput(search_input)) return renderPokemon(allPokemon), showLoadMoreButton();
    startLoading();
    const searchedPokemon = allPokemon.filter(pokemon => pokemon.name.includes(search_input));
    if (searchedPokemon.length === 0) {
        showNoFoundMessage();
    } else {
        renderPokemon(searchedPokemon);
    }
    if (search_input != "") {
        hideLoadMoreButton();
    }
    hideLoadingFeedback();
}

function getPokemonTemplate(pokemonArray) {
    let html = "";
    pokemonArray.forEach(pokemon => {
        html += getPokemonCardsTemplate(pokemon);
    });
    return html;
}

async function openPokemonDialog(pokeId) {
    const pokemon = getPokemonById(pokeId);
    const evo = await fetchEvoChain(pokemon);
    const stats = getPokemonStats(pokemon);
    dialogRef.innerHTML = await getDialogTemplate(pokemon, evo);
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

async function renderEvoTemplate(evo) {
    let chain = evo.chain;
    let names = [];
    let ids = [];
    while (chain) {
        names.push(chain.species.name);
        ids.push(chain.species.url.split("/").filter(Boolean).at(-1));
        chain = chain.evolves_to[0];
    }
    let promises = [];
    for (let i = 0; i < names.length; i++) {
        promises.push(fetchPokemonById(ids[i]));
    }
    const pokemons = await Promise.all(promises);
    let html = "";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        html += getEvoTemplate(pokemon, names, i);
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
                        font: { size: 16, weight:600, family: "Pixelify Sans" },
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

function getPokemonById(pokeId) {
    const pokemon = allPokemon.find(pokemon => pokemon.id == pokeId);
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
    contentRef.innerHTML = getPokemonTemplate(pokemonArray);
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

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(tab).classList.add('active');
}

function validateSearchInput(inputValue) {
    const emptySearch = document.getElementById("empty-search");
    const isValid = inputValue.length > 2 || inputValue == "";
    if (!isValid) {
        emptySearch.style.display = "block";
    } else {
        emptySearch.style.display = "none";
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

//Close dialog by clicking outside
function enableOutsideClickClose(dialogRef) {
    dialogRef.addEventListener("click", (event) => {
        if (event.target === dialogRef) {
            dialogRef.close();
        }
    });
}

enableOutsideClickClose(dialogRef);