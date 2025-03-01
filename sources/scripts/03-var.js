// Base class list with colors
var BASE_CLASS_LIST = {
    'w': '#f33',
    'm': '#f72',
    't': '#38f',
    'a': '#a28',
    'p': '#fc3',
    'h': '#7d2'
};

const CLASS_NAME_LIST = {
    'w': 'Warrior',
    'm': 'Fire mage',
    't': 'Ice mage',
    'a': 'Assassin',
    'p': 'Protector',
    'h': 'Healer',
    'mw': 'Battlemage',
    'tw': 'Rogue',
    'aw': 'Slayer',
    'pw': 'Paladin',
    'hw': 'Templar',
    'mt': 'Warlock',
    'am': 'Dreamkiller',
    'mp': 'Guardian',
    'hm': 'Runemaster',
    'at': 'Ninja',
    'pt': 'Brigand',
    'ht': 'Trickster',
    'ap': 'Ranger',
    'ah': 'Avenger',
    'hp': 'Sage',
}

const STAGE_TYPE_LIST = {
    'm': '💀', // monster
    'e': '👿', // elite
    'b': '😈', // boss
    't': '💰', // treasure
    'r': '❓', // random
    's': '🤑', // seller / merchant
    'h': '💖' // healer
}

// Elements
var $allcardList = $('allCardList');
var $myDeckList = $('myDeckList');
var $sellerCardList = $('sellerCardList');
var $avatarChoiceList = $('avatarChoiceList');
var $myAvatar = $('myAvatar');
var $map = $('map');
// var $continueButton = $('continueButton');
var $playerAvatar = $('playerAvatar');
var $opponentAvatar = $('opponentAvatar');
var $userBar = $('c-userBar');
var $myDeck = $('myDeck');
var $myHand = $('myHand');
var $endTurnButton = $('endTurnButton');
var $mapWrapper = $('mapWrapper');
var $rewardCardList = $('rewardCardList');
var $screenGame = $('screen-game');
var $removeCardLink = $('remove-card-link');

// Links
let $dieList = $('c-dieList');
let dieList = [];

// Map
const LEVEL_STAGE_NUMBER = 12;
const MAP_Y_SPACE = 130;
let stageList = [];
let turnDieId = 0; // increament die id during ach turn to be unique

let isMapGenerated = false;

let playersProxy = {
    set: function(obj, prop, newValue) {
        obj[prop] = newValue;
        let lifeText = `💖 ${obj.l}/${obj.m}`;
        if(obj.sh) {
            lifeText += ` 🛡 ${obj.sh}`;
        }
        if(obj.p) {
            lifeText += ` 🤢 ${obj.p}`;
        }
        if(obj.freeze) {
            lifeText += ` ❄ ${obj.freeze}`;
        }
        if(obj.burn) {
            lifeText += ` 🔥 ${obj.burn}`;
        }
        if(obj.stun) {
            lifeText += ` 😵 ${obj.stun}`;
        }
        $$(`.c-life[data-p="${obj.id}"] b`).innerText = lifeText;
        if(obj.id == 1) {
            $('playerClass').innerText = getClassName(player.c);
            $('playerLife').innerText = `💖 ${player.l}/${player.m}`;
            $('playerGold').innerText = `💰 ${player.g}`;
            $('playerFloor').innerText = `👣 ${player.f + 1}`;
            // setFromLS('player', obj);
        } else {
            // setFromLS('opponent', obj);
        }
    }
};

let player = new Proxy({
    id: 1,
    m: 100, // max life points
    l: 100, // currentlifepoints
    sh: 0, // shield
    p: 0, // poison
    freeze: 0,
    burn: 0,
    stun: 0,
    g: 150, // gold
    f: 0, // current floor
    s: '' // screen (if step is game, class selection, floor selection...)
    /*
    c: class
    d: deck
    t: current turn in fight
    */
}, playersProxy);
let opponent = new Proxy({
    id: 2,
    m: 15, // max life points
    l: 15, // currentlifepoints,
    sh: 0, // shield
    p: 0, // poison
    freeze: 0,
    burn: 0,
    stun: 0,
}, playersProxy);

let draggedDieId = null; //Save die id when dragged instead of dataTransfer, to be able to check on dragenter