function displayAllCards() {
    for (const cardId of Object.keys(cardList)) {
        let cardElement = displayCard(cardId);
        addHoverEffect(cardElement);
        $allcardList.append(cardElement);
    }
}

function displayMyDeck() {
    displayCardList(player.d, $myDeckList);
}

function displayRewardCards() {
    // gets 3 random rewards. One of each type, the last from both or double card. No duplicate choice
    let firstRewardList = [];
    let secondRewardList = [];
    let thirdRewardList = [];
    for(cardId in cardList) {
        if(getCardTypes(cardId) == player.c[0]) {
            firstRewardList.push(cardId);
        }
        if(getCardTypes(cardId) == player.c[1]) {
            secondRewardList.push(cardId);
        }
        if([player.c[0], player.c[1], getCardTypes(player.c)].indexOf(getCardTypes(cardId)) >= 0) {
            thirdRewardList.push(cardId);
        }
    }
    let firstReward = getRandomItem(firstRewardList);
    secondRewardList = secondRewardList.filter(cardId => cardId != firstReward); // In case ser selected a single class, removes first reward from choices
    let secondReward = getRandomItem(secondRewardList);
    thirdRewardList = thirdRewardList.filter(cardId => [firstReward, secondReward].indexOf(cardId) < 0); // Removes selected rewards from choices
    displayCardList([firstReward, secondReward, getRandomItem(thirdRewardList)], $rewardCardList, addCardToDeck);
}

function displayCardList(cardList, $wrapper, callback) {
    $wrapper.innerHTML = '';
    for (const cardId of Object.values(cardList)) {
        let $card = displayCard(cardId);
        addHoverEffect($card);
        $wrapper.append($card);
        if(callback) {
            $card.style.cursor = 'pointer';
            $card.onclick = () => { callback(cardId); };
        }
    }
}

function addCardToDeck(cardId) {
    player.d.push(cardId);
    showScreen('screen-map');
}

function displayCard(cardId, handCardIndex = -1) {
    let card = cardList[cardId];
    let cardType = getCardTypes(cardId);
    let cardContent = `<div class="c-card__content -${cardType} -rarity${card.r}"><div class="c-card__dieList">`;
    
    card.d.split('|').forEach((die, dieIndex) => {
        cardContent += drawCardDie(die, handCardIndex, dieIndex);
    });
    cardContent += `</div><p class="c-card__effect">${getCardEffect(card.e)}</p>`;

    // TODO: utiliser createaFromHTML?
    let cardElement = createElement('div');
    cardElement.classList.add('c-card');
    if(handCardIndex >= 0) {
        cardElement.dataset.hand = handCardIndex;
    }
    cardElement.innerHTML = cardContent;
    return cardElement;
}

// Get card type orderded to get a cardId from player class (not ordered for avatar), or card id
function getCardTypes(cardId) {
    let cardType = cardId.replace(/\d+/, '');
    return cardType.length < 2 || cardType[0] == cardType[1] ? cardType[0] : cardType.split('').sort().join('');
}

function addHoverEffect(element) {
    element.onmousemove = event => {
        let bounding = event.currentTarget.getBoundingClientRect();
        let x = Math.max(0, event.pageX - ~~(bounding.left));
        let y = Math.max(0, event.pageY - window.scrollY - ~~(bounding.top));
        let width = ~~(bounding.width);
        let height = ~~(bounding.height);

        let posX = width / 2 - x;
        let posY = height / 2 - y;
        let hypotenuseCursor = Math.sqrt(Math.pow(posX, 2) + Math.pow(posY, 2));
        let hypotenuseMax = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
        let ratio = hypotenuseCursor / hypotenuseMax;

        const maxAngle = 20;
        element.firstChild.style.transform = `rotate3d(${posY / hypotenuseCursor}, ${-posX / hypotenuseCursor}, 0, ${ratio * maxAngle}deg)`;
        element.firstChild.style.filter = `brightness(${1.2 - y / height / 2})` // 0.6 = offset, brightness will be from 0.6 to 1.6
    };

    element.onmouseleave = () => {
        element.firstChild.style.transform = '';
        element.firstChild.style.filter = '';
    };
}

function drawCardDie(die, handCardIndex = -1, dieNumber) {
    let dataHand = handCardIndex >= 0 ? `data-hand="${handCardIndex}"` : '';
    let match = die.match(/([-+*]?)([0-9])/);
    let dieContent = die;
    if (match) {
        let pre = '';
        switch (match[1]) {
            case '-': pre = 'max<br/>'; break;
            case '+': pre = 'min<br/>'; break;
        }
        dieContent = pre + match[2];
    } 
    return `<p class="c-card__die" ${dataHand} data-die="${dieNumber}">${dieContent}</p>`;
}

function getCardEffect(effectCode, dieValue) {
    let effectText = '';
    let effectList = effectCode.split(',');
    effectList.forEach((effect, index) => {
        effectText += index > 0 ? `<br>` : '';
        let split = effect.split('|');
        let split2 = split[0].split(':');
        let effectValue = split[1].replace('X', '<i></i>');
        let effectCondition = split2.length > 1 ? split2[0] : '';
        let effectType = split2[split2.length - 1 ];
        effectText += effectCondition ? `${effectCondition}: `: '';
        switch (effectType) {
            case 'damage':
                effectText += `Do 💢<b>${effectValue}</b> damage`;
                break;
            case 'reflect':
                effectText += `Lose 💖<b>${effectValue}</b> life`;
                break;
            case 'poison':
                effectText += `Do 🤢<b>${effectValue}</b> poison`;
                break;
            case 'stun':
                effectText += `Stun 😵 a die`;
                break;
            case 'updie':
                effectText += `Increase die value of <b>${effectValue}</b>`;
                break;
            case 'fire':
                effectText += `Fire 🔥 a die`;
                break;
            case 'heal':
                effectText += `Heal ➕<b>${effectValue}</b> life points`;
                break;
            case 'split':
                effectText += `Split die in <b>${effectValue}</b>`;
                break;
            case 'shield':
                effectText += `Add 🛡 <b>${effectValue}</b> shield`;
                break;
            case 'freeze':
                effectText += `Freeze ❄ a die`;
                break;

        }
    });
    return effectText;
}

function createDeck() {
    // TODO: create from selected classes
    player.d = ['w1', 'p1', 'w2', 'pt1', 'w7', 'm2', 'mw1'];
}

function playCard($card) {
    $card.classList.add('-played');
    resolveCardEffect($card);
    wait(500, () => discardCard($card.dataset.hand));
}
 
function resolveCardEffect($card) {
    let cardId = myHandList[$card.dataset.hand];
    let dieValue = $card.querySelector('[data-die]').dataset.value;
    let effectCode = cardList[cardId].e;
    let effectList = effectCode.split(',');
    effectList.forEach((effect, index) => {
        let split = effect.split('|')
        let effectValue = getEffectValue(split[1], +dieValue);
        switch (split[0]) {
            case 'damage':
                updateLifePoints(opponent, -effectValue);
                break;
            case 'reflect':
                updateLifePoints(player, -effectValue);
                break;
            case 'shield':
                player.sh += effectValue;
                console.log(player);
                break;
            case 'stun':
                break;
            case 'heal':
                updateLifePoints(player, effectValue);
                
            case 'updie':
                generateDie(effectValue);
                break;
        }
    });
}

function getEffectValue(effectTextValue, dieValue) {
    let effectValue = 0;
    let operator = 1;
    for(let char of effectTextValue) {
        if(char == 'X') {
            effectValue += dieValue;
        }
        if(char == '-') {
            operator = -1;
        }
        if(char == '*') {
            operator = dieValue;
        }
        if(!isNaN(char)) {
            effectValue += operator * +char;
        }
    }
    return effectValue;
}