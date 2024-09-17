let currentLevel = 1;
let targetSpeed = 3000; // Speed for target movement
let targetCount = 3;
let targetsHit = 0;
const levels = [
    { level: 1, speed: 3000, targetCount: 3 }, // Slower speed for level 1
    { level: 2, speed: 4000, targetCount: 4 }, // Slower speed for level 2
    { level: 3, speed: 5000, targetCount: 5 }  // Slower speed for level 3
];

const gameContainer = document.getElementById('game-container');
const levelTitle = document.getElementById('level-title');
const startButton = document.getElementById('start-button');
const nextLevelButton = document.getElementById('next-level-button');

let cat, mouse;

startButton.addEventListener('click', startGame);
nextLevelButton.addEventListener('click', nextLevel);

function startGame() {
    startButton.style.display = 'none';
    setupLevel();
}

function setupLevel() {
    gameContainer.innerHTML = '';
    targetsHit = 0;
    levelTitle.textContent = `Level ${currentLevel}`;
    const levelData = levels.find(level => level.level === currentLevel);
    targetSpeed = levelData.speed;
    targetCount = levelData.targetCount;

    createCat();
    createMouse();
    placeTargets();
    
    document.addEventListener('keydown', moveCat);
}

function createCat() {
    cat = document.createElement('div');
    cat.classList.add('cat');
    placeCatRandomly(); // Place the cat at a random position
    gameContainer.appendChild(cat);
}

function placeCatRandomly() {
    const catSize = 50; // Assuming cat size is 50x50px
    let x, y, catRect;

    do {
        x = Math.random() * (gameContainer.clientWidth - catSize);
        y = Math.random() * (gameContainer.clientHeight - catSize);
        catRect = { left: x, top: y, right: x + catSize, bottom: y + catSize };
    } while (isOverlappingWithAnyTarget(catRect)); // Ensure no overlap with any target

    cat.style.left = `${x}px`;
    cat.style.top = `${y}px`;
}

function isOverlappingWithAnyTarget(catRect) {
    const targets = document.querySelectorAll('.target');
    for (let target of targets) {
        const targetRect = target.getBoundingClientRect();
        if (isOverlapping(catRect, targetRect)) {
            return true;
        }
    }
    return false;
}


function createMouse() {
    mouse = document.createElement('div');
    mouse.classList.add('mouse');
    mouse.style.left = '300px'; // Fixed position for the mouse
    mouse.style.top = '300px'; // Fixed position for the mouse
    gameContainer.appendChild(mouse);
}

function placeTargets() {
    const catRect = cat.getBoundingClientRect();
    for (let i = 0; i < targetCount; i++) {
        const target = document.createElement('div');
        target.classList.add('target');
        positionTargetRandomly(target, catRect);
        gameContainer.appendChild(target);
        moveTarget(target);
    }
}

function positionTargetRandomly(target, catRect) {
    const targetSize = 50; // Assuming target size is 50x50px
    let x, y, targetRect;

    do {
        x = Math.random() * (gameContainer.clientWidth - targetSize);
        y = Math.random() * (gameContainer.clientHeight - targetSize);
        targetRect = { left: x, top: y, right: x + targetSize, bottom: y + targetSize };
    } while (isOverlapping(catRect, targetRect)); // Ensure no overlap with the cat

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
}

function isOverlapping(rect1, rect2) {
    return !(rect2.left > rect1.right ||
             rect2.right < rect1.left ||
             rect2.top > rect1.bottom ||
             rect2.bottom < rect1.top);
}

let targetTimers = []; // Array to store target movement timers

function moveTarget(target) {
    const x = Math.random() * (gameContainer.clientWidth - 50);
    const y = Math.random() * (gameContainer.clientHeight - 50);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    const timerId = setTimeout(() => {
        if (document.body.contains(target)) {
            moveTarget(target);
        }
    }, targetSpeed); // Adjusted speed for target movement

    targetTimers.push(timerId); // Store the timer ID

    checkCollision(target);
}


function moveCat(e) {
    const step = 20;
    const catRect = cat.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();

    switch (e.key) {
        case 'ArrowUp':
            if (catRect.top > containerRect.top) {
                cat.style.top = `${cat.offsetTop - step}px`;
            }
            break;
        case 'ArrowDown':
            if (catRect.bottom < containerRect.bottom) {
                cat.style.top = `${cat.offsetTop + step}px`;
            }
            break;
        case 'ArrowLeft':
            if (catRect.left > containerRect.left) {
                cat.style.left = `${cat.offsetLeft - step}px`;
            }
            break;
        case 'ArrowRight':
            if (catRect.right < containerRect.right) {
                cat.style.left = `${cat.offsetLeft + step}px`;
            }
            break;
    }

    checkMouseCollision();
}

function checkCollision(target) {
    const checkInterval = setInterval(() => {
        const catRect = cat.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        if (
            catRect.left < targetRect.right &&
            catRect.right > targetRect.left &&
            catRect.top < targetRect.bottom &&
            catRect.bottom > targetRect.top
        ) {
            alert('Game Over! You hit a target!');
            resetGame();
            clearInterval(checkInterval);
        }
    }, 100);
}


function checkMouseCollision() {
    const catRect = cat.getBoundingClientRect();
    const mouseRect = mouse.getBoundingClientRect();

    if (
        catRect.left < mouseRect.right &&
        catRect.right > mouseRect.left &&
        catRect.top < mouseRect.bottom &&
        catRect.bottom > mouseRect.top
    ) {
        alert('You find the cat! Level Complete!');
        
        // Clear all target movement timers to stop targets from moving
        targetTimers.forEach(timerId => clearTimeout(timerId));
        targetTimers = []; // Reset the timers array

        levelComplete();
    }
}

function levelComplete() {
    currentLevel++;
    if (currentLevel > levels.length) {
        alert('You completed all levels!');
        resetGame();
    } else {
        nextLevelButton.style.display = 'block';
        document.removeEventListener('keydown', moveCat);
    }
}

function nextLevel() {
    nextLevelButton.style.display = 'none';
    setupLevel();
}

function resetGame() {
    // Clear all target movement timers
    targetTimers.forEach(timerId => clearTimeout(timerId));
    targetTimers = []; // Reset the timers array

    currentLevel = 1;
    startButton.style.display = 'block';
    levelTitle.textContent = `Level 1`;
    document.removeEventListener('keydown', moveCat);
}

