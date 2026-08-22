/* =========================================================
   STUDENTVERSE — TIMETABLE CONTROLLER
========================================================= */

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const TIMES = ["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00"];

let selectedKey = null;
let activeDayFilter = "ALL";

document.addEventListener("DOMContentLoaded", () => {
    initTimetable();
    setupSlotModal();
    window.addEventListener('studentverse_state_changed', renderGrid);
});

function initTimetable() {
    renderGrid();
    setupDayFilters();
}

function setupDayFilters() {
    document.querySelectorAll(".day-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeDayFilter = btn.dataset.day || "ALL";
            renderGrid();
        });
    });
}

function renderGrid() {
    const grid = document.getElementById("timetableMatrix");
    if (!grid || !window.StudentStore) return;

    grid.innerHTML = "";
    const timetable = window.StudentStore.getTimetable();

    const visibleDays = activeDayFilter === "ALL" ? DAYS : [activeDayFilter];
    grid.style.gridTemplateColumns = `90px repeat(${visibleDays.length}, minmax(160px, 1fr))`;

    // 1. Header Row
    const timeHead = document.createElement("div");
    timeHead.className = "tt-cell tt-header";
    timeHead.textContent = "TIME";
    grid.appendChild(timeHead);

    visibleDays.forEach(day => {
        const dayHead = document.createElement("div");
        dayHead.className = "tt-cell tt-header";
        dayHead.textContent = day;
        grid.appendChild(dayHead);
    });

    // 2. Time Rows
    TIMES.forEach(time => {
        const timeCell = document.createElement("div");
        timeCell.className = "tt-cell tt-time";
        timeCell.textContent = time;
        grid.appendChild(timeCell);

        visibleDays.forEach(day => {
            const key = `${day}-${time}`;
            const slot = timetable[key];

            const cell = document.createElement("div");
            cell.className = "tt-cell";

            if (slot) {
                cell.innerHTML = `
                    <div class="tt-slot-card tt-slot-${slot.color || 'cyan'}">
                        <div>
                            <div class="tt-slot-subject">${slot.subject}</div>
                            <div class="tt-slot-room">${slot.room || ''}</div>
                        </div>
                        <div class="tt-slot-prof">${slot.prof || ''}</div>
                    </div>
                `;
            } else {
                cell.innerHTML = `<span style="font-size:11px; color:var(--text-dim); display:flex; align-items:center; justify-content:center; height:100%;">+ Add</span>`;
            }

            cell.addEventListener("click", () => {
                openSlotModal(key, slot);
            });

            grid.appendChild(cell);
        });
    });
}

function setupSlotModal() {
    const modal = document.getElementById("slotModal");
    const closeBtn = document.getElementById("closeSlotModalBtn");
    const saveBtn = document.getElementById("saveSlotBtn");
    const deleteBtn = document.getElementById("deleteSlotBtn");

    if (!modal) return;

    closeBtn?.addEventListener("click", () => modal.classList.remove("show"));
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

    saveBtn?.addEventListener("click", () => {
        const subject = document.getElementById("slotSubjectInput").value.trim();
        const room = document.getElementById("slotRoomInput").value.trim();
        const prof = document.getElementById("slotProfInput").value.trim();
        const color = document.getElementById("slotColorInput").value;

        if (!subject) {
            if (window.showToast) showToast("Subject name is required", "warning");
            return;
        }

        if (window.StudentStore && selectedKey) {
            window.StudentStore.setTimetableSlot(selectedKey, { subject, room, prof, color });
            modal.classList.remove("show");
            if (window.showToast) showToast("Schedule updated! 📅", "success");
        }
    });

    deleteBtn?.addEventListener("click", () => {
        if (window.StudentStore && selectedKey) {
            window.StudentStore.setTimetableSlot(selectedKey, null);
            modal.classList.remove("show");
            if (window.showToast) showToast("Slot cleared", "info");
        }
    });
}

function openSlotModal(key, existingSlot) {
    selectedKey = key;
    const modal = document.getElementById("slotModal");
    if (!modal) return;

    const [day, time] = key.split('-');
    document.getElementById("slotModalTimeLabel").textContent = `${day} at ${time}`;

    document.getElementById("slotSubjectInput").value = existingSlot?.subject || "";
    document.getElementById("slotRoomInput").value = existingSlot?.room || "";
    document.getElementById("slotProfInput").value = existingSlot?.prof || "";
    document.getElementById("slotColorInput").value = existingSlot?.color || "cyan";

    const deleteBtn = document.getElementById("deleteSlotBtn");
    if (deleteBtn) {
        deleteBtn.style.display = existingSlot ? "inline-flex" : "none";
    }

    modal.classList.add("show");
}
