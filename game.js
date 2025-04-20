let momentum = 0;
let isHolding = false;
let lastUpdateTime = Date.now();
let passiveRate = 0;
const challengeCards = [
  {
    id: 1,
    text: "Do a 5-minute breathing exercise",
    baseMultiplier: 0.5,
    multiplierIncrement: 0.1,
    timesCompleted: 0,
    baseCost: 10,
    costIncrease: 1.15,
  },
  {
    id: 2,
    text: "Write down 3 things you’re grateful for",
    baseMultiplier: 0.2,
    multiplierIncrement: 0.05,
    timesCompleted: 0,
    baseCost: 5,
    costIncrease: 1.10,
  },
  {
    id: 3,
    text: "Visualize your ideal day for 3 minutes",
    baseMultiplier: 0.3,
    multiplierIncrement: 0.07,
    timesCompleted: 0,
    baseCost: 8,
    costIncrease: 1.12,
  }
];

function updateMomentumDisplay() {
  document.getElementById("momentum").textContent = momentum.toFixed(2);
}

function earnMomentum(deltaTime) {
  if (isHolding) {
    momentum += deltaTime * 0.001;
  }
  momentum += (deltaTime * passiveRate) * 0.001;
  updateMomentumDisplay();
}

function setupHoldButton() {
  const button = document.getElementById("earnButton");
  button.addEventListener("mousedown", () => isHolding = true);
  button.addEventListener("mouseup", () => isHolding = false);
  button.addEventListener("mouseleave", () => isHolding = false);
  button.addEventListener("touchstart", () => isHolding = true);
  button.addEventListener("touchend", () => isHolding = false);
}

function renderChallengeCards() {
  const container = document.getElementById("challengeContainer");
  container.innerHTML = "";
  challengeCards.forEach(card => {
    const cost = card.baseCost * Math.pow(card.costIncrease, card.timesCompleted);
    const div = document.createElement("div");
    div.className = "challenge-card";
    div.innerHTML = `
      <p><strong>Challenge:</strong> ${card.text}</p>
      <p><strong>Multiplier:</strong> +${(card.baseMultiplier + card.multiplierIncrement * card.timesCompleted).toFixed(2)} per second</p>
      <p><strong>Cost:</strong> ${cost.toFixed(2)} Momentum Points</p>
      <p><strong>Completed:</strong> ${card.timesCompleted} time(s)</p>
      <button onclick="completeChallenge(${card.id})">I did it</button>
    `;
    container.appendChild(div);
  });
}

function completeChallenge(id) {
  const card = challengeCards.find(c => c.id === id);
  const cost = card.baseCost * Math.pow(card.costIncrease, card.timesCompleted);
  if (momentum >= cost) {
    momentum -= cost;
    card.timesCompleted += 1;
    passiveRate += card.baseMultiplier + card.multiplierIncrement * (card.timesCompleted - 1);
    renderChallengeCards();
    updateMomentumDisplay();
    saveGame();
  } else {
    alert("Not enough Momentum Points!");
  }
}

function saveGame() {
  const data = {
    momentum,
    passiveRate,
    challengeCards: challengeCards.map(c => c.timesCompleted),
    lastSaveTime: Date.now()
  };
  localStorage.setItem("momentumGame", JSON.stringify(data));
}

function loadGame() {
  const saved = localStorage.getItem("momentumGame");
  if (saved) {
    const data = JSON.parse(saved);
    momentum = data.momentum;
    passiveRate = data.passiveRate;
    data.challengeCards.forEach((count, index) => {
      challengeCards[index].timesCompleted = count;
    });
    const elapsed = (Date.now() - data.lastSaveTime) / 1000;
    momentum += elapsed * passiveRate;
  }
}

function gameLoop() {
  const now = Date.now();
  const deltaTime = now - lastUpdateTime;
  lastUpdateTime = now;
  earnMomentum(deltaTime);
  requestAnimationFrame(gameLoop);
}

window.onload = () => {
  loadGame();
  setupHoldButton();
  renderChallengeCards();
  updateMomentumDisplay();
  gameLoop();
  setInterval(saveGame, 3000);
};
