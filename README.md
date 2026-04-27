# SmartQueue - Smart Queue & Crowd Optimization System

SmartQueue is a Progressive Web App (PWA) built for handling queues, managing wait times, and addressing priority scenarios (like emergencies and senior citizens) in real-time. It features a modern, mobile-first design, a robust backend with WebSocket support, and a comprehensive priority-aware queueing algorithm.

This repository contains the complete implementation for academic submission, split into the frontend client and the backend server. 

## Key Features

- **Progressive Web App (PWA)**: Installable on Android, iOS, and Desktop without App Store friction. 
- **Real-Time Queue Updates**: See live position and wait times without page refreshes, powered by WebSockets.
- **Dynamic Priority Queuing**: Supports a 4-tier priority system (Critical, Urgent, Priority, Regular) with FIFO order within tiers.
- **Admin Dashboard**: Full control over token management, emergency alerts, wait-time analytics, and no-show monitoring.
- **Smart Wait Time Algorithm**: Dynamically calculates wait times based on rolling service averages.

## Repository Structure

- `frontend/`: The React + Vite frontend application.
- `backend/`: The FastAPI backend application.
- `SmartQueue.docx`: Complete Product Requirements Document & Implementation Specification.

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (SQLAlchemy ORM)
- **Real-Time**: Native WebSockets
- **Background Jobs**: APScheduler

---

## How to Run the Project Locally

### 1. Starting the Backend Server

The backend provides the REST API and WebSocket connections.

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

### 2. Starting the Frontend Application

The frontend connects to the backend to provide the user and admin interfaces.

```bash
cd frontend

# Install Node modules
npm install

# Start the development server
npm run dev
```
The frontend will be available at: http://localhost:5173

---

## Documentation

For a comprehensive breakdown of the system architecture, data models, algorithm specifications, and design decisions, please refer to the `SmartQueue.docx` included in this repository. 

*Created for Academic Submission.*
