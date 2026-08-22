/* =========================================================
   STUDENTVERSE — UNIFIED STATE MANAGEMENT ENGINE
   Single Source of Truth across all pages
========================================================= */

const STORAGE_KEY = 'studentverse_master_state_v1';

const DEFAULT_STATE = {
    profile: {
        name: "Alex Mercer",
        role: "Undergraduate Student",
        university: "Apex Institute of Technology",
        major: "Computer Science & Engineering",
        year: "Year 3 • Semester 5",
        studentId: "STU-8849-CY",
        avatar: "⚡",
        bio: "Exploring AI, cloud distributed systems & quantum algorithms. Building modern digital experiences.",
        email: "alex.mercer@apex.edu"
    },
    academics: {
        cgpa: 3.84,
        semesterGpa: 3.90,
        totalCredits: 78,
        majorRank: 4,
        courses: [
            {
                id: "cs301",
                code: "CS-301",
                title: "Data Structures & Algorithms",
                credits: 4,
                grade: "A",
                instructor: "Dr. Elena Vance",
                progress: 80,
                syllabus: [
                    { title: "Trees & Balanced AVL Trees", done: true },
                    { title: "Graph Algorithms & Dijkstra", done: true },
                    { title: "Dynamic Programming Patterns", done: true },
                    { title: "Advanced Trie & Network Flow", done: false }
                ]
            },
            {
                id: "cs302",
                code: "CS-302",
                title: "Operating Systems & Concurrency",
                credits: 4,
                grade: "A-",
                instructor: "Prof. Marcus Brody",
                progress: 65,
                syllabus: [
                    { title: "Process Scheduling & Threads", done: true },
                    { title: "Deadlocks & Semaphores", done: true },
                    { title: "Virtual Memory & Paging", done: false },
                    { title: "File System Implementation", done: false }
                ]
            },
            {
                id: "cs303",
                code: "CS-303",
                title: "Database Management Systems",
                credits: 3,
                grade: "A",
                instructor: "Dr. Sarah Chen",
                progress: 90,
                syllabus: [
                    { title: "Relational Algebra & SQL", done: true },
                    { title: "B+ Tree Indexing & Hashing", done: true },
                    { title: "ACID & Transaction Isolation", done: true },
                    { title: "NoSQL & Distributed DBs", done: true }
                ]
            },
            {
                id: "cs304",
                code: "CS-304",
                title: "Computer Networks & Protocols",
                credits: 3,
                grade: "B+",
                instructor: "Prof. Alan Turing Jr.",
                progress: 50,
                syllabus: [
                    { title: "OSI & TCP/IP Model", done: true },
                    { title: "Routing Protocols (OSPF, BGP)", done: true },
                    { title: "TLS & Cryptographic Ciphers", done: false },
                    { title: "Socket Programming in C", done: false }
                ]
            }
        ]
    },
    goals: [
        {
            id: "g1",
            name: "Master Graph Algorithms",
            category: "ACADEMICS",
            progress: 85
        },
        {
            id: "g2",
            name: "Build Hackathon AI Project",
            category: "PROJECT",
            progress: 60
        },
        {
            id: "g3",
            name: "Read 2 Research Papers",
            category: "PERSONAL",
            progress: 40
        },
        {
            id: "g4",
            name: "Daily 30min Mindfulness & Workout",
            category: "WELLNESS",
            progress: 75
        }
    ],
    timetable: {
        "MON-09:00": { subject: "Data Structures", room: "Lab 304", prof: "Dr. Elena Vance", color: "cyan" },
        "MON-11:00": { subject: "Operating Systems", room: "Hall B", prof: "Prof. Brody", color: "purple" },
        "TUE-10:00": { subject: "Database Systems", room: "Room 102", prof: "Dr. Chen", color: "emerald" },
        "TUE-01:00": { subject: "Computer Networks", room: "Hall A", prof: "Prof. Turing", color: "gold" },
        "WED-09:00": { subject: "Data Structures", room: "Lab 304", prof: "Dr. Elena Vance", color: "cyan" },
        "WED-02:00": { subject: "AI Research Lab", room: "Lab 101", prof: "Dr. Vance", color: "purple" },
        "THU-11:00": { subject: "Operating Systems", room: "Hall B", prof: "Prof. Brody", color: "purple" },
        "THU-01:00": { subject: "Database Systems", room: "Room 102", prof: "Dr. Chen", color: "emerald" },
        "FRI-10:00": { subject: "Computer Networks", room: "Hall A", prof: "Prof. Turing", color: "gold" },
        "FRI-02:00": { subject: "Open Project Review", room: "Studio 4", prof: "Faculty Panel", color: "cyan" }
    },
    wellness: {
        mood: "Focused",
        energy: 85,
        waterIntake: 1750, // in ml
        waterTarget: 2500,
        focusMinutesToday: 75,
        streakDays: 14
    },
    activities: [
        { text: "Completed 2 syllabus modules in DBMS", time: "2 hours ago" },
        { text: "Logged 45 minutes of Pomodoro Focus", time: "4 hours ago" },
        { text: "Updated Goal: Build Hackathon Project to 60%", time: "Yesterday" },
        { text: "Calculated Semester GPA forecast (3.90)", time: "2 days ago" }
    ]
};

class StateManager {
    constructor() {
        this.state = this.loadState();
        this.listeners = [];
        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                this.state = this.loadState();
                this.notify();
            }
        });
    }

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                this.saveState(DEFAULT_STATE);
                return JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
            return { ...DEFAULT_STATE, ...JSON.parse(raw) };
        } catch (e) {
            console.error("Failed to load StudentVerse state, fallback to default", e);
            return JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    }

    saveState(newState) {
        this.state = newState || this.state;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            this.notify();
        } catch (e) {
            console.error("Failed to save state to localStorage", e);
        }
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(fn => fn(this.state));
        window.dispatchEvent(new CustomEvent('studentverse_state_changed', { detail: this.state }));
    }

    // Profile Getters / Setters
    getProfile() {
        return this.state.profile;
    }

    updateProfile(updatedFields) {
        this.state.profile = { ...this.state.profile, ...updatedFields };
        this.logActivity(`Updated profile information`);
        this.saveState();
    }

    // Academics
    getAcademics() {
        return this.state.academics;
    }

    updateCourses(courses) {
        this.state.academics.courses = courses;
        this.recalculateGPA();
        this.saveState();
    }

    toggleSyllabusTopic(courseId, topicIndex) {
        const course = this.state.academics.courses.find(c => c.id === courseId);
        if (course && course.syllabus[topicIndex]) {
            course.syllabus[topicIndex].done = !course.syllabus[topicIndex].done;
            const completed = course.syllabus.filter(s => s.done).length;
            course.progress = Math.round((completed / course.syllabus.length) * 100);
            this.logActivity(`Updated syllabus in ${course.code}: ${course.syllabus[topicIndex].title}`);
            this.saveState();
        }
    }

    recalculateGPA() {
        const gradePoints = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "D": 1.0, "F": 0.0 };
        let totalPoints = 0;
        let totalCredits = 0;

        this.state.academics.courses.forEach(c => {
            const pts = gradePoints[c.grade] !== undefined ? gradePoints[c.grade] : 3.5;
            totalPoints += pts * c.credits;
            totalCredits += c.credits;
        });

        if (totalCredits > 0) {
            this.state.academics.semesterGpa = parseFloat((totalPoints / totalCredits).toFixed(2));
            this.state.academics.cgpa = parseFloat(((this.state.academics.cgpa * 0.7) + (this.state.academics.semesterGpa * 0.3)).toFixed(2));
        }
    }

    // Goals
    getGoals() {
        return this.state.goals;
    }

    addGoal(goal) {
        const newGoal = {
            id: 'g_' + Date.now(),
            name: goal.name,
            category: goal.category || 'ACADEMICS',
            progress: Number(goal.progress) || 0
        };
        this.state.goals.unshift(newGoal);
        this.logActivity(`Added new goal: "${newGoal.name}"`);
        this.saveState();
        return newGoal;
    }

    updateGoal(id, fields) {
        const goal = this.state.goals.find(g => g.id === id);
        if (goal) {
            Object.assign(goal, fields);
            if (fields.progress === 100) {
                this.logActivity(`Completed goal: "${goal.name}" 🎉`);
            }
            this.saveState();
        }
    }

    deleteGoal(id) {
        const goal = this.state.goals.find(g => g.id === id);
        const name = goal ? goal.name : "Goal";
        this.state.goals = this.state.goals.filter(g => g.id !== id);
        this.logActivity(`Removed goal: "${name}"`);
        this.saveState();
    }

    // Timetable
    getTimetable() {
        return this.state.timetable;
    }

    setTimetableSlot(key, slotData) {
        if (!slotData) {
            delete this.state.timetable[key];
        } else {
            this.state.timetable[key] = slotData;
        }
        this.logActivity(`Updated schedule for ${key}`);
        this.saveState();
    }

    // Wellness
    getWellness() {
        return this.state.wellness;
    }

    updateWellness(fields) {
        this.state.wellness = { ...this.state.wellness, ...fields };
        this.saveState();
    }

    addWater(ml = 250) {
        this.state.wellness.waterIntake = Math.min(
            this.state.wellness.waterIntake + ml,
            this.state.wellness.waterTarget + 1000
        );
        this.saveState();
    }

    resetWater() {
        this.state.wellness.waterIntake = 0;
        this.saveState();
    }

    logFocusMinutes(mins) {
        this.state.wellness.focusMinutesToday += mins;
        this.logActivity(`Completed ${mins} minutes of focus session`);
        this.saveState();
    }

    // Activity Log
    logActivity(text) {
        this.state.activities.unshift({
            text,
            time: "Just now"
        });
        if (this.state.activities.length > 20) {
            this.state.activities.pop();
        }
    }

    getActivities() {
        return this.state.activities;
    }

    // Export & Import
    exportJSON() {
        return JSON.stringify(this.state, null, 2);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (!parsed.profile || !parsed.academics || !parsed.goals || !parsed.timetable) {
                throw new Error("Invalid StudentVerse JSON schema.");
            }
            this.state = parsed;
            this.saveState();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    resetToDefault() {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.saveState();
    }
}

// Singleton global store instance
window.StudentStore = new StateManager();
