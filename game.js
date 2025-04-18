let points = parseFloat(localStorage.getItem('momentumPoints')) || 0;
let multiplier = parseFloat(localStorage.getItem('momentumMultiplier')) || 1;
let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];

const pointsDisplay = document.getElementById("points");
const clickerButton = document.getElementById("clicker");
const challengesContainer = document.getElementById("challenges");

let isHolding = false;
let passiveRate = 0;

// Handle holding down the button
clickerButton.addEventListener("mousedown", () => isHolding = true);
clickerButton.addEventListener("mouseup", () => isHolding = false);
clickerButton.addEventListener("mouseleave", () => isHolding = false);
clickerButton.addEventListener("touchstart", () => isHolding = true);
clickerButton.addEventListener("touchend", () => isHolding = false);

setInterval(() => {
  if (isHolding) {
    points += 1 * multiplier;
  }
  points += passiveRate;
  updateDisplay();
}, 1000);

function updateDisplay() {
  pointsDisplay.textContent = points.toFixed(1);
  localStorage.setItem('momentumPoints', points);
}

function saveChallenges() {
  localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
  localStorage.setItem('momentumMultiplier', multiplier);
  localStorage.setItem('passiveRate', passiveRate);
}

const savedRate = parseFloat(localStorage.getItem('passiveRate'));
if (!isNaN(savedRate)) {
  passiveRate = savedRate;
}

const challenges = [
  {
    id: "visualize",
    text: "Do a 5-minute visualization exercise.",
    multiplierBoost: 0.2
  },
  {
    id: "walk",
    text: "Take a 10-minute mindful walk.",
    multiplierBoost: 0.3
  },
  {
    id: "gratitude",
    text: "Write down 3 things you’re grateful for.",
    multiplierBoost: 0.5
  },
  {
    id: "passiveGen",
    text: "Sit in silence and focus on your breath for 5 minutes.",
    passiveBoost: 0.5
  }
];

function renderChallenges() {
  challengesContainer.innerHTML = "";
  challenges.forEach(ch => {
    const card = document.createElement("div");
    card.className = "challenge-card";
    if (completedChallenges.includes(ch.id)) card.classList.add("completed");

    card.innerHTML = `
      <p>${ch.text}</p>
      ${
        completedChallenges.includes(ch.id)
          ? `<strong>Completed!</strong>`
          : `<button class="complete-btn" onclick="completeChallenge('${ch.id}')">Mark Complete</button>`
      }
    `;
    challengesContainer.appendChild(card);
  });
}

window.completeChallenge = function (id) {
  const challenge = challenges.find(c => c.id === id);
  if (challenge && !completedChallenges.includes(id)) {
    completedChallenges.push(id);
    if (challenge.multiplierBoost) {
      multiplier += challenge.multiplierBoost;
    }
    if (challenge.passiveBoost) {
      passiveRate += challenge.passiveBoost;
    }
    saveChallenges();
    renderChallenges();
  }
};

updateDisplay();
renderChallenges();
