let allPokemon = [];
let lastedFetchedPokemon = [];
let pokeIDCounter_start = 1;
let pokeIDCounter_end = 30;


const colours = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};

async function init() {
    await fetchPokemons();
    renderPokemon(allPokemon);
}

async function fetchPokemons() {
    showLoadingFeedback();
    hideLoadMoreButton();
    let fetchedPokemon = [];
    try {
        for (pokeIDCounter_start; pokeIDCounter_start <= pokeIDCounter_end; pokeIDCounter_start++) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeIDCounter_start}/`);
            if (!response.ok) {
                throw new Error(`HTTP-Error: ${response.status}`);
            }
            const pokemon = await response.json();
            fetchedPokemon.push(pokemon);
        }
        allPokemon = allPokemon.concat(fetchedPokemon);
        hideLoadingFeedback();
        showLoadMoreButton();
        lastedFetchedPokemon = fetchedPokemon;
    } catch (error) {
        console.error('Loading error:', error);
    }
}

async function fetchMorePokemons() {
    pokeIDCounter_end += 30;
    await fetchPokemons();
    appendFetchedPokemon(lastedFetchedPokemon);
}

function appendFetchedPokemon(pokemonArray) {
    document.getElementById('content').innerHTML += getPokemonTemplate(pokemonArray);
    showLoadMoreButton();
}

function searchPokemon() {
    const search_input = document.getElementById('search_pokemon_input').value;
    if (search_input.length < 3 || search_input == "") return renderPokemon(allPokemon), showLoadMoreButton();
    showLoadingFeedback();
    hideLoadMoreButton();
    const searchedPokemon = allPokemon.filter((pokemon) => pokemon.name.includes(search_input));
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
}

function getPokemonTemplate(pokemonArray) {
    let content = "";
    pokemonArray.forEach(pokemon => {
        content += `<article class="pokemon_card" style="background-color: ${colours[pokemon.types[0].type.name]};">`;
        content += pokemon.id + pokemon.name.toUpperCase() + `<img height="50px" src="${pokemon.sprites.other["official-artwork"].front_default}">`;
        pokemon.types.forEach(element => {
            content += element.type.name + " ";
        });
        content += `</article>`;
        content += "<br>";
    });
    return content;
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
