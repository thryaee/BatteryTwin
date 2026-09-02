# BatteryTwin — Digital Twin-Enabled Battery Health & Charging Optimization

> **Final-Year Major Project** | Built alongside the existing ChargeX Flutter app.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  ESP32 + INA219 + Temp Sensor                                        │
│  (or Python Simulator when USE_SIMULATOR=true)                       │
└─────────────────────┬────────────────────────────────────────────────┘
                      │ MQTT  chargex/battery/data
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Mosquitto MQTT Broker  (localhost:1883)                             │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│  FastAPI Backend  (localhost:8000)                                   │
│                                                                      │
│  ┌─────────────┐   ┌──────────────────────────────────────────────┐ │
│  │ Twin Engine │──▶│ LangGraph Agent Pipeline                     │ │
│  │             │   │  soh_agent → rul_agent → charging_agent      │ │
│  │ (updates    │   │  → maintenance_agent → coordinator_agent     │ │
│  │  in-memory  │   └──────────────────┬───────────────────────────┘ │
│  │  TwinState) │                      │                             │
│  └──────┬──────┘   ┌─────────────────▼───────────────────────────┐ │
│         │          │ Relay Controller (safety gate)               │ │
│         │          │ → publishes chargex/relay/control            │ │
│         │          └─────────────────────────────────────────────┘ │
│         │                                                           │
│         ├──▶ PostgreSQL (persistent storage)                        │
│         └──▶ WebSocket broadcast (/ws)                             │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
              ┌──────────────┴─────────────┐
              ▼                            ▼
┌─────────────────────┐      ┌─────────────────────────────┐
│ React Dashboard     │      │ Flutter (ChargeX app)        │
│ localhost:3000      │      │ BatteryTwin screen           │
│ Live metrics, twin  │      │ Polls /api/twin/state        │
│ state, AI recs      │      │                              │
└─────────────────────┘      └─────────────────────────────┘
```

---

## Project Structure

```
BatteryTwin/
├── backend/              Python FastAPI backend
│   ├── main.py           Application entry point
│   ├── config.py         Pydantic-settings configuration
│   ├── requirements.txt
│   ├── .env.example      Environment variable template
│   ├── .env              Local config (git-ignored)
│   ├── mqtt/             MQTT client (Paho)
│   ├── database/         SQLAlchemy models + CRUD
│   ├── digital_twin/     TwinState + TwinEngine + Simulator
│   ├── agents/           LangGraph multi-agent pipeline
│   ├── ml/               Scikit-learn ML models + trainer
│   ├── api/              FastAPI routes + WebSocket
│   ├── relay/            Relay safety controller
│   └── utils/            Logger + constants
│
├── dashboard/            React dashboard (localhost:3000)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/   LiveMetrics, HealthPanel, etc.
│       ├── hooks/        useWebSocket, useBatteryData
│       ├── pages/        Dashboard.jsx
│       └── services/     api.js (Axios)
│
├── esp32/
│   ├── battery_sensor.ino    Arduino firmware
│   └── README.md
│
└── README.md             ← You are here
```

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Python | ≥ 3.11 | For the backend |
| Node.js | ≥ 18 | For the React dashboard |
| PostgreSQL | ≥ 14 | Database |
| Mosquitto | ≥ 2.0 | MQTT broker |
| Flutter | ≥ 3.4 | Mobile app (optional) |

---

## Installation & Setup

### Step 1 — Install Mosquitto MQTT Broker

**Windows:**
```powershell
# Download from https://mosquitto.org/download/
# After install, start the service:
net start mosquitto
```

**Verify it's running:**
```powershell
mosquitto -v
```

---

### Step 2 — Set up PostgreSQL

```sql
-- In psql or pgAdmin:
CREATE DATABASE batterytwin;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE batterytwin TO postgres;
```

---

### Step 3 — Backend Setup

```powershell
# Navigate to backend
cd d:\Minor_project\BatteryTwin\backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env
# Edit .env with your DB password and WiFi/MQTT settings
```

**Configure `.env`** (minimum required changes):
```env
DB_PASSWORD=yourpostgrespassword
USE_SIMULATOR=true          # keep true until ESP32 is connected
```

**Train ML models** (first time only — auto-runs on startup too):
```powershell
python -m ml.trainer
```

**Start the backend:**
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will:
1. Create database tables automatically
2. Train ML models if no `.pkl` files exist
3. Start the battery simulator
4. Begin serving at `http://localhost:8000`

**Verify:** Open `http://localhost:8000/docs` — you should see the Swagger UI.

---

### Step 4 — React Dashboard Setup

```powershell
# Open a new terminal
cd d:\Minor_project\BatteryTwin\dashboard

# Install packages
npm install

# Copy env config
copy .env.example .env

# Start the dashboard
npm start
```

Open `http://localhost:3000` — the dashboard should connect and show live data.

---

### Step 5 — Flutter App (optional)

The BatteryTwin screen is already integrated into the ChargeX app.

```powershell
cd d:\Minor_project\ChargeX
flutter pub get
flutter run
```

Navigate to **Home → Battery Twin** tile.

> **Note for Android emulator:** The backend URL is pre-set to `http://10.0.2.2:8000`
> (Android emulator's alias for the host machine's localhost).
>
> **For a real device:** Change `_baseUrl` in `battery_twin_screen.dart` to your
> PC's LAN IP, e.g. `http://192.168.1.100:8000`.

---

### Step 6 — ESP32 Hardware (when ready)

1. Open `esp32/battery_sensor.ino` in Arduino IDE
2. Install required libraries (see `esp32/README.md`)
3. Edit the CONFIGURATION section with your WiFi + MQTT broker IP
4. Upload to ESP32
5. In `backend/.env`, set `USE_SIMULATOR=false`
6. Restart the backend

**No code changes needed** — the system auto-switches from simulator to hardware.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | Detailed system health |
| GET | `/docs` | Interactive Swagger UI |
| GET | `/api/twin/state` | Current Digital Twin state |
| GET | `/api/twin/history` | Twin history (last N hours) |
| GET | `/api/twin/stats` | 24h statistics |
| GET | `/api/battery/latest` | Latest sensor reading |
| GET | `/api/battery/history` | Last N readings |
| POST | `/api/battery/reading` | Inject a manual reading |
| GET | `/api/agents/latest` | Latest AI recommendations |
| POST | `/api/agents/run` | Force agent pipeline run |
| GET | `/api/agents/relay/status` | Current relay state |
| POST | `/api/agents/relay/override` | Manual relay control |
| WS | `/ws` | Real-time twin state stream |

---

## AI Agent Architecture

```
LangGraph Pipeline (sequential, deterministic):

START
  │
  ▼
SOH Agent          Estimates State of Health (0–100%)
  │                Model: GradientBoosting (Scikit-learn)
  ▼
RUL Agent          Predicts Remaining Useful Life (cycles)
  │                Model: RandomForest (Scikit-learn)
  ▼
Charging Agent     Optimises C-rate to minimise degradation
  │                Model: Ridge + PolynomialFeatures
  ▼
Maintenance Agent  Generates prioritised maintenance actions
  │                Logic: Pure rule-based (no ML)
  ▼
Coordinator Agent  Resolves conflicts → Final recommendation
  │                Logic: 5-rule precedence system
  ▼
END
```

### Conflict Resolution Priority (highest wins)
1. Temperature safety (> 45°C) → RELAY OFF
2. SOH critical (< 40%) → RELAY OFF
3. Charging agent STOP signal
4. RUL urgent → cap C-rate at 0.2C
5. Maintenance critical → cap C-rate at 0.3C

---

## ⚠️ Data & Model Notice

All ML models are trained on **synthetically generated data**.

| Aspect | Status |
|---|---|
| Model architecture | ✅ Production-quality |
| Training pipeline | ✅ Real (Scikit-learn) |
| Training data | ⚠️ Synthetic (physics-informed approximation) |
| Prediction accuracy | ⚠️ Approximate — for demo purposes |
| Real hardware ready | ✅ Switch `USE_SIMULATOR=false` |

**To use real data:** Replace CSV files in `backend/ml/data/` with real battery
logs and re-run `python -m ml.trainer`. The pipeline is unchanged.

**Public datasets for improved models:**
- NASA Battery Dataset: https://data.nasa.gov/dataset/Li-ion-Battery-Aging-Datasets
- CALCE Battery Dataset: https://calce.umd.edu/battery-data

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Backend can't connect to DB | Check `DB_PASSWORD` in `.env`, ensure PostgreSQL is running |
| MQTT connection refused | Ensure Mosquitto is running (`net start mosquitto`) |
| ML training fails | Check `numpy`/`sklearn` versions match `requirements.txt` |
| Dashboard shows "Connecting..." | Ensure backend is running on port 8000 |
| Flutter can't reach backend | Use `10.0.2.2:8000` for emulator, PC LAN IP for real device |
| ESP32 not connecting to MQTT | Verify broker IP, check firewall allows port 1883 |

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Backend | Python + FastAPI | 3.11 / 0.111 |
| IoT Transport | MQTT (Paho + Mosquitto) | 2.x |
| Database | PostgreSQL + SQLAlchemy | 14+ / 2.0 |
| Multi-Agent AI | LangGraph | 0.1.x |
| ML Models | Scikit-learn | 1.5.0 |
| Real-time | FastAPI WebSockets | — |
| Dashboard | React + Recharts | 18.x |
| Mobile | Flutter (Dart) | 3.4+ |
| Firmware | Arduino C++ (ESP32) | — |

---

## Running Everything Together

Open **3 terminals**:

```powershell
# Terminal 1 – Backend
cd d:\Minor_project\BatteryTwin\backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000

# Terminal 2 – Dashboard
cd d:\Minor_project\BatteryTwin\dashboard
npm start

# Terminal 3 – Flutter (optional)
cd d:\Minor_project\ChargeX
flutter run
```

Then open `http://localhost:3000` for the dashboard.
