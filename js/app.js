/* =========================================================
   STUDENTVERSE — GLOBAL APPLICATION CONTROLLER
   Unified Layout, Command Palette, Toasts & PWA
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. Dismiss Loader smoothly
    const loader = document.getElementById("pageLoader") || document.getElementById("loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("hide");
        }, 500);
    }

    // 2. Setup Topbar Live Clock
    initClock();

    // 3. Sync User Profile in Mini Card & Topbar
    syncProfileUI();
    window.addEventListener('studentverse_state_changed', syncProfileUI);

    // 4. Setup Mobile Sidebar & Overlay
    setupMobileSidebar();

    // 5. Setup Command Palette (Ctrl+K)
    setupCommandPalette();

    // 6. Register Service Worker for PWA
    registerPWA();

    // 7. Click Sound FX on interactive elements
    document.querySelectorAll("button, .nav-item, .category-tab, .day-btn").forEach(el => {
        el.addEventListener("click", () => {
            if (window.SoundFX) window.SoundFX.playClick();
        });
    });
}

/* =========================================================
   LIVE CLOCK
========================================================= */
function initClock() {
    const clockEl = document.getElementById("topbarClock");
    if (!clockEl) return;

    function update() {
        const now = new Date();
        const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        clockEl.textContent = now.toLocaleDateString('en-US', opts);
    }
    update();
    setInterval(update, 1000);
}

/* =========================================================
   PROFILE UI SYNC
========================================================= */
function syncProfileUI() {
    if (!window.StudentStore) return;
    const profile = window.StudentStore.getProfile();

    // Mini Sidebar
    const miniName = document.getElementById("sidebarProfileName");
    const miniAvatar = document.getElementById("sidebarProfileAvatar");
    const miniRole = document.getElementById("sidebarProfileRole");

    if (miniName) miniName.textContent = profile.name;
    if (miniAvatar) miniAvatar.textContent = profile.avatar || "⚡";
    if (miniRole) miniRole.textContent = profile.major || profile.role;

    // Welcome Greeting if present
    const greetingName = document.getElementById("greetingUserName");
    if (greetingName) {
        greetingName.textContent = profile.name.split(' ')[0];
    }
}

/* =========================================================
   MOBILE SIDEBAR DRAWER
========================================================= */
function setupMobileSidebar() {
    const mobileBtn = document.getElementById("mobileMenuBtn") || document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay") || document.getElementById("overlay");

    if (!mobileBtn || !sidebar || !overlay) return;

    mobileBtn.addEventListener("click", () => {
        sidebar.classList.add("open");
        overlay.classList.add("show");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
    });
}

/* =========================================================
   TOAST NOTIFICATION ENGINE
========================================================= */
function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "✨";
    if (type === 'success') icon = "✓";
    if (type === 'warning') icon = "⚠";

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    // Play chime on success
    if (type === 'success' && window.SoundFX) {
        window.SoundFX.playChime();
    }

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duration);
}
window.showToast = showToast;

/* =========================================================
   GLOBAL COMMAND PALETTE (CTRL + K / CMD + K)
========================================================= */
function setupCommandPalette() {
    let palette = document.getElementById("commandPalette");
    if (!palette) {
        palette = document.createElement("div");
        palette.id = "commandPalette";
        palette.className = "modal-backdrop";
        palette.innerHTML = `
            <div class="modal-card">
                <div class="cmd-search-box">
                    <span style="color:var(--cyan); font-size:18px;">⚡</span>
                    <input type="text" id="cmdInput" placeholder="Type a command, page name, or quick action..." autocomplete="off">
                    <span class="kbd-shortcut">ESC</span>
                </div>
                <div class="cmd-results" id="cmdResults">
                    <!-- Populated dynamically -->
                </div>
                <div class="cmd-footer">
                    <span>Navigation: <strong>↑ ↓</strong></span>
                    <span>Select: <strong>ENTER</strong></span>
                    <span>Close: <strong>ESC</strong></span>
                </div>
            </div>
        `;
        document.body.appendChild(palette);
    }

    const input = document.getElementById("cmdInput");
    const results = document.getElementById("cmdResults");

    const commands = [
        { title: "Dashboard Overview", group: "Navigation", icon: "⌂", url: "dashboard.html", hint: "Go to Main Hub" },
        { title: "Academics & GPA Tracker", group: "Navigation", icon: "▣", url: "academics.html", hint: "View Courses & Grades" },
        { title: "Weekly Timetable", group: "Navigation", icon: "▦", url: "timetable.html", hint: "View Schedule Matrix" },
        { title: "Goals & Milestones", group: "Navigation", icon: "◎", url: "goals.html", hint: "Manage Progress & Tasks" },
        { title: "Wellness & Focus Pomodoro", group: "Navigation", icon: "◌", url: "wellness.html", hint: "Mood, Energy & Timer" },
        { title: "Student Profile & 3D ID Card", group: "Navigation", icon: "○", url: "profile.html", hint: "View ID & Settings" },
        { title: "Log 250ml Water", group: "Quick Action", icon: "💧", action: () => { window.StudentStore.addWater(250); showToast("Added 250ml water intake 💧", "success"); } },
        { title: "Start Pomodoro Focus", group: "Quick Action", icon: "⏱", url: "wellness.html" },
        { title: "Export Data Backup (JSON)", group: "System", icon: "💾", action: () => {
            const data = window.StudentStore.exportJSON();
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `studentverse_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            showToast("Backup exported successfully! 💾", "success");
        }}
    ];

    let selectedIdx = 0;

    function renderList(query = "") {
        const filtered = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.group.toLowerCase().includes(query.toLowerCase()));
        results.innerHTML = "";

        if (filtered.length === 0) {
            results.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:13px;">No commands matching "${query}"</div>`;
            return;
        }

        let currentGroup = "";
        filtered.forEach((cmd, idx) => {
            if (cmd.group !== currentGroup) {
                currentGroup = cmd.group;
                const grpHeader = document.createElement("div");
                grpHeader.className = "cmd-group-title";
                grpHeader.textContent = currentGroup;
                results.appendChild(grpHeader);
            }

            const item = document.createElement("div");
            item.className = `cmd-item ${idx === selectedIdx ? 'selected' : ''}`;
            item.innerHTML = `
                <span class="cmd-item-icon">${cmd.icon}</span>
                <span class="cmd-item-text">${cmd.title}</span>
                <span class="cmd-item-hint">${cmd.hint || ''}</span>
            `;

            item.addEventListener("click", () => {
                executeCommand(cmd);
            });

            item.addEventListener("mouseenter", () => {
                selectedIdx = idx;
                updateSelection();
            });

            results.appendChild(item);
        });
    }

    function updateSelection() {
        const items = results.querySelectorAll(".cmd-item");
        items.forEach((item, idx) => {
            item.classList.toggle("selected", idx === selectedIdx);
        });
    }

    function executeCommand(cmd) {
        closePalette();
        if (cmd.action) {
            cmd.action();
        } else if (cmd.url) {
            window.location.href = cmd.url;
        }
    }

    function openPalette() {
        palette.classList.add("show");
        selectedIdx = 0;
        input.value = "";
        renderList();
        setTimeout(() => input.focus(), 50);
    }

    function closePalette() {
        palette.classList.remove("show");
    }

    // Keyboard trigger
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (palette.classList.contains("show")) {
                closePalette();
            } else {
                openPalette();
            }
        } else if (e.key === "Escape" && palette.classList.contains("show")) {
            closePalette();
        } else if (palette.classList.contains("show")) {
            const items = results.querySelectorAll(".cmd-item");
            if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedIdx = (selectedIdx + 1) % items.length;
                updateSelection();
                items[selectedIdx]?.scrollIntoView({ block: "nearest" });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedIdx = (selectedIdx - 1 + items.length) % items.length;
                updateSelection();
                items[selectedIdx]?.scrollIntoView({ block: "nearest" });
            } else if (e.key === "Enter") {
                e.preventDefault();
                const filtered = commands.filter(c => c.title.toLowerCase().includes(input.value.toLowerCase()));
                if (filtered[selectedIdx]) {
                    executeCommand(filtered[selectedIdx]);
                }
            }
        }
    });

    input.addEventListener("input", (e) => {
        selectedIdx = 0;
        renderList(e.target.value);
    });

    palette.addEventListener("click", (e) => {
        if (e.target === palette) closePalette();
    });

    // Topbar Search Buttons trigger
    document.querySelectorAll(".search-command-btn").forEach(btn => {
        btn.addEventListener("click", openPalette);
    });
}

/* =========================================================
   PWA SERVICE WORKER REGISTRATION
========================================================= */
function registerPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('StudentVerse ServiceWorker active:', reg.scope))
            .catch(err => console.warn('ServiceWorker registration error:', err));
    }
}
