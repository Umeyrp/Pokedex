let allPokemon = [];
let pokeIDCounter_start = 1;
let pokeIDCounter_end = 20;
function init() {
    fetchPokemons();
}

async function fetchPokemons() {
    try {
        for (pokeIDCounter_start; pokeIDCounter_start <= pokeIDCounter_end; pokeIDCounter_start++) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeIDCounter_start}/`);
            if (!response.ok) {
                throw new Error(`HTTP-Error: ${response.status}`);
            }
            const pokemon = await response.json();
            allPokemon.push(pokemon);
        }
        console.log(allPokemon);
    } catch (error) {
        console.error('Loading error:', error);
    }
}

async function fetchMorePokemons(params) {
    
}