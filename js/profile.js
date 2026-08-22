/* =========================================================
   STUDENTVERSE — PROFILE CONTROLLER & DATA MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initProfile();
    setupIdCard3DTilt();
    setupProfileForm();
    setupDataManagement();
    window.addEventListener('studentverse_state_changed', renderProfileDetails);
});

function initProfile() {
    renderProfileDetails();
}

function renderProfileDetails() {
    if (!window.StudentStore) return;
    const profile = window.StudentStore.getProfile();
    const academics = window.StudentStore.getAcademics();
    const wellness = window.StudentStore.getWellness();

    // 1. ID Card Elements
    const cardName = document.getElementById("holoCardName");
    const cardMajor = document.getElementById("holoCardMajor");
    const cardUniv = document.getElementById("holoCardUniv");
    const cardId = document.getElementById("holoCardId");
    const cardAvatar = document.getElementById("holoCardAvatar");
    const cardCgpa = document.getElementById("holoCardCgpa");
    const cardStreak = document.getElementById("holoCardStreak");

    if (cardName) cardName.textContent = profile.name;
    if (cardMajor) cardMajor.textContent = profile.major;
    if (cardUniv) cardUniv.textContent = profile.university;
    if (cardId) cardId.textContent = profile.studentId;
    if (cardAvatar) cardAvatar.textContent = profile.avatar || "⚡";
    if (cardCgpa) cardCgpa.textContent = academics.cgpa.toFixed(2);
    if (cardStreak) cardStreak.textContent = `${wellness.streakDays}d`;

    // 2. Form Inputs
    const formName = document.getElementById("profileNameInput");
    const formMajor = document.getElementById("profileMajorInput");
    const formUniv = document.getElementById("profileUnivInput");
    const formId = document.getElementById("profileIdInput");
    const formYear = document.getElementById("profileYearInput");
    const formAvatar = document.getElementById("profileAvatarInput");
    const formBio = document.getElementById("profileBioInput");
    const formEmail = document.getElementById("profileEmailInput");

    if (formName) formName.value = profile.name;
    if (formMajor) formMajor.value = profile.major;
    if (formUniv) formUniv.value = profile.university;
    if (formId) formId.value = profile.studentId;
    if (formYear) formYear.value = profile.year;
    if (formAvatar) formAvatar.value = profile.avatar || "⚡";
    if (formBio) formBio.value = profile.bio;
    if (formEmail) formEmail.value = profile.email;
}

function setupProfileForm() {
    const saveBtn = document.getElementById("saveProfileBtn");
    saveBtn?.addEventListener("click", () => {
        const name = document.getElementById("profileNameInput").value.trim();
        const major = document.getElementById("profileMajorInput").value.trim();
        const university = document.getElementById("profileUnivInput").value.trim();
        const studentId = document.getElementById("profileIdInput").value.trim();
        const year = document.getElementById("profileYearInput").value.trim();
        const avatar = document.getElementById("profileAvatarInput").value.trim() || "⚡";
        const bio = document.getElementById("profileBioInput").value.trim();
        const email = document.getElementById("profileEmailInput").value.trim();

        if (!name) {
            if (window.showToast) showToast("Name cannot be blank", "warning");
            return;
        }

        if (window.StudentStore) {
            window.StudentStore.updateProfile({ name, major, university, studentId, year, avatar, bio, email });
            if (window.showToast) showToast("Profile updated successfully! ✨", "success");
        }
    });
}

/* 3D Holographic ID Card Tilt */
function setupIdCard3DTilt() {
    const card = document.getElementById("holoIdCard");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
        if (window.innerWidth < 800) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = (x - rect.width / 2) / 14;
        const rotateX = (rect.height / 2 - y) / 14;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
}

/* Data Management (JSON Backup / Restore / Reset) */
function setupDataManagement() {
    // Export Backup
    document.getElementById("exportDataBtn")?.addEventListener("click", () => {
        if (!window.StudentStore) return;
        const data = window.StudentStore.exportJSON();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `studentverse_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        if (window.showToast) showToast("Backup file downloaded! 💾", "success");
    });

    // Import Backup
    const fileInput = document.getElementById("importFileInput");
    document.getElementById("importDataBtn")?.addEventListener("click", () => {
        fileInput?.click();
    });

    fileInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const res = window.StudentStore.importJSON(event.target.result);
            if (res.success) {
                if (window.showToast) showToast("Workspace data restored successfully! 🚀", "success");
                setTimeout(() => window.location.reload(), 800);
            } else {
                if (window.showToast) showToast(`Import failed: ${res.error}`, "warning");
            }
        };
        reader.readAsText(file);
    });

    // Reset Defaults
    document.getElementById("resetDataBtn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all data to default demo values?")) {
            window.StudentStore.resetToDefault();
            if (window.showToast) showToast("Workspace reset to defaults 🔄", "info");
            setTimeout(() => window.location.reload(), 600);
        }
    });
}
