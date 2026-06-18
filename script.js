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
    const data = await fetchJson("https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0");
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
    return pokemonArray.map((pokemon, index) => {
        if (pokemon.globalIndex) index = pokemon.globalIndex;
        return getPokemonCardsTemplate(pokemon, index);
    }).join("");
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
    return pokemon.stats.map(stats =>
        [stats.stat.name, stats.base_stat]
    );
}

async function renderEvoTemplate(evo, pokeId) {
    const ids = getPokemonEvoChain(evo.chain);
    const pokemons = await Promise.all(ids.map(fetchPokemonById));
    return pokemons.map((pokemon) => {
        const index = getIndexByPokemonId(pokemon.id);
        return getEvoTemplate(pokemon, pokeId, index);
    }).join("");
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
    return pokemon.types.map((_, i) => getPokemonTypeTemplateDialog(pokemon, i)).join("");
}

function renderPokemonTypeTemplate(pokemon) {
    return pokemon.types.map((_, i) => getPokemonTypeTemplate(pokemon, i)).join("");
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

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP-Error: ${response.status}`);
    }
    return response.json();
}

async function fetchPokemonByName(name) {
    return fetchJson(`https://pokeapi.co/api/v2/pokemon/${name}`);
}

async function fetchPokemonById(id) {
    return fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`);
}

async function fetchPokemonByUrl(url) {
    return fetchJson(url);
}

async function fetchEvoChain(pokemon) {
    const species = await fetchPokemonByUrl(pokemon.species.url);
    return fetchJson(species.evolution_chain.url);;
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
    if (!maxPokemonId) {
        document.getElementById('load_more').disabled = false;
        document.getElementById('load_more').style.display = "block";
    }
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

function openDialogAtOffset(index, offset) {
    const count = currentPokemons.length;
    const newIndex = (index + offset + count) % count;
    openPokemonDialog(currentPokemons[newIndex].id, newIndex);
}

function openPreviousDialog(index) {
    openDialogAtOffset(index, -1);
}

function openNextDialog(index) {
    openDialogAtOffset(index, 1);
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

const header = document.querySelector('header');
const add_threshold = 120;
const remove_threshold = 50;

function handleScroll() {
    const y = window.scrollY;
    const isScrolled = header.classList.contains('is-scrolled');

    if (!isScrolled && y > add_threshold) {
        header.classList.add('is-scrolled');
    } else if (isScrolled && y < remove_threshold) {
        header.classList.remove('is-scrolled');
    }
}
window.addEventListener('scroll', handleScroll, { passive: true });

const input = document.getElementById("search_pokemon_input");
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        searchPokemon();
        setTimeout(() => {
            input.blur();
        }, 50);
    }
});
