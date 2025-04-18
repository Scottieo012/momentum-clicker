let momentum = 0;
let momentumRate = 1; // Starting rate per second from holding
let passiveRate = 0; // Passive gain from completed challenges
let holding = false;
let lastUpdateTime = Date.now();

// Load saved data
window.onload = function () {
  const savedMomentum = localStorage.getItem('momentum');
  const savedPassiveRate = localStorage.getItem('passiveRate');
  if (savedMomentum) momentum = parseFloat(savedMomentum);
  if (savedPassiveRate) passiveRate = parseFloat(savedPassiveRate);
  updateMomentumDisplay();
  generateChallenges();
};

// Update momentum smoothly
function update() {
  const now = Date.now();
  const delta = (now - lastUpdateTime) / 1000;

  if (holding) {
    momentum += momentumRate * delta;
  }

  if (passiveRate > 0) {
    momentum += passiveRate * delta;
  }

  updateMomentumDisplay();
  lastUpdateTime = now;
  requestAnimationFrame(update);
}

function updateMomentumDisplay() {
  document.getElementById('momentum').textContent = momentum.toFixed(2);
  localStorage.setItem('momentum', momentum.toFixed(2));
  localStorage.setItem('passiveRate', passiveRate.toFixed(2));
}

// Hold-to-earn logic
const holdButton = document.getElementById('holdButton');
holdButton.addEventListener('mousedown', () => { holding = true; });
holdButton.addEventListener('mouseup', () => { holding = false; });
holdButton.addEventListener('mouseleave', () => { holding = false; });
holdButton.addEventListener('touchstart', (e) => {
  e.preventDefault();
  holding = true;
});
holdButton.addEventListener('touchend', () => { holding = false; });

// Challenge system
const challenges = [
  {
    title: "Do 1 set of pushups",
    description: "Complete a set of pushups and click 'I did it!' to gain passive momentum.",
    reward: () => { passiveRate += 0.5; },
    completed: false
  }
];

function generateChallenges() {
  const challengeContainer = document.getElementById('challenges');
  challengeContainer.innerHTML = '';

  challenges.forEach((challenge, index) => {
    if (challenge.completed) return;

    const card = document.createElement('div');
    card.className = 'challenge-card';

    const title = document.createElement('h3');
    title.textContent = challenge.title;

    const desc = document.createElement('p');
    desc.textContent = challenge.description;

    const button = document.createElement('button');
    button.textContent = "I did it!";
    button.addEventListener('click', () => {
      challenge.reward();
      challenge.completed = true;
      generateChallenges();
    });

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(button);

    challengeContainer.appendChild(card);
  });
}

requestAnimationFrame(update);
