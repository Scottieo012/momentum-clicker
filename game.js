let momentum = 0;
let passiveMomentum = 0;
let lastUpdate = Date.now();

const momentumDisplay = document.getElementById("momentum");
const momentumRateDisplay = document.getElementById("momentumRate");
const earnButton = document.getElementById("earnButton");
const challengeContainer = document.getElementById("challengeContainer");

let isHolding = false;

function formatNumber(num) {
  return num.toFixed(2);
}

function updateDisplay() {
  momentumDisplay.textContent = formatNumber(momentum);
  momentumRateDisplay.textContent = `+${formatNumber(passiveMomentum)} / sec`;
}

function gameLoop() {
  const now = Date.now();
  const deltaSeconds = (now - lastUpdate) / 1000;
  lastUpdate = now;

  if (isHolding) {
    momentum += 1 * deltaSeconds;
  }

  momentum += passiveMomentum * deltaSeconds;
  updateDisplay();

  requestAnimationFrame(gameLoop);
}

earnButton.addEventListener("mousedown", () => (isHolding = true));
earnButton.addEventListener("mouseup", () => (isHolding = false));
earnButton.addEventListener("mouseleave", () => (isHolding = false));
earnButton.addEventListener("touchstart", () => (isHolding = true));
earnButton.addEventListener("touchend", () => (isHolding = false));

// Load challenge cards from cards.js
function renderChallengeCards() {
  challengeContainer.innerHTML = "";
  challengeCards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "challenge-card";
    card.dom = cardDiv; // Store reference for updating cooldown

    const title = document.createElement("h3");
    title.textContent = card.title;

    const description = document.createElement("p");
    description.textContent = card.description;

    const button = document.createElement("button");
    button.textContent = "I did it";
    button.disabled = false;

    const info = document.createElement("p");
    info.className = "challenge-info";
    info.textContent = `Owned: ${card.count} | +${card.reward}/sec | Cost: ${formatNumber(card.cost)} MP`;

    const cooldown = document.createElement("p");
    cooldown.className = "cooldown-timer";

    button.addEventListener("click", () => {
      if (momentum >= card.cost && !card.cooldownUntil) {
        momentum -= card.cost;
        card.count++;
        card.cost *= 1.15;
        passiveMomentum += card.reward;

        card.cooldownUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
        button.disabled = true;

        updateCardUI(card);
      }
    });

    cardDiv.appendChild(title);
    cardDiv.appendChild(description);
    cardDiv.appendChild(info);
    cardDiv.appendChild(button);
    cardDiv.appendChild(cooldown);
    challengeContainer.appendChild(cardDiv);

    card.button = button;
    card.info = info;
    card.cooldownDisplay = cooldown;
  });
}

function updateCardUI(card) {
  card.info.textContent = `Owned: ${card.count} | +${card.reward}/sec | Cost: ${formatNumber(card.cost)} MP`;
}

function updateCooldowns() {
  const now = Date.now();
  challengeCards.forEach((card) => {
    if (card.cooldownUntil) {
      const remaining = card.cooldownUntil - now;
      if (remaining <= 0) {
        card.cooldownUntil = null;
        card.button.disabled = false;
        card.cooldownDisplay.textContent = "";
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        card.cooldownDisplay.textContent = `Cooldown: ${minutes}:${seconds.toString().padStart(2, "0")}`;
      }
    }
  });
}

setInterval(updateCooldowns, 1000);

renderChallengeCards();
gameLoop();
