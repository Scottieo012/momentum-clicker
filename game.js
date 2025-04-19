let momentum = 0;
let passiveGain = 0;
let held = false;
let lastUpdateTime = Date.now();
let challengeCompleted = false;

// Load saved data
window.onload = () => {
    const saved = localStorage.getItem("momentumData");
    if (saved) {
        const data = JSON.parse(saved);
        momentum = data.momentum || 0;
        passiveGain = data.passiveGain || 0;
        challengeCompleted = data.challengeCompleted || false;

        // If the tab was closed for a while, simulate offline progress
        if (data.lastUpdateTime) {
            const elapsed = (Date.now() - data.lastUpdateTime) / 1000;
            momentum += elapsed * passiveGain;
        }

        updateChallengeCard();
    }

    updateDisplay();
};

// Save data periodically and when tab is closed
function saveGame() {
    localStorage.setItem("momentumData", JSON.stringify({
        momentum,
        passiveGain,
        challengeCompleted,
        lastUpdateTime: Date.now()
    }));
}
setInterval(saveGame, 5000);
window.onbeforeunload = saveGame;

// Display update
function updateDisplay() {
    document.getElementById("momentumDisplay").innerText = momentum.toFixed(2);
}

// Hold-to-earn logic
const earnButton = document.getElementById("earnButton");
earnButton.addEventListener("mousedown", () => held = true);
earnButton.addEventListener("touchstart", () => held = true);
earnButton.addEventListener("mouseup", () => held = false);
earnButton.addEventListener("mouseleave", () => held = false);
earnButton.addEventListener("touchend", () => held = false);
earnButton.addEventListener("touchcancel", () => held = false);

// Momentum update loop
function gameLoop() {
    const now = Date.now();
    const delta = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    if (held) {
        momentum += 1 * delta;
    }

    if (passiveGain > 0) {
        momentum += passiveGain * delta;
    }

    updateDisplay();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// Challenge Card logic
function updateChallengeCard() {
    const cardButton = document.getElementById("challengeButton");
    if (challengeCompleted) {
        cardButton.disabled = true;
        cardButton.innerText = "Completed!";
    } else {
        cardButton.disabled = false;
        cardButton.innerText = "I did it!";
    }
}

document.getElementById("challengeButton").addEventListener("click", () => {
    if (!challengeCompleted) {
        challengeCompleted = true;
        passiveGain += 0.5;
        updateChallengeCard();
        saveGame();
    }
});
