/* =========================================================
   STUDENTVERSE — ACADEMICS CONTROLLER & GPA CALCULATOR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    renderAcademics();
    setupGpaCalculator();
    window.addEventListener('studentverse_state_changed', renderAcademics);
});

function renderAcademics() {
    if (!window.StudentStore) return;
    const academics = window.StudentStore.getAcademics();

    // 1. GPA Stats
    const cgpaEl = document.getElementById("acadCgpa");
    if (cgpaEl) cgpaEl.textContent = academics.cgpa.toFixed(2);

    const semGpaEl = document.getElementById("acadSemGpa");
    if (semGpaEl) semGpaEl.textContent = academics.semesterGpa.toFixed(2);

    const creditsEl = document.getElementById("acadCredits");
    if (creditsEl) creditsEl.textContent = academics.totalCredits;

    const rankEl = document.getElementById("acadRank");
    if (rankEl) rankEl.textContent = `#${academics.majorRank} / 120`;

    // 2. Render Courses
    const coursesGrid = document.getElementById("coursesGrid");
    if (!coursesGrid) return;
    coursesGrid.innerHTML = "";

    academics.courses.forEach(course => {
        const card = document.createElement("div");
        card.className = "course-card";

        const syllabusHtml = course.syllabus.map((s, idx) => `
            <div class="syllabus-item ${s.done ? 'completed' : ''}" onclick="toggleTopic('${course.id}', ${idx})">
                <div class="syllabus-checkbox">${s.done ? '✓' : ''}</div>
                <span>${s.title}</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="course-top">
                <span class="course-code">${course.code}</span>
                <span class="badge badge-purple">${course.credits} Credits • Grade: ${course.grade}</span>
            </div>
            <div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-instructor">👨‍🏫 ${course.instructor}</p>
            </div>
            <div class="course-progress-section">
                <div class="progress-labels">
                    <span>Syllabus Coverage</span>
                    <strong>${course.progress}%</strong>
                </div>
                <div class="progress-bar-track">
                    <div class="progress-bar-fill" style="width: ${course.progress}%;"></div>
                </div>
            </div>
            <div class="syllabus-list">
                ${syllabusHtml}
            </div>
        `;
        coursesGrid.appendChild(card);
    });
}

function toggleTopic(courseId, index) {
    if (window.StudentStore) {
        window.StudentStore.toggleSyllabusTopic(courseId, index);
        if (window.showToast) {
            showToast("Topic progress updated! ✨", "success");
        }
    }
}
window.toggleTopic = toggleTopic;

/* =========================================================
   GPA CALCULATOR MODAL
========================================================= */
function setupGpaCalculator() {
    const calcModal = document.getElementById("gpaCalcModal");
    const openBtn = document.getElementById("openGpaCalcBtn");
    const closeBtn = document.getElementById("closeGpaCalcBtn");
    const addRowBtn = document.getElementById("addCalcRowBtn");
    const tableBody = document.getElementById("calcTableBody");
    const applyBtn = document.getElementById("applyGpaBtn");

    if (!calcModal || !openBtn) return;

    openBtn.addEventListener("click", () => {
        populateCalcFromStore();
        calcModal.classList.add("show");
    });

    closeBtn?.addEventListener("click", () => {
        calcModal.classList.remove("show");
    });

    calcModal.addEventListener("click", (e) => {
        if (e.target === calcModal) calcModal.classList.remove("show");
    });

    addRowBtn?.addEventListener("click", () => {
        addCalcRow("New Subject", 3, "A");
        calculateLiveGpa();
    });

    applyBtn?.addEventListener("click", () => {
        const calculated = calculateLiveGpa();
        if (window.StudentStore) {
            window.StudentStore.state.academics.semesterGpa = calculated.semGpa;
            window.StudentStore.state.academics.cgpa = calculated.projectedCgpa;
            window.StudentStore.saveState();
            calcModal.classList.remove("show");
            if (window.showToast) {
                showToast(`New GPA calculated & saved: ${calculated.semGpa} 🎯`, "success");
            }
        }
    });

    function populateCalcFromStore() {
        const academics = window.StudentStore.getAcademics();
        tableBody.innerHTML = "";
        academics.courses.forEach(c => {
            addCalcRow(c.title, c.credits, c.grade);
        });
        calculateLiveGpa();
    }

    function addCalcRow(name = "", credits = 3, grade = "A") {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="text" class="form-input row-name" value="${name}" style="padding:6px 10px; font-size:12px;"></td>
            <td>
                <select class="form-select row-credits" style="padding:6px 10px; font-size:12px;">
                    <option value="1" ${credits==1?'selected':''}>1</option>
                    <option value="2" ${credits==2?'selected':''}>2</option>
                    <option value="3" ${credits==3?'selected':''}>3</option>
                    <option value="4" ${credits==4?'selected':''}>4</option>
                    <option value="5" ${credits==5?'selected':''}>5</option>
                </select>
            </td>
            <td>
                <select class="form-select row-grade" style="padding:6px 10px; font-size:12px;">
                    <option value="A+" ${grade=='A+'?'selected':''}>A+ (4.0)</option>
                    <option value="A" ${grade=='A'?'selected':''}>A (4.0)</option>
                    <option value="A-" ${grade=='A-'?'selected':''}>A- (3.7)</option>
                    <option value="B+" ${grade=='B+'?'selected':''}>B+ (3.3)</option>
                    <option value="B" ${grade=='B'?'selected':''}>B (3.0)</option>
                    <option value="B-" ${grade=='B-'?'selected':''}>B- (2.7)</option>
                    <option value="C+" ${grade=='C+'?'selected':''}>C+ (2.3)</option>
                    <option value="C" ${grade=='C'?'selected':''}>C (2.0)</option>
                    <option value="D" ${grade=='D'?'selected':''}>D (1.0)</option>
                    <option value="F" ${grade=='F'?'selected':''}>F (0.0)</option>
                </select>
            </td>
            <td style="text-align:center;"><span class="calc-row-delete">✕</span></td>
        `;

        row.querySelector(".calc-row-delete").addEventListener("click", () => {
            row.remove();
            calculateLiveGpa();
        });

        row.querySelectorAll("input, select").forEach(el => {
            el.addEventListener("change", calculateLiveGpa);
            el.addEventListener("input", calculateLiveGpa);
        });

        tableBody.appendChild(row);
    }

    function calculateLiveGpa() {
        const gradeMap = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0 };
        let totalPts = 0;
        let totalCreds = 0;

        tableBody.querySelectorAll("tr").forEach(row => {
            const credits = parseFloat(row.querySelector(".row-credits").value) || 0;
            const grade = row.querySelector(".row-grade").value;
            const pts = gradeMap[grade] !== undefined ? gradeMap[grade] : 4.0;

            totalPts += pts * credits;
            totalCreds += credits;
        });

        const semGpa = totalCreds > 0 ? parseFloat((totalPts / totalCreds).toFixed(2)) : 4.00;
        const projectedCgpa = parseFloat(((3.80 * 0.7) + (semGpa * 0.3)).toFixed(2));

        const liveSemEl = document.getElementById("calcLiveSemGpa");
        const liveCgpaEl = document.getElementById("calcLiveCgpa");

        if (liveSemEl) liveSemEl.textContent = semGpa.toFixed(2);
        if (liveCgpaEl) liveCgpaEl.textContent = projectedCgpa.toFixed(2);

        return { semGpa, projectedCgpa };
    }
}
