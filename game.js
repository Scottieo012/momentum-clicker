// game.js
let momentum = 0;
let passiveRate = 0;
let isHolding = false;
let holdStartTime = null;

const momentumDisplay = document.getElementById("momentum");
const earnButton = document.getElementById("earnButton");
const challengeContainer = document.getElementById("challengeContainer");

function updateMomentumDisplay() {
  momentumDisplay.textContent = momentum.toFixed(2);
}

function incrementMomentum(deltaTime) {
  if (isHolding) {
    momentum += deltaTime;
  }
  momentum += passiveRate * deltaTime;
  updateMomentumDisplay();
}

let lastUpdateTime = Date.now();
setInterval(() => {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;
  incrementMomentum(deltaTime);
  saveGame();
}, 100);

// Holding mechanics
earnButton.addEventListener("mousedown", () => {
  isHolding = true;
});

earnButton.addEventListener("mouseup", () => {
  isHolding = false;
});

earnButton.addEventListener("mouseleave", () => {
  isHolding = false;
});

earnButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  isHolding = true;
});

earnButton.addEventListener("touchend", () => {
  isHolding = false;
});

// Local storage
function saveGame() {
  const gameState = {
    momentum,
    passiveRate,
    purchases
  };
  localStorage.setItem("momentumGameState", JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem("momentumGameState");
  if (saved) {
    const state = JSON.parse(saved);
    momentum = state.momentum || 0;
    passiveRate = state.passiveRate || 0;
    Object.assign(purchases, state.purchases);
  }
}

const purchases = {};
function createChallengeCard(card) {
  if (!purchases[card.id]) purchases[card.id] = 0;
  
  const cardDiv = document.createElement("div");
  cardDiv.className = "challenge-card";
  
  const title = document.createElement("h3");
  title.textContent = card.title;
  
  const description = document.createElement("p");
  description.textContent = card.description;
  
  const costDisplay = document.createElement("p");
  const currentCost = getCurrentCost(card);
  costDisplay.textContent = `Cost: ${currentCost.toFixed(2)} MP`;
  
  const countDisplay = document.createElement("p");
  countDisplay.textContent = `Completed: ${purchases[card.id]}x`;
  
  const button = document.createElement("button");
  button.textContent = "I did it!";
  button.addEventListener("click", () => {
    const cost = getCurrentCost(card);
    if (momentum >= cost) {
      momentum -= cost;
      passiveRate += card.multiplier;
      purchases[card.id]++;
      updateChallengeCards();
    }
  });

  cardDiv.appendChild(title);
  cardDiv.appendChild(description);
  cardDiv.appendChild(costDisplay);
  cardDiv.appendChild(countDisplay);
  cardDiv.appendChild(button);

  return cardDiv;
}

function getCurrentCost(card) {
  const base = card.baseCost;
  const count = purchases[card.id] || 0;
  return base * Math.pow(1.15, count);
}

function updateChallengeCards() {
  challengeContainer.innerHTML = "";
  challengeCards.forEach(card => {
    challengeContainer.appendChild(createChallengeCard(card));
  });
  updateMomentumDisplay();
}

loadGame();
updateChallengeCards();
