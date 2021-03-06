var baseStats = ['attack', 'defense', 'hit points', 'special attack', 'special defense', 'speed'];
var pokemonTypes = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water'];

var canvasColors = {
  baseStats: {
    attack: '#d50000',
    defense: '#2962ff',
    'hit points': '#00c853',
    'special attack': '#ff6d00',
    'special defense': '#00b8d4',
    speed: '#aa00ff'
  },
  types: {
    bug: '#a8b820',
    dark: '#705848',
    dragon: '#7743f8',
    electric: '#f8d030',
    fairy: '#dea5de',
    fighting: '#c03028',
    fire: '#f08030',
    flying: '#a890f0',
    ghost: '#705898',
    grass: '#78c850',
    ground: '#dfbf68',
    ice: '#98d8d8',
    normal: '#adad7f',
    poison: '#a646a2',
    psychic: '#f75888',
    rock: '#b8a038',
    steel: '#b6b6cd',
    water: '#6890f0'
  },
  totalFav: 'white',
  avgFav: 'white'
};

var canvasData = {
  baseStats: [],
  types: [],
  totalFav: [],
  avgFav: []
};

var baseStatsTemplate = {
  attack: [],
  defense: [],
  'hit points': [],
  'special attack': [],
  'special defense': [],
  speed: [],
  favorites: []
};

var generationsToObjectTemplate = {
  one: {},
  two: {},
  three: {},
  four: {},
  five: {},
  six: {},
  seven: {}
};

var generationToArrayTemplate = {
  one: [],
  two: [],
  three: [],
  four: [],
  five: [],
  six: [],
  seven: []
}