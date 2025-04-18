let momentum = 0;
let holding = false;
let passiveGain = 0;
let lastUpdateTime = Date.now();

// Passive gain while game is closed
window.addEventListener("load", () => {
    const savedTime = localStorage.getItem("lastClosedTime");
    const savedMomentum = parseFloat(localStorage.getItem("momentum")) || 0;

    if (savedTime) {
        const timeDiff = Math.floor((Date.now() - parseInt(savedTime)) / 1000);
        const offlineGain = timeDiff * passiveGain;
        momentum = savedMomentum + offlineGain;
    } else {
        momentum = savedMomentum;
    }

    document.getElementById("momentumCount").textContent = momentum.toFixed(2);
});

window.addEventListener("beforeunload", () => {
    localStorage.setItem("momentum", momentum.toString());
    localStorage.setItem("lastClosedTime", Date.now().toString());
});

document.getElementById("momentumButton").addEventListener("mousedown", () => holding = true);
document.getElementById("momentumButton").addEventListener("mouseup", () => holding = false);
document.getElementById("momentumButton").addEventListener("mouseleave", () => holding = false);

// Momentum logic: earns points every 1000ms (1 point per second at base)
setInterval(() => {
    if (holding) {
        momentum += 1;
    }
    momentum += passiveGain;
}, 1000);

// Score display updates more frequently for smoother feel
setInterval(() => {
    document.getElementById("momentumCount").textContent = momentum.toFixed(2);
}, 100);
