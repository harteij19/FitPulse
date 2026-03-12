from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import random
import uuid

app = Flask(__name__)

# ---------------------------------------------------------------------------
# In-memory data store – pre-seeded with sample workouts
# ---------------------------------------------------------------------------

def _seed_workouts():
    """Generate realistic sample workout data for the past 14 days."""
    exercises = [
        {"name": "Morning Run", "type": "Cardio", "calories": (200, 450), "duration": (20, 45)},
        {"name": "Weight Training", "type": "Strength", "calories": (150, 350), "duration": (30, 60)},
        {"name": "HIIT Session", "type": "Cardio", "calories": (300, 500), "duration": (15, 30)},
        {"name": "Yoga Flow", "type": "Flexibility", "calories": (100, 200), "duration": (30, 60)},
        {"name": "Cycling", "type": "Cardio", "calories": (250, 500), "duration": (25, 50)},
        {"name": "Pull-ups & Push-ups", "type": "Strength", "calories": (120, 280), "duration": (15, 30)},
        {"name": "Swimming", "type": "Cardio", "calories": (300, 600), "duration": (30, 60)},
        {"name": "Deadlifts", "type": "Strength", "calories": (200, 400), "duration": (25, 45)},
        {"name": "Stretching", "type": "Flexibility", "calories": (50, 120), "duration": (15, 30)},
        {"name": "Jump Rope", "type": "Cardio", "calories": (200, 400), "duration": (10, 25)},
    ]
    workouts = []
    for day_offset in range(14, 0, -1):
        date = (datetime.now() - timedelta(days=day_offset)).strftime("%Y-%m-%d")
        # 1-3 workouts per day
        for _ in range(random.randint(1, 3)):
            ex = random.choice(exercises)
            workouts.append({
                "id": str(uuid.uuid4()),
                "name": ex["name"],
                "type": ex["type"],
                "duration": random.randint(*ex["duration"]),
                "calories": random.randint(*ex["calories"]),
                "date": date,
            })
    return workouts

workouts_db: list[dict] = _seed_workouts()

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/workouts", methods=["GET"])
def get_workouts():
    return jsonify(workouts_db)


@app.route("/api/workouts", methods=["POST"])
def add_workout():
    data = request.get_json(force=True)
    workout = {
        "id": str(uuid.uuid4()),
        "name": data.get("name", "Unnamed"),
        "type": data.get("type", "Other"),
        "duration": int(data.get("duration", 0)),
        "calories": int(data.get("calories", 0)),
        "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
    }
    workouts_db.append(workout)
    return jsonify(workout), 201


@app.route("/api/workouts/<workout_id>", methods=["DELETE"])
def delete_workout(workout_id):
    global workouts_db
    workouts_db = [w for w in workouts_db if w["id"] != workout_id]
    return "", 204


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Aggregate stats for the dashboard cards."""
    today = datetime.now().strftime("%Y-%m-%d")
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    total_workouts = len(workouts_db)
    total_calories = sum(w["calories"] for w in workouts_db)
    total_duration = sum(w["duration"] for w in workouts_db)
    today_workouts = [w for w in workouts_db if w["date"] == today]
    today_calories = sum(w["calories"] for w in today_workouts)

    # Weekly breakdown (last 7 days)
    weekly = {}
    for i in range(6, -1, -1):
        d = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        day_label = (datetime.now() - timedelta(days=i)).strftime("%a")
        day_cals = sum(w["calories"] for w in workouts_db if w["date"] == d)
        day_dur = sum(w["duration"] for w in workouts_db if w["date"] == d)
        weekly[day_label] = {"calories": day_cals, "duration": day_dur}

    return jsonify({
        "totalWorkouts": total_workouts,
        "totalCalories": total_calories,
        "totalDuration": total_duration,
        "todayCalories": today_calories,
        "todayWorkouts": len(today_workouts),
        "weekly": weekly,
    })


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
