# SmartQueue Frontend

This directory contains the **SmartQueue** Progressive Web App (PWA) frontend, built with a modern, mobile-first design system. The frontend serves both end-users (patients/clients) and administrative staff.

## Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Custom Clinical Earth-tone Theme)
- **Routing:** React Router DOM (v6)
- **Icons:** Lucide React
- **Charts:** Recharts
- **State Management:** React Context API + `useReducer`

## Key Features
- **PWA Ready:** Configured with a `manifest.json` and Apple Touch icons for mobile home-screen installation.
- **Mobile-First UI:** Optimized for screens up to `480px` wide, keeping all controls within thumb-reach.
- **Clinical Design System:** Utilizes a custom color palette (Primary Green, Secondary Forest, Neutral Cream) and typography (Public Sans, Noto Serif) to convey a clean, professional look.

## Application Structure

The app is divided into two distinct flows:

### 1. User Flow (Public)
- **`/` (Landing Page):** Users view the current queue statistics and submit their phone number/OTP to join the queue.
- **`/token` (Token Tracking):** A live tracking page where users can see their token number, live position in the queue, estimated wait time, and a dynamic progress bar.

### 2. Admin Flow (Protected)
- **`/admin/login`:** Authentication portal for staff. *(Demo credentials: `admin` / `admin123`)*
- **`/admin/dashboard`:** The primary control center. Admins can:
  - View all waiting tokens and current status.
  - See immediate, flashing visual alerts for **Critical (P0)** tokens.
  - **Call Next**, **Skip**, or **Escalate** tokens (escalations require mandatory justification).
- **`/admin/analytics`:** A high-level overview showing daily metrics, peak hours, and a pie chart of priority distributions.

## Priority Queue Logic (Frontend Simulation)
Currently, all queuing logic is simulated using `QueueContext.jsx`. The algorithm honors strict priority bounds:
- **P0 (Critical):** Immediate front-of-queue priority.
- **P1 (Urgent), P2 (Priority), P3 (Regular):** Sorted by priority tier, then by arrival time (FIFO).

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The app will be available at `http://localhost:5173` (or the port specified in your terminal, e.g., `5200`).
