
let momentum = 0;
let momentumPerSecond = 0;
let isHolding = false;
let lastUpdate = Date.now();
let selectedFilter = "All";
let lastSaveTime = 0;
let lastMomentumRounded = -1;

const tierCostConfig = {
  1: { baseCost: 15, scale: 1.15 },
  2: { baseCost: 100, scale: 1.15 },
  3: { baseCost: 1100, scale: 1.15 },
  4: { baseCost: 12000, scale: 1.15 },
  5: { baseCost: 130000, scale: 1.15 }
};

const tierRewardMap = {
  1: 1,
  2: 5,
  3: 20,
  4: 60,
  5: 200
};

function getTierCompletions(tier) {
  return cards
    .filter(c => c.tier === tier)
    .reduce((sum, c) => sum + (c.timesCompleted || 0), 0);
}

function getCardCost(card) {
  const tierConfig = tierCostConfig[card.tier];
  if (!tierConfig) return 0;

  const completionsInTier = getTierCompletions(card.tier);
  return tierConfig.baseCost * Math.pow(tierConfig.scale, completionsInTier);
}

function addShards(count) {
  const svg = document.querySelector(".momentum-overlay");
  svg.innerHTML = ""; // Clear previous shards

  for (let i = 0; i < count; i++) {
    const shard = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    shard.setAttribute("cx", "100");
    shard.setAttribute("cy", "100");
    shard.setAttribute("r", "6");
    shard.classList.add("shard");

    // Add unique animation delay via style attribute
    shard.style.animationDelay = `${(i * 360 / count) / 60}s`; // evenly spread

    svg.appendChild(shard);
  }
}

function updateShardCount() {
  let completedCount = 0;

  // Use in-memory card data instead of localStorage
  cards.forEach(card => {
    completedCount += card.timesCompleted || 0;
  });

  addShards(completedCount);
}


let momentumDisplay;
let momentumRateDisplay;
let challengeContainer;

function updateMomentumDisplay() {
  if (momentumDisplay && momentumRateDisplay) {
    momentumDisplay.textContent = momentum.toFixed(2);
    momentumRateDisplay.textContent = `per second: ${momentumPerSecond.toFixed(2)}`;
  } else {
    console.error("Momentum display DOM elements not initialized.");
  }
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
      momentum = data.momentum !== undefined ? data.momentum : 10; // Default to 10 MP if not present
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
      momentum = 10; // fallback to 10 MP
    }
  } else {
    // No save found — first-time player
    momentum = 10;
  }
}

function confirmResetGame() {
  const confirmReset = confirm("Are you sure you want to reset all progress? This cannot be undone.");
  if (confirmReset) {
    resetGame();
  }
}

function resetGame() {
  console.log("RESETTING GAME...");
  localStorage.clear();
  location.reload();
}

function getMostAffordableCard(filter) {
  const pool = filter === "All" ? cards : cards.filter(c => c.tag === filter);
  const now = Date.now();

  const affordableEnough = pool.filter(c => {
    const cost = getCardCost(c);
    return momentum >= cost * 0.5 && now >= c.cooldownEnd;
  });

  if (affordableEnough.length === 0) return null;

  const idx = Math.floor(Math.random() * affordableEnough.length);
  return affordableEnough[idx];
}

function getRandomCardsByFilter(filter, count = 3) {
  const pool = filter === "All" ? cards : cards.filter(c => c.tag === filter);
  const available = pool.filter(c => !c.hidden);
  const result = [];

  // Step 1: Try to add 1 affordable card first
  const affordableCard = getMostAffordableCard(filter);
  if (affordableCard) {
    result.push(affordableCard);

    // Remove it from available pool so it’s not duplicated
    const index = available.findIndex(c => c.id === affordableCard.id);
    if (index !== -1) available.splice(index, 1);
  }

  // Step 2: Add remaining random cards from available pool
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
    const tierLabel = document.createElement("p");
    tierLabel.className = "tier-label";
    tierLabel.textContent = `Tier ${card.tier}`;
    const desc = document.createElement("p");
    
    desc.textContent = card.description;
    const teaser = document.createElement("p");
    teaser.className = "teaser-text";
    teaser.textContent = card.teaser || "";
    teaser.style.display = "none";  // Hidden by default

    const costInfo = document.createElement("p");
    costInfo.className = "cost-info";
    const count = document.createElement("p");
    count.className = "completion-count";
    const reward = document.createElement("p");
    reward.className = "reward-info";
    reward.textContent = `Reward: +${tierRewardMap[card.tier]} MP/sec`;


    const button = document.createElement("button");
    button.textContent = "Did it";
    button.className = "action-button";

    button.addEventListener("click", () => {
      const cost = getCardCost(card);
      const now = Date.now();
      if (momentum >= cost && now >= card.cooldownEnd) {
        momentum -= cost;
        momentumPerSecond += tierRewardMap[card.tier];
        card.timesCompleted++;
        card.cooldownEnd = now + 60 * 60 * 1000;
        updateMomentumDisplay();
        updateShardCount();
        updateMomentumDisplay();
  renderAllCardsOnce();
  refreshCardStates();


        refreshCardStates();
        saveGame();
      }
    });
    
    // First row: Cost (left), Reward (right)
    const row1 = document.createElement("div");
    row1.className = "card-footer two-col-row";
    row1.appendChild(costInfo);
    row1.appendChild(reward);
    
    // Second row: Tier (left), Button (center), Completed (right)
    const row2 = document.createElement("div");
    row2.className = "card-footer three-col-row";
    row2.appendChild(tierLabel);
    row2.appendChild(button);
    row2.appendChild(count);

    cardDiv.appendChild(title);
    cardDiv.appendChild(desc);
    cardDiv.appendChild(teaser);
    cardDiv.appendChild(row1);
    cardDiv.appendChild(row2);

    challengeContainer.appendChild(cardDiv);
  });
}

function refreshCardStates() {
  const now = Date.now();
  visibleCards.forEach(card => {
    const cardDiv = document.querySelector(`.challenge-card[data-card-id='${card.id}']`);
    if (!cardDiv) return;

    const cost = getCardCost(card);
    const costInfo = cardDiv.querySelector(".cost-info");
    const count = cardDiv.querySelector(".completion-count");
    const desc = cardDiv.querySelector("p:not(.cost-info):not(.completion-count):not(.cooldown-timer):not(.teaser-text)");
    const teaser = cardDiv.querySelector(".teaser-text");
    const button = cardDiv.querySelector(".action-button");
    const tierLabel = cardDiv.querySelector(".tier-label");

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
      if (teaser && desc) {
        teaser.style.display = "block";
        desc.style.display = "none";
      }
      if (count) count.style.visibility = "hidden";
      if (tierLabel) tierLabel.style.visibility = "visible";
    }

      else if (momentum < cost) {
      cardDiv.classList.add("grayed-out");
      button.disabled = true;
      if (teaser && desc) {
        teaser.style.display = "none";
        desc.style.display = "block";
      }
      if (count) count.style.visibility = "visible";
      if (tierLabel) tierLabel.style.visibility = "visible";
      } 
    
      else if (now < card.cooldownEnd) {
      cardDiv.classList.add("grayed-out");
      button.disabled = true;
      const cd = document.createElement("p");
      cd.className = "cooldown-timer";
      cd.textContent = `Cooldown: ${Math.ceil(timeRemaining)}s`;
      cardDiv.appendChild(cd);
      if (teaser && desc) {
        teaser.style.display = "none";
        desc.style.display = "block";
      }
      if (count) count.style.visibility = "visible";
      if (tierLabel) tierLabel.style.visibility = "visible";
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
  
    if (now - lastSaveTime > 3000) { // only save every 3 seconds
      saveGame();
      lastSaveTime = now;
    }
  }


  requestAnimationFrame(loop);
}




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

document.addEventListener("DOMContentLoaded", () => {
  momentumDisplay = document.getElementById("momentum");
  momentumRateDisplay = document.getElementById("momentumRate");
  challengeContainer = document.getElementById("challengeContainer");

  const earnButton = document.getElementById("earnButton");

  earnButton.addEventListener("mousedown", () => {
    isHolding = true;
    earnButton.classList.add("holding");
  });

  earnButton.addEventListener("mouseup", () => {
    isHolding = false;
    earnButton.classList.remove("holding");
  });

  earnButton.addEventListener("mouseleave", () => {
    isHolding = false;
    earnButton.classList.remove("holding");
  });

  earnButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    isHolding = true;
    earnButton.classList.add("holding");
  });

  earnButton.addEventListener("touchend", () => {
    isHolding = false;
    earnButton.classList.remove("holding");
  });


  updateShardCount();
  loadGame();
  updateMomentumDisplay();
  renderAllCardsOnce();
  refreshCardStates();
  loop(); // Moved here to ensure button + listeners are active

});

