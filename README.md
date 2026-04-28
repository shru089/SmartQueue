# SmartQueue - Smart Queue & Crowd Optimization System

SmartQueue is a Progressive Web App (PWA) built for handling queues, managing wait times, and addressing priority scenarios (like emergencies and senior citizens) in real-time. It features a modern, mobile-first design system and a comprehensive priority-aware queueing algorithm.

This repository contains the **Minimum Viable Product (MVP) implementation** prepared for academic submission, split into the frontend client and the foundational backend server. 

> **🎓 Academic Submission Note:** 
> Please refer to the **`SmartQueue.docx`** and **`SmartQueue.txt`** files included in this repository. They contain the complete Product Requirements Document (PRD) & Implementation Specification, which exhaustively details the architecture, data models, algorithm specifications, and design decisions.

## Key Features

- **Progressive Web App (PWA)**: Installable on Android, iOS, and Desktop without App Store friction. 
- **Real-Time Queue Updates**: See live position and wait times without page refreshes.
- **Dynamic Priority Queuing**: Supports a 4-tier priority system (Critical, Urgent, Priority, Regular) with FIFO order within tiers.
- **Admin Dashboard**: Full control over token management, emergency alerts, wait-time analytics, and no-show monitoring.
- **Smart Wait Time Algorithm**: Dynamically calculates wait times based on rolling service averages.

## Repository Structure

- `frontend/`: The React + Vite frontend application. Currently implements the full UI/UX and simulates the queuing logic (`QueueContext.jsx`) for standalone MVP demonstration.
- `backend/`: The FastAPI backend application. Contains the foundational API structure, database models (SQLite/SQLAlchemy), and endpoints for the production queue algorithm.
- `SmartQueue.docx`: Complete Product Requirements Document & Implementation Specification.

## Tech Stack

### Frontend (MVP Demonstration)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)

### Backend (Production Foundation)
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Real-Time Engine**: Native WebSockets (Planned)
- **Background Jobs**: APScheduler (Planned)

---

## How to Run the Project Locally

### 1. Starting the Frontend Application (MVP Demo)

The frontend is currently configured to run as a standalone simulation for demonstration purposes, allowing full exploration of the priority queuing logic without requiring the backend to be running.

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev

# For Production Build:
# npm run build
```
The frontend will be available at: http://localhost:5173

### 2. Starting the Backend Server (API Foundation)

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
The backend API will be available at: http://localhost:8000
API Documentation (Swagger UI) is automatically available at: http://localhost:8000/docs

---

## Documentation

For a comprehensive breakdown of the system architecture, data models, algorithm specifications, and design decisions, please refer to the **`SmartQueue.docx`** included in this repository. 

*Created for Academic Submission.*
