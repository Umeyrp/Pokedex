let allPokemon = [];
let lastFetchedPokemon = [];
let pokeIDCounter_start = 1;
let pokeIDCounter_end = 20;

const dialogRef = document.getElementById('pokeinfo');

async function init() {
    if (!getPokemonFromLocalStorage()) await fetchPokemons(), savePokemonInLocalStorage();;
    renderPokemon(allPokemon);
    console.log(allPokemon);
}

async function fetchPokemons() {
    showLoadingFeedback();
    hideLoadMoreButton();
    let fetchedPokemon = [];
    const promises = [];
    try {
        for (pokeIDCounter_start; pokeIDCounter_start <= pokeIDCounter_end; pokeIDCounter_start++) {
            promises.push(
                fetch(`https://pokeapi.co/api/v2/pokemon/${pokeIDCounter_start}/`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP-Error: ${response.status}`);
                        }
                        return response.json();
                    })
            );
        }
        let fetchedPokemon = await Promise.all(promises);
        allPokemon.push(...fetchedPokemon);
        hideLoadingFeedback();
        showLoadMoreButton();
        lastFetchedPokemon = fetchedPokemon;
    } catch (error) {
        console.error('Loading error:', error);
    }
}

function savePokemonInLocalStorage() {
    if (!getPokemonFromLocalStorage()) {
        localStorage.setItem("pokemon", JSON.stringify(allPokemon));
    }
}

function getPokemonFromLocalStorage() {
    const localPokemon = JSON.parse(localStorage.getItem("pokemon"));
    if (localPokemon) {
        allPokemon = localPokemon;
        pokeIDCounter_start = 21;
        return true;
    }
}

async function fetchMorePokemons() {
    pokeIDCounter_end += 40;
    await fetchPokemons();
    appendFetchedPokemon(lastFetchedPokemon);
}

function appendFetchedPokemon(pokemonArray) {
    document.getElementById('content').innerHTML += getPokemonTemplate(pokemonArray);
    showLoadMoreButton();
}

function searchPokemon() {
    const search_input = document.getElementById('search_pokemon_input').value.toLowerCase();
    if (search_input.length < 3 || search_input == "") return renderPokemon(allPokemon), showLoadMoreButton();
    showLoadingFeedback();
    hideLoadMoreButton();
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
    document.getElementById('content').innerHTML = "<p>Keine Pokemon gefunden!</p>"
}

function renderPokemon(pokemonArray) {
    document.getElementById('content').innerHTML = getPokemonTemplate(pokemonArray);
    hideLoadingFeedback();
    showLoadMoreButton();
}

function getPokemonTemplate(pokemonArray) {
    let html = "";
    pokemonArray.forEach(pokemon => {
        html += `<article onclick="showPokeDetails(${pokemon.id})" class="pokemon_card" style="background-color: ${colours[pokemon.types[0].type.name]};">`;
        html += pokemon.id + pokemon.name.toUpperCase() + `<img height="50px" src="${pokemon.sprites.other["official-artwork"].front_default}">`;
        pokemon.types.forEach(element => {
            html += element.type.name + " ";
        });
        html += `</article>`;
        html += "<br>";
    });
    return html;
}

function hideLoadMoreButton() {
    document.getElementById('load_more').disabled = true;
    document.getElementById('load_more').hidden = true;
}

function showLoadMoreButton() {
    document.getElementById('load_more').disabled = false;
    document.getElementById('load_more').hidden = false;
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
    let html = "";


    html += `<article onclick="showPokeDetails(${pokemon.id})" class="pokemon_card" style="background-color: ${colours[pokemon.types[0].type.name]};">`;
    html += pokemon.id + pokemon.name.toUpperCase() + `<img height="50px" src="${pokemon.sprites.other["official-artwork"].front_default}">`;
    pokemon.types.forEach(element => {
        html += element.type.name + " ";
    });
    stats.forEach(stat => {
        html += `<p>${stat}</p>`;
    });
    console.log(evo);
    html += getEvoTemplate(evo);
    html += `</article>`;
    dialogRef.innerHTML = html;
    showModal();
}

function getEvoTemplate(evo) {
    let chain = evo.chain;
    let html = "";

    while (chain) {
        html += `<p>${chain.species.name}</p>`;
        chain = chain.evolves_to[0];
    }

    return html;
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