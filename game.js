let momentum = 0;
let passiveMomentumPerSecond = 0;
let isEarning = false;
let earnInterval;
const cooldowns = {};

function updateMomentumDisplay() {
  document.getElementById('momentum').textContent = momentum.toFixed(2);
}

function updateMomentumRateDisplay() {
  document.getElementById('momentumRate').textContent = passiveMomentumPerSecond.toFixed(2);
}

function startEarning() {
  if (isEarning) return;
  isEarning = true;
  earnInterval = setInterval(() => {
    momentum += 1;
    updateMomentumDisplay();
  }, 1000);
}

function stopEarning() {
  isEarning = false;
  clearInterval(earnInterval);
}

function createChallengeCard(card, index) {
  const container = document.getElementById('challengeContainer');
  const cardDiv = document.createElement('div');
  cardDiv.className = 'challenge-card';
  cardDiv.id = `card-${index}`;

  const title = document.createElement('h3');
  title.textContent = card.title;

  const description = document.createElement('p');
  description.textContent = card.description;

  const cost = document.createElement('p');
  cost.id = `cost-${index}`;
  cost.textContent = `Cost: ${card.cost.toFixed(2)} MP`;

  const count = document.createElement('p');
  count.id = `count-${index}`;
  count.textContent = `Completed: ${card.completed}`;

  const button = document.createElement('button');
  button.textContent = "I did it!";
  button.disabled = false;

  const cooldownTimer = document.createElement('p');
  cooldownTimer.id = `cooldown-${index}`;
  cooldownTimer.className = 'cooldown-timer';

  button.addEventListener('click', () => {
    if (cooldowns[index]) return;

    if (momentum >= card.cost) {
      momentum -= card.cost;
      card.completed += 1;
      passiveMomentumPerSecond += card.reward;
      card.cost *= 1.1;

      updateMomentumDisplay();
      updateMomentumRateDisplay();
      cost.textContent = `Cost: ${card.cost.toFixed(2)} MP`;
      count.textContent = `Completed: ${card.completed}`;

      // Start 5-minute cooldown
      button.disabled = true;
      let remaining = 300; // seconds
      cooldowns[index] = setInterval(() => {
        if (remaining > 0) {
          cooldownTimer.textContent = `Cooldown: ${remaining}s`;
          remaining--;
        } else {
          clearInterval(cooldowns[index]);
          cooldowns[index] = null;
          cooldownTimer.textContent = '';
          button.disabled = false;
        }
      }, 1000);
    }
  });

  cardDiv.appendChild(title);
  cardDiv.appendChild(description);
  cardDiv.appendChild(cost);
  cardDiv.appendChild(count);
  cardDiv.appendChild(button);
  cardDiv.appendChild(cooldownTimer);
  container.appendChild(cardDiv);
}

function loadChallengeCards() {
  challengeCards.forEach((card, index) => {
    createChallengeCard(card, index);
  });
}

function passiveEarningLoop() {
  setInterval(() => {
    momentum += passiveMomentumPerSecond;
    updateMomentumDisplay();
  }, 1000);
}

window.onload = () => {
  updateMomentumDisplay();
  updateMomentumRateDisplay();
  loadChallengeCards();
  passiveEarningLoop();

  const button = document.getElementById('earnButton');

  // Desktop mouse events
  button.addEventListener('mousedown', startEarning);
  document.addEventListener('mouseup', stopEarning);

  // Mobile touch events
  button.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents triggering text selection or zoom
    startEarning();
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopEarning();
  }, { passive: false });
};
