/* =========================================================
   STUDENTVERSE — WELLNESS CONTROLLER & POMODORO ENGINE
========================================================= */

let pomoInterval = null;
let pomoSecondsLeft = 25 * 60;
let pomoMode = "focus"; // focus, shortBreak, longBreak
let pomoIsRunning = false;

document.addEventListener("DOMContentLoaded", () => {
    initWellness();
    setupPomodoro();
    setupAmbientAudio();
    setupMoodEnergy();
    setupWaterTracker();
    window.addEventListener('studentverse_state_changed', updateWellnessDisplay);
});

function initWellness() {
    updateWellnessDisplay();
}

function updateWellnessDisplay() {
    if (!window.StudentStore) return;
    const wellness = window.StudentStore.getWellness();

    // 1. Mood Active Selection
    document.querySelectorAll(".mood-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mood === wellness.mood);
    });

    // 2. Energy Slider
    const energySlider = document.getElementById("energySlider");
    const energyVal = document.getElementById("energyValue");
    if (energySlider) energySlider.value = wellness.energy;
    if (energyVal) energyVal.textContent = `${wellness.energy}%`;

    // 3. Focus Minutes & Streak
    const focusMinsEl = document.getElementById("focusMinsToday");
    const streakEl = document.getElementById("streakDaysCount");
    if (focusMinsEl) focusMinsEl.textContent = `${wellness.focusMinutesToday}m`;
    if (streakEl) streakEl.textContent = `${wellness.streakDays} Days 🔥`;

    // 4. Water Progress
    renderWater(wellness.waterIntake, wellness.waterTarget);
}

/* =========================================================
   WORKING POMODORO TIMER
========================================================= */
function setupPomodoro() {
    const timerDisplay = document.getElementById("pomoDisplay");
    const playBtn = document.getElementById("pomoPlayBtn");
    const resetBtn = document.getElementById("pomoResetBtn");
    const modeBtns = document.querySelectorAll(".pomo-mode-btn");

    modeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            modeBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            pomoMode = btn.dataset.mode;

            if (pomoMode === "focus") pomoSecondsLeft = 25 * 60;
            else if (pomoMode === "shortBreak") pomoSecondsLeft = 5 * 60;
            else if (pomoMode === "longBreak") pomoSecondsLeft = 15 * 60;

            pausePomo();
            updateDisplay();
        });
    });

    playBtn?.addEventListener("click", () => {
        if (pomoIsRunning) {
            pausePomo();
        } else {
            startPomo();
        }
    });

    resetBtn?.addEventListener("click", () => {
        pausePomo();
        if (pomoMode === "focus") pomoSecondsLeft = 25 * 60;
        else if (pomoMode === "shortBreak") pomoSecondsLeft = 5 * 60;
        else if (pomoMode === "longBreak") pomoSecondsLeft = 15 * 60;
        updateDisplay();
    });

    function startPomo() {
        pomoIsRunning = true;
        if (playBtn) playBtn.textContent = "❚❚ Pause";
        pomoInterval = setInterval(() => {
            if (pomoSecondsLeft > 0) {
                pomoSecondsLeft--;
                updateDisplay();
            } else {
                completePomo();
            }
        }, 1000);
    }

    function pausePomo() {
        pomoIsRunning = false;
        clearInterval(pomoInterval);
        if (playBtn) playBtn.textContent = "▶ Start";
    }

    function completePomo() {
        pausePomo();
        if (window.SoundFX) window.SoundFX.playChime();
        if (pomoMode === "focus" && window.StudentStore) {
            window.StudentStore.logFocusMinutes(25);
        }
        if (window.showToast) {
            showToast(pomoMode === "focus" ? "Focus session complete! Take a break ☕" : "Break over! Ready to focus? 🚀", "success");
        }
    }

    function updateDisplay() {
        const mins = Math.floor(pomoSecondsLeft / 60).toString().padStart(2, '0');
        const secs = (pomoSecondsLeft % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    }
}

/* =========================================================
   AMBIENT AUDIO GENERATOR
========================================================= */
function setupAmbientAudio() {
    document.querySelectorAll(".ambient-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.sound;
            const wasActive = btn.classList.contains("active");

            document.querySelectorAll(".ambient-btn").forEach(b => b.classList.remove("active"));

            if (!wasActive && window.SoundFX) {
                btn.classList.add("active");
                window.SoundFX.playAmbient(type);
                if (window.showToast) showToast(`Playing ${type} ambient noise 🎧`, "info", 2000);
            } else if (window.SoundFX) {
                window.SoundFX.stopAmbient();
            }
        });
    });
}

/* =========================================================
   MOOD & ENERGY
========================================================= */
function setupMoodEnergy() {
    document.querySelectorAll(".mood-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const mood = btn.dataset.mood;
            if (window.StudentStore) {
                window.StudentStore.updateWellness({ mood });
                if (window.showToast) showToast(`Mood logged: ${mood} ✨`, "success", 2000);
            }
        });
    });

    const energySlider = document.getElementById("energySlider");
    energySlider?.addEventListener("input", (e) => {
        const energy = parseInt(e.target.value);
        document.getElementById("energyValue").textContent = `${energy}%`;
        if (window.StudentStore) {
            window.StudentStore.updateWellness({ energy });
        }
    });
}

/* =========================================================
   WATER INTAKE TRACKER
========================================================= */
function setupWaterTracker() {
    document.getElementById("addWater250Btn")?.addEventListener("click", () => {
        if (window.StudentStore) {
            window.StudentStore.addWater(250);
            if (window.showToast) showToast("+250ml logged 💧", "info", 1800);
        }
    });

    document.getElementById("addWater500Btn")?.addEventListener("click", () => {
        if (window.StudentStore) {
            window.StudentStore.addWater(500);
            if (window.showToast) showToast("+500ml logged 💧", "info", 1800);
        }
    });

    document.getElementById("resetWaterBtn")?.addEventListener("click", () => {
        if (window.StudentStore) {
            window.StudentStore.resetWater();
            if (window.showToast) showToast("Water intake reset", "info", 1800);
        }
    });
}

function renderWater(intake, target) {
    const textEl = document.getElementById("waterAmountText");
    const progressEl = document.getElementById("waterRingProgress");
    if (!textEl || !progressEl) return;

    textEl.textContent = `${intake}ml`;
    const percent = Math.min(1, intake / target);
    const circumference = 377; // 2 * pi * 60
    const offset = circumference - (percent * circumference);
    progressEl.style.strokeDashoffset = offset;
}
