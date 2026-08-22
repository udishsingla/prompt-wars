/* =========================================================
   STUDENTVERSE — GOALS CONTROLLER
========================================================= */

let activeCategoryFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
    initGoals();
    setupAddGoalModal();
    window.addEventListener('studentverse_state_changed', renderGoals);
});

function initGoals() {
    renderGoals();
    setupCategoryTabs();
}

function setupCategoryTabs() {
    document.querySelectorAll(".category-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeCategoryFilter = tab.dataset.category || "ALL";
            renderGoals();
        });
    });
}

function renderGoals() {
    if (!window.StudentStore) return;
    const goals = window.StudentStore.getGoals();

    // 1. Calculate Stats
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const inProgressGoals = totalGoals - completedGoals;
    const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) : 0;

    const totalEl = document.getElementById("goalsTotal");
    const completedEl = document.getElementById("goalsCompleted");
    const inProgressEl = document.getElementById("goalsInProgress");
    const avgEl = document.getElementById("goalsAvg");

    if (totalEl) totalEl.textContent = totalGoals;
    if (completedEl) completedEl.textContent = completedGoals;
    if (inProgressEl) inProgressEl.textContent = inProgressGoals;
    if (avgEl) avgEl.textContent = `${avgProgress}%`;

    // 2. Filter & Render Cards
    const grid = document.getElementById("goalsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = activeCategoryFilter === "ALL" ? goals : goals.filter(g => g.category === activeCategoryFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-muted);">
                <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
                <div>No goals found in <strong>${activeCategoryFilter}</strong>. Click "+ Add Goal" above!</div>
            </div>
        `;
        return;
    }

    filtered.forEach(goal => {
        const card = document.createElement("div");
        card.className = "goal-card";

        const badgeClass = goal.category === 'ACADEMICS' ? 'badge-cyan' :
                           goal.category === 'PROJECT' ? 'badge-purple' :
                           goal.category === 'WELLNESS' ? 'badge-emerald' : 'badge-gold';

        card.innerHTML = `
            <div class="goal-card-top">
                <h4 class="goal-name">${goal.name}</h4>
                <span class="badge ${badgeClass}">${goal.category}</span>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
                    <span style="color:var(--text-muted)">Progress</span>
                    <strong style="color:var(--cyan)">${goal.progress}%</strong>
                </div>
                <div class="goal-slider-row">
                    <input type="range" min="0" max="100" value="${goal.progress}" class="goal-slider" data-id="${goal.id}">
                </div>
            </div>
            <div class="goal-actions">
                <div style="display:flex; gap:6px;">
                    <button class="goal-adjust-btn" onclick="adjustGoalProgress('${goal.id}', -10)">-10%</button>
                    <button class="goal-adjust-btn" onclick="adjustGoalProgress('${goal.id}', 10)">+10%</button>
                    <button class="goal-adjust-btn" onclick="adjustGoalProgress('${goal.id}', 100, true)">✓ Done</button>
                </div>
                <button class="goal-delete-btn" onclick="deleteGoal('${goal.id}')" title="Delete Goal">✕</button>
            </div>
        `;

        const slider = card.querySelector(".goal-slider");
        slider.addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            window.StudentStore.updateGoal(goal.id, { progress: val });
        });

        grid.appendChild(card);
    });
}

function adjustGoalProgress(id, delta, isAbsolute = false) {
    if (!window.StudentStore) return;
    const goals = window.StudentStore.getGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
        let newProgress = isAbsolute ? delta : Math.max(0, Math.min(100, goal.progress + delta));
        window.StudentStore.updateGoal(id, { progress: newProgress });
        if (newProgress >= 100 && window.showToast) {
            showToast(`Goal Completed: "${goal.name}"! 🚀`, "success");
        }
    }
}
window.adjustGoalProgress = adjustGoalProgress;

function deleteGoal(id) {
    if (!window.StudentStore) return;
    window.StudentStore.deleteGoal(id);
    if (window.showToast) showToast("Goal removed", "info");
}
window.deleteGoal = deleteGoal;

function setupAddGoalModal() {
    const modal = document.getElementById("addGoalModal");
    const openBtn = document.getElementById("openAddGoalBtn");
    const closeBtn = document.getElementById("closeAddGoalBtn");
    const saveBtn = document.getElementById("saveNewGoalBtn");

    if (!modal || !openBtn) return;

    openBtn.addEventListener("click", () => {
        document.getElementById("newGoalNameInput").value = "";
        document.getElementById("newGoalCategoryInput").value = "ACADEMICS";
        document.getElementById("newGoalProgressInput").value = 0;
        modal.classList.add("show");
    });

    closeBtn?.addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

    saveBtn?.addEventListener("click", () => {
        const name = document.getElementById("newGoalNameInput").value.trim();
        const category = document.getElementById("newGoalCategoryInput").value;
        const progress = parseInt(document.getElementById("newGoalProgressInput").value) || 0;

        if (!name) {
            if (window.showToast) showToast("Please enter a goal title", "warning");
            return;
        }

        window.StudentStore.addGoal({ name, category, progress });
        modal.classList.remove("show");
        if (window.showToast) showToast(`Goal "${name}" added! 🎯`, "success");
    });
}
