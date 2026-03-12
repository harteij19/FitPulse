<div align="center">

# 🔥 FitPulse — Fitness Tracker

**A modern, dark-themed fitness tracking web app built with Python & Flask**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org)
[![License](https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge)](LICENSE)

<br/>

<img src="screenshots/dashboard.png" alt="FitPulse Dashboard" width="90%"/>

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Real-time stats with animated counters, weekly calorie bar charts & duration line charts |
| ➕ **Log Workouts** | Quick-entry form with exercise name, type, duration, calories & date |
| 📋 **Workout History** | Searchable & filterable table with color-coded type badges and delete support |
| 📈 **Progress Analytics** | 14-day calorie trend line chart and duration bar chart |
| 🌙 **Dark Glassmorphism UI** | Premium dark theme with purple accent gradients, blur effects & micro-animations |
| 📱 **Responsive** | Fully responsive layout with mobile sidebar toggle |

---

## 📸 Screenshots

<div align="center">

### Dashboard
<img src="screenshots/dashboard.png" alt="Dashboard" width="85%"/>

### Log Workout
<img src="screenshots/log_workout.png" alt="Log Workout" width="85%"/>

### Workout History
<img src="screenshots/history.png" alt="History" width="85%"/>

### Progress Analytics
<img src="screenshots/progress.png" alt="Progress" width="85%"/>

</div>

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fitpulse.git
cd fitpulse

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Open **http://localhost:5000** in your browser and start tracking! 🎉

---

## 📂 Project Structure

```
fitpulse/
├── app.py                 # Flask backend — API routes & sample data
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html         # Single-page HTML template
├── static/
│   ├── style.css          # Dark glassmorphism design system
│   └── app.js             # Chart.js visualizations & DOM logic
├── screenshots/           # App screenshots
└── README.md
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Backend** | Python · Flask |
| **Frontend** | HTML5 · Vanilla CSS · JavaScript |
| **Charts** | Chart.js 4.4 |
| **Typography** | Google Fonts (Inter) |
| **Design** | Glassmorphism · Dark Theme |

</div>

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Serve the main page |
| `GET` | `/api/workouts` | Fetch all workouts |
| `POST` | `/api/workouts` | Add a new workout |
| `DELETE` | `/api/workouts/<id>` | Delete a workout |
| `GET` | `/api/stats` | Get aggregated dashboard stats |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ and Python**

⭐ Star this repo if you found it useful!

</div>
