/* ============================================================
   FitPulse — Client-side Application Logic
   ============================================================ */

(function () {
    "use strict";

    // ── DOM refs ──
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const navLinks = $$(".nav-link");
    const sections = $$(".section");
    const sidebar = $("#sidebar");
    const menuToggle = $("#menu-toggle");
    const workoutForm = $("#workout-form");
    const toast = $("#toast");
    const historySearch = $("#history-search");
    const historyFilter = $("#history-filter");

    // ── State ──
    let allWorkouts = [];
    let calorieChart, durationChart, progressCalorieChart, progressDurationChart;

    // ── Navigation ──
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = link.dataset.section;
            navLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
            sections.forEach((s) => {
                s.classList.remove("active");
                if (s.id === `section-${target}`) s.classList.add("active");
            });
            // close mobile sidebar
            sidebar.classList.remove("open");
            // Refresh data when switching sections
            if (target === "progress") renderProgressCharts();
        });
    });

    // Mobile menu
    menuToggle?.addEventListener("click", () => sidebar.classList.toggle("open"));

    // ── Greeting ──
    function setGreeting() {
        const h = new Date().getHours();
        let g = "Good evening";
        if (h < 12) g = "Good morning";
        else if (h < 17) g = "Good afternoon";
        $("#greeting").textContent = `${g}! Here's your fitness overview.`;
    }
    setGreeting();

    // ── API helpers ──
    async function fetchJSON(url, opts) {
        const res = await fetch(url, opts);
        if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
        if (res.status === 204) return null;
        return res.json();
    }

    // ── Load all data ──
    async function loadDashboard() {
        const [stats, workouts] = await Promise.all([
            fetchJSON("/api/stats"),
            fetchJSON("/api/workouts"),
        ]);
        allWorkouts = workouts;
        renderStats(stats);
        renderWeeklyCharts(stats.weekly);
        renderRecentTable(workouts.slice(-8).reverse());
        renderHistoryTable(workouts);
    }

    // ── Stats cards with counter animation ──
    function animateValue(el, target) {
        const suffix = el.querySelector("small")?.textContent || "";
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.innerHTML = current.toLocaleString() + (suffix ? `<small>${suffix}</small>` : "");
        }, 25);
    }

    function renderStats(stats) {
        animateValue($("#stat-total-workouts"), stats.totalWorkouts);
        animateValue($("#stat-total-calories"), stats.totalCalories);
        animateValue($("#stat-total-duration"), stats.totalDuration);
        animateValue($("#stat-today-calories"), stats.todayCalories);
    }

    // ── Chart.js defaults ──
    Chart.defaults.color = "#9595b2";
    Chart.defaults.borderColor = "rgba(255,255,255,0.04)";
    Chart.defaults.font.family = "'Inter', sans-serif";

    const chartGradient = (ctx, c1, c2) => {
        const g = ctx.createLinearGradient(0, 0, 0, 280);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        return g;
    };

    // ── Weekly charts (Dashboard) ──
    function renderWeeklyCharts(weekly) {
        const labels = Object.keys(weekly);
        const cals = labels.map((l) => weekly[l].calories);
        const durs = labels.map((l) => weekly[l].duration);

        // Calorie chart
        const calCtx = $("#calorieChart").getContext("2d");
        if (calorieChart) calorieChart.destroy();
        calorieChart = new Chart(calCtx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Calories",
                    data: cals,
                    backgroundColor: chartGradient(calCtx, "rgba(139,92,246,0.7)", "rgba(139,92,246,0.15)"),
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 36,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.03)" } },
                    x: { grid: { display: false } },
                },
            },
        });

        // Duration chart
        const durCtx = $("#durationChart").getContext("2d");
        if (durationChart) durationChart.destroy();
        durationChart = new Chart(durCtx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Minutes",
                    data: durs,
                    borderColor: "#3b82f6",
                    backgroundColor: chartGradient(durCtx, "rgba(59,130,246,0.25)", "rgba(59,130,246,0.0)"),
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#3b82f6",
                    pointBorderColor: "#fff",
                    pointRadius: 5,
                    pointHoverRadius: 7,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.03)" } },
                    x: { grid: { display: false } },
                },
            },
        });
    }

    // ── Progress charts (14-day) ──
    function renderProgressCharts() {
        const days = {};
        allWorkouts.forEach((w) => {
            if (!days[w.date]) days[w.date] = { calories: 0, duration: 0 };
            days[w.date].calories += w.calories;
            days[w.date].duration += w.duration;
        });

        // Last 14 unique sorted dates
        const sortedDates = Object.keys(days).sort().slice(-14);
        const labels = sortedDates.map((d) => {
            const dt = new Date(d + "T00:00:00");
            return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        });
        const cals = sortedDates.map((d) => days[d].calories);
        const durs = sortedDates.map((d) => days[d].duration);

        const calCtx = $("#progressCalorieChart").getContext("2d");
        if (progressCalorieChart) progressCalorieChart.destroy();
        progressCalorieChart = new Chart(calCtx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Calories",
                    data: cals,
                    borderColor: "#8b5cf6",
                    backgroundColor: chartGradient(calCtx, "rgba(139,92,246,0.2)", "rgba(139,92,246,0.0)"),
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: "#8b5cf6",
                    pointBorderColor: "#1a1a2e",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 2.5,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.03)" } },
                    x: { grid: { display: false } },
                },
            },
        });

        const durCtx = $("#progressDurationChart").getContext("2d");
        if (progressDurationChart) progressDurationChart.destroy();
        progressDurationChart = new Chart(durCtx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Duration (min)",
                    data: durs,
                    backgroundColor: chartGradient(durCtx, "rgba(16,185,129,0.65)", "rgba(16,185,129,0.15)"),
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 28,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.03)" } },
                    x: { grid: { display: false } },
                },
            },
        });
    }

    // ── Render recent workouts table (dashboard) ──
    function renderRecentTable(workouts) {
        const tbody = $("#recent-table tbody");
        if (!workouts.length) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><span>🏃</span>No workouts yet. Start logging!</div></td></tr>`;
            return;
        }
        tbody.innerHTML = workouts
            .map(
                (w) => `
            <tr>
                <td style="color:var(--text-primary);font-weight:500">${esc(w.name)}</td>
                <td><span class="type-badge type-badge--${w.type}">${w.type}</span></td>
                <td>${w.duration} min</td>
                <td>${w.calories} kcal</td>
                <td>${formatDate(w.date)}</td>
            </tr>`
            )
            .join("");
    }

    // ── Render history table ──
    function renderHistoryTable(workouts) {
        const tbody = $("#history-table tbody");
        const search = (historySearch?.value || "").toLowerCase();
        const filter = historyFilter?.value || "All";

        let filtered = workouts.filter((w) => {
            const matchSearch = w.name.toLowerCase().includes(search);
            const matchType = filter === "All" || w.type === filter;
            return matchSearch && matchType;
        });

        // Sort newest first
        filtered = filtered.slice().sort((a, b) => b.date.localeCompare(a.date));

        if (!filtered.length) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><span>📋</span>No matching workouts found.</div></td></tr>`;
            return;
        }
        tbody.innerHTML = filtered
            .map(
                (w) => `
            <tr>
                <td style="color:var(--text-primary);font-weight:500">${esc(w.name)}</td>
                <td><span class="type-badge type-badge--${w.type}">${w.type}</span></td>
                <td>${w.duration} min</td>
                <td>${w.calories} kcal</td>
                <td>${formatDate(w.date)}</td>
                <td><button class="btn-delete" data-id="${w.id}" title="Delete workout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button></td>
            </tr>`
            )
            .join("");

        // Bind delete buttons
        tbody.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                btn.closest("tr").style.opacity = "0.3";
                await fetchJSON(`/api/workouts/${id}`, { method: "DELETE" });
                allWorkouts = allWorkouts.filter((w) => w.id !== id);
                loadDashboard();
            });
        });
    }

    // ── Log workout form ──
    workoutForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            name: $("#w-name").value.trim(),
            type: $("#w-type").value,
            duration: parseInt($("#w-duration").value, 10),
            calories: parseInt($("#w-calories").value, 10),
            date: $("#w-date").value,
        };
        await fetchJSON("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        workoutForm.reset();
        // Set date to today
        $("#w-date").value = new Date().toISOString().slice(0, 10);
        showToast();
        loadDashboard();
    });

    // Set default date to today
    if ($("#w-date")) {
        $("#w-date").value = new Date().toISOString().slice(0, 10);
    }

    // ── History search / filter ──
    historySearch?.addEventListener("input", () => renderHistoryTable(allWorkouts));
    historyFilter?.addEventListener("change", () => renderHistoryTable(allWorkouts));

    // ── Toast ──
    function showToast() {
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2800);
    }

    // ── Helpers ──
    function esc(str) {
        const d = document.createElement("div");
        d.textContent = str;
        return d.innerHTML;
    }
    function formatDate(dateStr) {
        const dt = new Date(dateStr + "T00:00:00");
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    // ── Init ──
    loadDashboard();
})();
