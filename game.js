let momentum = 0;
let passiveRate = 0;
let isHolding = false;
let holdInterval;
let cooldowns = {};

function updateDisplay() {
  document.getElementById("momentum").textContent = momentum.toFixed(2);
  document.getElementById("momentumRate").textContent = `Momentum/sec: ${(passiveRate + (isHolding ? 1 : 0)).toFixed(2)}`;
}

function startHolding() {
  isHolding = true;
  holdInterval = setInterval(() => {
    momentum += 1;
    updateDisplay();
  }, 1000);
}

function stopHolding() {
  isHolding = false;
  clearInterval(holdInterval);
  updateDisplay();
}

function updatePassiveMomentum() {
  momentum += passiveRate / 10;
  updateDisplay();
}

function calculateCost(card) {
  return (card.baseCost * Math.pow(1.15, card.timesCompleted)).toFixed(2);
}

function renderChallengeCards() {
  const container = document.getElementById("challengeContainer");
  container.innerHTML = "";

  challengeCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "challenge-card";

    const title = document.createElement("h3");
    title.textContent = card.title;

    const description = document.createElement("p");
    description.className = "challenge-info";
    description.textContent = card.description;

    const cost = document.createElement("p");
    cost.className = "challenge-info";
    cost.textContent = `Cost: ${calculateCost(card)} Momentum`;

    const times = document.createElement("p");
    times.className = "challenge-info";
    times.textContent = `Completed: ${card.timesCompleted}`;

    const cooldownTimer = document.createElement("p");
    cooldownTimer.className = "cooldown-timer";
    cooldownTimer.id = `cooldown-${card.id}`;

    const button = document.createElement("button");
    button.textContent = "I did it!";
    button.disabled = isInCooldown(card);

    button.onclick = () => {
      const cost = parseFloat(calculateCost(card));
      if (momentum >= cost && !isInCooldown(card)) {
        momentum -= cost;
        card.timesCompleted += 1;
        passiveRate += card.multiplier;

        card.lastCompletedTime = Date.now();
        updateDisplay();
        renderChallengeCards();
      }
    };

    cardDiv.appendChild(title);
    cardDiv.appendChild(description);
    cardDiv.appendChild(cost);
    cardDiv.appendChild(times);
    cardDiv.appendChild(button);
    cardDiv.appendChild(cooldownTimer);
    container.appendChild(cardDiv);
  });
}

function isInCooldown(card) {
  const now = Date.now();
  const elapsed = now - card.lastCompletedTime;
  return elapsed < 5 * 60 * 1000; // 5 minutes
}

function updateCooldowns() {
  challengeCards.forEach(card => {
    const cooldownText = document.getElementById(`cooldown-${card.id}`);
    const remaining = 5 * 60 * 1000 - (Date.now() - card.lastCompletedTime);

    if (cooldownText && remaining > 0) {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      cooldownText.textContent = `Cooldown: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    } else if (cooldownText) {
      cooldownText.textContent = "";
    }
  });
  renderChallengeCards();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("earnButton").addEventListener("mousedown", startHolding);
  document.getElementById("earnButton").addEventListener("mouseup", stopHolding);
  document.getElementById("earnButton").addEventListener("mouseleave", stopHolding);
  renderChallengeCards();
  setInterval(updatePassiveMomentum, 100);
  setInterval(updateCooldowns, 1000);
});
