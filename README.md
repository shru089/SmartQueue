# SmartQueue - Smart Queue & Crowd Optimization System

SmartQueue is a Progressive Web App (PWA) built for handling queues, managing wait times, and addressing priority scenarios (like emergencies and senior citizens) in real-time. It features a modern, mobile-first design system and a comprehensive priority-aware queueing algorithm.

This repository contains the **Full-Stack implementation** prepared for academic submission, consisting of a React client and a FastAPI backend server.

> **🎓 Academic Submission Note:** 
> Please refer to the **`SmartQueue.docx`** and **`SmartQueue.txt`** files included in this repository. They contain the complete Product Requirements Document (PRD) & Implementation Specification, which exhaustively details the architecture, data models, algorithm specifications, and design decisions.

## Key Features

- **Progressive Web App (PWA)**: Designed for a mobile-first native experience. Installable on Android, iOS, and Desktop.
- **Real-Time Queue Updates**: Live position and wait times without page refreshes.
- **Dynamic Priority Queuing**: Supports a 4-tier priority system (Critical, Urgent, Priority, Regular) with FIFO order within tiers.
- **Admin Dashboard**: Full control over token management, emergency alerts, wait-time analytics, and no-show monitoring.
- **Smart Wait Time Algorithm**: Dynamically calculates wait times based on rolling service averages.

## Project Structure

The project is structured as a monorepo containing both the frontend and backend applications:

```text
smartqueue-doc/
├── frontend/               # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbars, Modals, Alerts)
│   │   ├── context/        # Global state management (QueueContext)
│   │   ├── data/           # Mock data and configuration constants
│   │   ├── pages/          # Application views (Landing, Admin, Display, Token)
│   │   ├── App.jsx         # Main application component & routing
│   │   └── main.jsx        # Application entry point
│   ├── package.json        # Frontend dependencies & scripts
│   └── vite.config.js      # Vite configuration
│
├── backend/                # FastAPI Backend Application
│   ├── routers/            # API Route handlers (admin, queue endpoints)
│   ├── database.py         # Database connection & setup (SQLAlchemy)
│   ├── main.py             # FastAPI application entry point
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic validation schemas
│   ├── requirements.txt    # Python dependencies
│   └── smartqueue.db       # SQLite Database file
│
├── SmartQueue.docx         # Comprehensive Documentation
└── README.md               # Project overview & instructions
```

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Routing**: React Router DOM (v6)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Validation**: Pydantic

---

## How to Run the Project Locally

### 1. Starting the Backend Server

The backend provides the REST API foundation and database models.

```bash
cd backend

# Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```
The backend API will be available at: `http://localhost:8000`
API Documentation (Swagger UI) is automatically available at: `http://localhost:8000/docs`

### 2. Starting the Frontend Application

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```
The frontend will be available at: `http://localhost:5173`

---

## 📱 Testing on a Mobile Device (Native Mobile Look)

SmartQueue is designed natively for mobile screens (except for the TV/Display page). To view and interact with the application on your actual smartphone, you need to expose your local development server to your local Wi-Fi network.

**Step 1: Start Backend on Local Network**
Instead of just running on localhost, bind the backend to `0.0.0.0` so it can receive requests from your phone:
```bash
cd backend
# Make sure your virtual environment is activated
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Step 2: Configure Frontend API Endpoint**
Create a `.env` file in the `frontend` folder to point the frontend to your computer's local IP address. 
*(Assuming your computer's IP address is `192.168.0.114` based on your network settings)*:
```env
# Create this inside the frontend/.env file
VITE_API_BASE_URL=http://192.168.0.114:8000
```

**Step 3: Start Frontend on Local Network**
Run the Vite development server and expose it to the network:
```bash
cd frontend
npm run dev -- --host
```
*(Vite will output a `Network:` URL in the terminal, such as `http://192.168.0.114:5173/`)*

**Step 4: Connect with your Mobile Device**
Ensure your smartphone is connected to the **same Wi-Fi network** as your computer.
Open the web browser on your phone and enter the Network URL (e.g., `http://192.168.0.114:5173/`). You will now see the mobile-native UI directly on your device!
