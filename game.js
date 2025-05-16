// game.js

let momentum = 0;
let momentumPerSecond = 0;
let isHolding = false;
let lastUpdateTime = Date.now();

// Button momentum generation
function startGeneratingMomentum() {
  isHolding = true;
}

function stopGeneratingMomentum() {
  isHolding = false;
}

function updateMomentum() {
  const now = Date.now();
  const deltaTime = (now - lastUpdateTime) / 1000; // in seconds
  lastUpdateTime = now;

  if (isHolding) {
    momentum += 1 * deltaTime; // 1 point per second while holding
  }

  momentum += momentumPerSecond * deltaTime; // Add passive momentum

  updateMomentumDisplay();
}

function updateMomentumDisplay() {
  document.getElementById("momentum").textContent = momentum.toFixed(2);
  document.getElementById("momentumPerSecond").textContent = `+${momentumPerSecond.toFixed(2)} / sec`;
}

// Render challenge cards
function renderChallengeCards() {
  const container = document.getElementById("challengeContainer");
  container.innerHTML = "";

  challengeCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "challenge-card";

    const cooldownRemaining = Math.max(0, Math.floor((card.cooldownEnd - Date.now()) / 1000));
    const isOnCooldown = cooldownRemaining > 0;

    cardDiv.innerHTML = `
      <h3>${card.title}</h3>
      <p>${card.description}</p>
      <p>Cost: ${card.cost.toFixed(2)} MP</p>
      <p>Completed: ${card.timesCompleted}</p>
      <p>Gain: +${card.multiplier}/sec</p>
      ${isOnCooldown ? `<p class="cooldown-timer">${cooldownRemaining}s</p>` : ''}
      <button ${isOnCooldown ? "disabled" : ""} onclick="completeChallenge('${card.id}')">I did it!</button>
    `;

    container.appendChild(cardDiv);
  });
}

// Complete challenge
function completeChallenge(cardId) {
  const card = challengeCards.find(c => c.id === cardId);
  if (!card || momentum < card.cost || card.cooldownEnd > Date.now()) return;

  momentum -= card.cost;
  momentumPerSecond += card.multiplier;
  card.timesCompleted += 1;

  // Increase cost slightly
  card.cost *= 1.15;

  // Set 5-minute cooldown
  card.cooldownEnd = Date.now() + 5 * 60 * 1000;

  updateMomentumDisplay();
  renderChallengeCards();
}

// Cooldown update timer
setInterval(() => {
  renderChallengeCards();
}, 1000);

// Game loop
setInterval(updateMomentum, 100);

// Button event listeners
const button = document.getElementById("earnButton");
button.addEventListener("mousedown", startGeneratingMomentum);
button.addEventListener("mouseup", stopGeneratingMomentum);
button.addEventListener("mouseleave", stopGeneratingMomentum);
button.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startGeneratingMomentum();
}, { passive: false });
button.addEventListener("touchend", stopGeneratingMomentum);
button.addEventListener("touchcancel", stopGeneratingMomentum);

// Initial render
renderChallengeCards();
updateMomentumDisplay();
