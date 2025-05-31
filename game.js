
let momentum = 0;
let momentumPerSecond = 0;
let isHolding = false;
let lastUpdate = Date.now();
let selectedFilter = "All";

let lastMomentumRounded = -1;

const momentumDisplay = document.getElementById("momentum");
const momentumRateDisplay = document.getElementById("momentumRate");
const challengeContainer = document.getElementById("challengeContainer");

function updateMomentumDisplay() {
  momentumDisplay.textContent = momentum.toFixed(2);
  momentumRateDisplay.textContent = `Momentum/sec: ${momentumPerSecond.toFixed(2)}`;
}

function saveGame() {
  const saveData = {
    momentum,
    momentumPerSecond,
    cards: cards.map(card => ({
      id: card.id,
      timesCompleted: card.timesCompleted,
      cooldownEnd: card.cooldownEnd
    }))
  };
  localStorage.setItem("momentumGameSave", JSON.stringify(saveData));
}

function loadGame() {
  const saved = localStorage.getItem("momentumGameSave");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      momentum = data.momentum || 0;
      momentumPerSecond = data.momentumPerSecond || 0;
      if (data.cards && Array.isArray(data.cards)) {
        data.cards.forEach(savedCard => {
          const card = cards.find(c => c.id === savedCard.id);
          if (card) {
            card.timesCompleted = savedCard.timesCompleted || 0;
            card.cooldownEnd = savedCard.cooldownEnd || 0;
          }
        });
      }
    } catch (e) {
      console.error("Failed to load save data:", e);
    }
  }
}

function getRandomCardsByFilter(filter, count = 3) {
  const filtered = filter === "All" ? cards : cards.filter(c => c.tag === filter);
  const available = filtered.filter(c => !c.hidden);
  const result = [];

  while (result.length < count && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available.splice(idx, 1)[0]);
  }

  return result;
}

let visibleCards = [];

function renderAllCardsOnce() {
  challengeContainer.innerHTML = "";
  visibleCards = getRandomCardsByFilter(selectedFilter, 3);

  visibleCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "challenge-card";
    cardDiv.setAttribute("data-card-id", card.id);

    const title = document.createElement("h3");
    title.textContent = card.title;
    const desc = document.createElement("p");
    desc.textContent = card.description;
    const costInfo = document.createElement("p");
    costInfo.className = "cost-info";
    const count = document.createElement("p");
    count.className = "completion-count";

    const button = document.createElement("button");
    button.textContent = "I did it";
    button.className = "action-button";

    button.addEventListener("click", () => {
      const cost = card.baseCost * Math.pow(1.15, card.timesCompleted);
      const now = Date.now();
      if (momentum >= cost && now >= card.cooldownEnd) {
        momentum -= cost;
        momentumPerSecond += card.multiplier;
        card.timesCompleted++;
        card.cooldownEnd = now + 5 * 60 * 1000;
        updateMomentumDisplay();
        refreshCardStates();
        saveGame();
      }
    });

    cardDiv.appendChild(title);
    cardDiv.appendChild(desc);
    cardDiv.appendChild(costInfo);
    cardDiv.appendChild(count);
    cardDiv.appendChild(button);
    challengeContainer.appendChild(cardDiv);
  });
}

function refreshCardStates() {
  const now = Date.now();
  visibleCards.forEach(card => {
    const cardDiv = document.querySelector(`.challenge-card[data-card-id='${card.id}']`);
    if (!cardDiv) return;

    const cost = card.baseCost * Math.pow(1.15, card.timesCompleted);
    const costInfo = cardDiv.querySelector(".cost-info");
    const count = cardDiv.querySelector(".completion-count");
    const button = cardDiv.querySelector(".action-button");

    cardDiv.classList.remove("blacked-out", "grayed-out");
    button.disabled = false;

    costInfo.textContent = `Cost: ${cost.toFixed(2)} MP`;
    count.textContent = `Completed: ${card.timesCompleted}`;

    const timeRemaining = (card.cooldownEnd - now) / 1000;
    const cooldownText = cardDiv.querySelector(".cooldown-timer");
    if (cooldownText) cooldownText.remove();

    if (momentum < cost * 0.5) {
      cardDiv.classList.add("blacked-out");
      button.disabled = true;
    } else if (momentum < cost) {
      cardDiv.classList.add("grayed-out");
      button.disabled = true;
    } else if (now < card.cooldownEnd) {
      cardDiv.classList.add("grayed-out");
      button.disabled = true;
      const cd = document.createElement("p");
      cd.className = "cooldown-timer";
      cd.textContent = `Cooldown: ${Math.ceil(timeRemaining)}s`;
      cardDiv.appendChild(cd);
    }
  });
}


function loop() {
  const now = Date.now();
  const delta = (now - lastUpdate) / 1000;
  lastUpdate = now;

  if (isHolding) momentum += delta;
  momentum += momentumPerSecond * delta;

  updateMomentumDisplay();

  const roundedMomentum = Math.floor(momentum);
  if (roundedMomentum !== lastMomentumRounded) {
    lastMomentumRounded = roundedMomentum;
    refreshCardStates();
    saveGame();
  }

  requestAnimationFrame(loop);
}

// Button events
document.getElementById("earnButton").addEventListener("pointerdown", () => {
  isHolding = true;
});
document.getElementById("earnButton").addEventListener("pointerup", () => {
  isHolding = false;
});
document.getElementById("earnButton").addEventListener("pointerleave", () => {
  isHolding = false;
});

// Filter buttons
document.querySelectorAll("#filter-buttons button").forEach(button => {
  button.addEventListener("click", () => {
    selectedFilter = button.getAttribute("data-filter");
    renderAllCardsOnce();
    refreshCardStates();
  });
});

document.getElementById("refreshCardsButton").addEventListener("click", () => {
  renderAllCardsOnce();
  refreshCardStates();
});

// Init
loadGame();
updateMomentumDisplay();
renderAllCardsOnce();
refreshCardStates();
loop();
