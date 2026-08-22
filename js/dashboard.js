/* =========================================================
   STUDENTVERSE — DASHBOARD CONTROLLER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
    window.addEventListener('studentverse_state_changed', renderDashboard);
    init3DTilt();
});

function renderDashboard() {
    if (!window.StudentStore) return;

    const state = window.StudentStore.loadState();
    const profile = state.profile;
    const academics = state.academics;
    const goals = state.goals;
    const timetable = state.timetable;
    const wellness = state.wellness;
    const activities = state.activities || [];

    // 1. Hero Greeting
    const greetingEl = document.getElementById("dashGreeting");
    if (greetingEl) {
        greetingEl.textContent = `Welcome back, ${profile.name.split(' ')[0]} 🚀`;
    }

    // 2. Metrics Cards
    const cgpaEl = document.getElementById("metricCgpa");
    if (cgpaEl) cgpaEl.textContent = academics.cgpa.toFixed(2);

    const coursesCountEl = document.getElementById("metricCourses");
    if (coursesCountEl) coursesCountEl.textContent = academics.courses.length;

    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const goalsCountEl = document.getElementById("metricGoals");
    if (goalsCountEl) goalsCountEl.textContent = `${completedGoals}/${goals.length}`;

    const wellnessScoreEl = document.getElementById("metricWellness");
    if (wellnessScoreEl) {
        const score = Math.round((wellness.energy + Math.min(100, (wellness.waterIntake / wellness.waterTarget) * 100)) / 2);
        wellnessScoreEl.textContent = `${score}%`;
    }

    // 3. Today's Classes List
    const daysMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = daysMap[new Date().getDay()] || "MON";
    const dayToQuery = (currentDay === "SAT" || currentDay === "SUN") ? "MON" : currentDay;

    const scheduleListEl = document.getElementById("todayScheduleList");
    if (scheduleListEl) {
        scheduleListEl.innerHTML = "";
        const daySlots = Object.entries(timetable).filter(([key]) => key.startsWith(dayToQuery));

        if (daySlots.length === 0) {
            scheduleListEl.innerHTML = `
                <div style="padding:20px; text-align:center; color:var(--text-muted); font-size:13px;">
                    No classes scheduled for today (${dayToQuery})! ✨ Relax or work on your goals.
                </div>
            `;
        } else {
            daySlots.sort().forEach(([key, slot]) => {
                const time = key.split('-')[1];
                const item = document.createElement("div");
                item.className = "schedule-item";
                item.innerHTML = `
                    <div class="schedule-time">${time}</div>
                    <div class="schedule-info">
                        <div class="schedule-name">${slot.subject}</div>
                        <div class="schedule-meta">${slot.room} • ${slot.prof}</div>
                    </div>
                    <span class="badge badge-${slot.color || 'cyan'}">${slot.color || 'Live'}</span>
                `;
                scheduleListEl.appendChild(item);
            });
        }
    }

    // 4. Workload Animated Bars
    setTimeout(() => {
        const bars = document.querySelectorAll(".bar-fill");
        bars.forEach(bar => {
            const height = bar.dataset.height || "65%";
            bar.style.height = height;
        });
    }, 400);

    // 5. Recent Activity List
    const activityListEl = document.getElementById("recentActivityList");
    if (activityListEl) {
        activityListEl.innerHTML = "";
        const list = activities.slice(0, 4);
        list.forEach(act => {
            const item = document.createElement("div");
            item.className = "activity-item";
            item.innerHTML = `
                <div class="activity-dot"></div>
                <div class="activity-text">${act.text}</div>
                <div class="activity-time">${act.time}</div>
            `;
            activityListEl.appendChild(item);
        });
    }
}

/* 3D Tilt Card Interaction */
function init3DTilt() {
    const cards = document.querySelectorAll(".stat-card, .panel");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            if (window.innerWidth < 800) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = (x - rect.width / 2) / 35;
            const rotateX = (rect.height / 2 - y) / 35;
            card.style.transform = `perspective(900px) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}
