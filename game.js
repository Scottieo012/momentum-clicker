let momentum = 0;
let momentumPerSecond = 0;
let isHolding = false;
let lastUpdate = Date.now();
let selectedFilter = "All";

const momentumDisplay = document.getElementById("momentum");
const momentumRateDisplay = document.getElementById("momentumRate");
const challengeContainer = document.getElementById("challengeContainer");

function updateMomentumDisplay() {
  momentumDisplay.textContent = momentum.toFixed(2);
  momentumRateDisplay.textContent = `Momentum/sec: ${momentumPerSecond.toFixed(2)}`;
}

function updateChallenges() {
  challengeContainer.innerHTML = "";
  const now = Date.now();
  cards.forEach(card => {
    if (selectedFilter !== "All" && card.tag !== selectedFilter) return;

    const cost = card.baseCost * Math.pow(1.15, card.timesCompleted);
    const cardDiv = document.createElement("div");
    cardDiv.className = "challenge-card";

    const title = document.createElement("h3");
    title.textContent = card.title;
    const desc = document.createElement("p");
    desc.textContent = card.description;
    const costInfo = document.createElement("p");
    costInfo.textContent = `Cost: ${cost.toFixed(2)} MP`;
    const count = document.createElement("p");
    count.textContent = `Completed: ${card.timesCompleted}`;

    const button = document.createElement("button");
    button.textContent = "I did it";
    button.disabled = false;

    const timeRemaining = (card.cooldownEnd - now) / 1000;

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
      cd.textContent = `Cooldown: ${Math.ceil(timeRemaining)}s`;
      cardDiv.appendChild(cd);
    }

    button.onclick = () => {
      if (momentum >= cost && now >= card.cooldownEnd) {
        momentum -= cost;
        momentumPerSecond += card.multiplier;
        card.timesCompleted++;
        card.cooldownEnd = now + 5 * 60 * 1000;
        updateChallenges();
        updateMomentumDisplay();
      }
    };

    cardDiv.appendChild(title);
    cardDiv.appendChild(desc);
    cardDiv.appendChild(costInfo);
    cardDiv.appendChild(count);
    cardDiv.appendChild(button);
    challengeContainer.appendChild(cardDiv);
  });
}

function loop() {
  const now = Date.now();
  const delta = (now - lastUpdate) / 1000;
  lastUpdate = now;
  if (isHolding) momentum += delta;
  momentum += momentumPerSecond * delta;
  updateMomentumDisplay();
  updateChallenges();
  requestAnimationFrame(loop);
}

document.getElementById("earnButton").addEventListener("pointerdown", () => {
  isHolding = true;
});
document.getElementById("earnButton").addEventListener("pointerup", () => {
  isHolding = false;
});
document.getElementById("earnButton").addEventListener("pointerleave", () => {
  isHolding = false;
});

document.querySelectorAll("#filter-buttons button").forEach(button => {
  button.addEventListener("click", () => {
    selectedFilter = button.getAttribute("data-filter");
    updateChallenges();
  });
});

updateMomentumDisplay();
updateChallenges();
loop();
