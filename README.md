# ByteSwarm - Frontend

ByteSwarm is a Browser-Based Distributed Compute Grid. This repository contains the frontend React application built for the project.

The frontend connects to the Java Master Node through WebSockets, registers the browser as a Worker Node, and performs computational tasks using HTML5 Web Workers. Heavy mathematical processing is moved to a background thread so that the main UI remains responsive.

## 🛠️ Technologies & Tools Used

| Technology / Tool | Purpose                                    |
| ----------------- | ------------------------------------------ |
| ⚛️ React.js       | Frontend UI development                    |
| ⚡ Vite            | Development server and build tool          |
| 🟨 JavaScript     | Application logic and computation handling |
| 🌐 HTML5          | Web Worker and browser functionality       |
| 🎨 CSS3           | UI styling and animations                  |
| 🔌 WebSocket      | Communication with Java Master Node        |
| ☕ Java Backend    | Master Node and computation coordination   |
| ⚙️ Web Worker     | Background computation                     |
| 🖥️ VS Code       | Development environment                    |
| 📦 npm            | Dependency and package management          |
| 🔧 Git & GitHub   | Version control and project collaboration  |

---

# 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

## 📋 Prerequisites

You need to have the following installed:

* 🟢 Node.js
* 📦 npm
* 🔧 Git
* 🖥️ VS Code (recommended)

## 📥 Installation

1. Clone or open the ByteSwarm frontend repository.
2. Open the terminal in the frontend project directory.
3. Install the required dependencies:

```bash
npm install
```

---

# ▶️ How to Run the Project

Start the local development server:

```bash
npm run dev
```

The Vite development server will provide a local URL, typically:

```text
http://localhost:5173
```

Open the URL in your browser to access the ByteSwarm Dashboard.

## 🏗️ Build for Production

Create a production-ready build:

```bash
npm run build
```

The optimized files will be generated inside the `dist` folder.

---

# 📅 Week 1 – Grid & Connection Frontend

## 🎯 Objective

The main objective of Week 1 was to establish the React + Vite frontend structure and prepare the ByteSwarm Dashboard for communication with the Java Master Node.

## 🔄 Week 1 Workflow

```text
React + Vite Setup
       ↓
Frontend Project Structure
       ↓
Components Organization
       ↓
App.jsx Setup
       ↓
main.jsx Setup
       ↓
Global CSS Setup
       ↓
Dashboard UI Preparation
       ↓
Grid & Connection Frontend
```

## ✅ Week 1 Progress

* ⚛️ Created the React + Vite frontend project.
* 📁 Set up the basic frontend project structure.
* 📂 Created the `src` directory.
* 🧩 Created the `components` folder for reusable React components.
* 🚀 Configured `App.jsx` as the main React application component.
* 🔌 Configured `main.jsx` as the React entry point.
* 🎨 Created `index.css` for frontend styling.
* 🖥️ Prepared the ByteSwarm Dashboard UI structure.
* 🔗 Prepared the frontend for Grid and Master Node connectivity.

## 📊 Week 1 Status

| Task                       | Status           |
| -------------------------- | ---------------- |
| React + Vite Setup         | ✅ Completed      |
| Frontend Project Structure | ✅ Completed      |
| Components Structure       | ✅ Completed      |
| Dashboard UI               | ✅ Started        |
| Grid & Connection Setup    | ✅ Completed      |
| Week 1                     | ✅ 100% Completed |

---

# 📅 Week 2 – Web Worker Integration

## 🎯 Objective

The main objective of Week 2 was to integrate HTML5 Web Workers so that computationally intensive tasks could run in the background without blocking the browser's main UI thread.

## 🔄 Week 2 Workflow

```text
Java Master Node
       ↓
WebSocket Connection
       ↓
Worker Node Registration
       ↓
Receive Computation Chunk
       ↓
Send Chunk to Web Worker
       ↓
Background Computation
       ↓
Calculate Result
       ↓
Send Result Back to React
       ↓
Send Result to Java Backend
       ↓
Display Progress + Logs + Result
```

## ⚙️ Web Worker Workflow

```text
React UI
   │
   │ Computation Request
   ▼
WorkerPanel.jsx
   │
   │ postMessage()
   ▼
worker.js
   │
   ├── Prime Calculation
   ├── π Calculation
   ├── Fibonacci Calculation
   └── Matrix Calculation
   │
   │ postMessage()
   ▼
WorkerPanel.jsx
   │
   ├── ProgressBar.jsx
   ├── ResultCard.jsx
   └── ConsoleLogs.jsx
   │
   ▼
Java Master Node
```

## ✅ Week 2 Progress

* ⚙️ Created and configured `worker.js`.
* 🧵 Implemented dedicated background computation using Web Worker.
* 🔌 Implemented communication between React, Web Worker, and Java backend.
* 🧮 Added four computation algorithms:

  * Prime
  * π
  * Fibonacci
  * Matrix
* 📊 Added real-time progress tracking.
* ⏱️ Added ETA display to the progress bar.
* 🔄 Added loading animation during computation.
* 📝 Created `ConsoleLogs.jsx` for computation logs.
* 📤 Added log export functionality.
* 🔀 Added log sorting functionality.
* 📦 Updated `ResultCard.jsx` with real Java/WebSocket status.
* 🔁 Added Re-emit functionality for results.
* 🧵 Improved Web Worker lifecycle handling.
* 🔌 Added PING/PONG testing to verify Worker communication.
* 🖥️ Verified that the main UI remains responsive during computation.
* 🐛 Fixed Web Worker, animation, CSS, and connection-status issues.

## 📊 Week 2 Status

| Task                   | Status           |
| ---------------------- | ---------------- |
| Web Worker Setup       | ✅ Completed      |
| Background Computation | ✅ Completed      |
| Backend Communication  | ✅ Completed      |
| Prime Algorithm        | ✅ Completed      |
| π Algorithm            | ✅ Completed      |
| Fibonacci Algorithm    | ✅ Completed      |
| Matrix Algorithm       | ✅ Completed      |
| Progress Bar & ETA     | ✅ Completed      |
| Console Logs           | ✅ Completed      |
| Loading Animation      | ✅ Completed      |
| WebSocket/Java Status  | ✅ Completed      |
| Result Re-emission     | ✅ Completed      |
| UI Responsiveness      | ✅ Completed      |
| Bug Fixes & Testing    | ✅ Completed      |
| Week 2                 | ✅ 100% Completed |

---

# 🐛 Bugs Fixed During Week 2

| Issue                                          | Solution                                                  |
| ---------------------------------------------- | --------------------------------------------------------- |
| 🔄 Worker recreated when algorithm changed     | Removed unnecessary dependency from Worker initialization |
| 👥 Multiple Worker instances                   | Ensured a single active Worker instance                   |
| ⚛️ React StrictMode affecting Worker lifecycle | Adjusted development configuration                        |
| 📊 Progress stripes not animating              | Fixed background image and animation configuration        |
| 🎨 CSS `justify` typo                          | Corrected to `justifyContent`                             |
| 🟢 Incorrect Java status                       | Added real WebSocket/Java `emitStatus` handling           |

---

# 🧪 Testing & Verification

### Worker Thread Test

PING/PONG communication was implemented to verify that the Web Worker thread is active and communicating correctly.

```text
React Application
      │
      │ PING
      ▼
Web Worker
      │
      │ PONG
      ▼
React Application
```

### UI Responsiveness Test

Heavy mathematical computations are executed inside the Web Worker instead of the browser's main thread.

```text
Main Thread
├── UI Rendering       ✅
├── User Interaction  ✅
├── Progress Updates  ✅
└── Web Worker
     └── Computation   ⚙️
```

This prevents long-running computations from freezing the Dashboard UI.

---

# 📅 Mid-Project Review – Thread Isolation Check

## 🎯 Objective

The main objective of the **Mid-Project Review** was to visually and empirically prove **Thread Isolation** — demonstrating that heavy mathematical computation (100,000,000+ iterations) running inside an HTML5 Web Worker does **not freeze the React UI**, maintaining a smooth **~60 FPS** frame rate.

## 🔄 Thread Isolation Workflow

```text
             Heavy Computation (100M Iterations)
                            │
                            ▼
           Web Worker (computeWorker.js)
                            │
                  ┌─────────┴─────────┐
                  │                   │
              CPU Work           React UI
                  │                   │
                  │              60 FPS
                  │                   │
                  │              Animation (🔵)
                  │                   │
                  │              User Click Test
                  │                   │
                  └───────────────────┘
```

## ✅ Mid-Project Review Deliverables

* ⚙️ Created `src/workers/computeWorker.js` dedicated background worker.
* ⚛️ Built `ThreadIsolationCheck.jsx` visual dashboard.
* 📊 Implemented high-precision FPS monitor using `requestAnimationFrame`.
* 🔵 Added continuous motion test track (`🔵 ← continuously moving →`) to visually verify 60 FPS rendering.
* 🖱️ Added interactive UI click tester to prove button click responsiveness during worker computation.
* ⚡ Implemented side-by-side **Web Worker vs Main Thread** comparison mode.
* 💬 Verified isolated execution performance statement.

---

# 📅 Week 3 – Network Topology UI

## 🎯 Objective

The main objective of **Week 3** was to build a live, interactive **Network Topology Visualization** displaying the Java server as the **Master Node** and connected browser clients as **Worker Nodes**, featuring real-time state updates and blinking/pulsing computing animations.

## 🔄 Week 3 Architecture & Flow

```text
                    Master Node
                 Java Netty Server
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Worker 01      Worker 02      Worker 03
        Browser        Browser        Browser
          │              │              │
       Web Worker     Web Worker     Web Worker
          │              │              │
      COMPUTING        IDLE          COMPUTING
      (Pulsing)                      (Pulsing)
```

## ✅ Week 3 Deliverables

* 🌐 Created `src/components/Topology.jsx` for live graph layout and controls.
* 🖥️ Built `MasterNode.jsx` representing the Java Netty Master Server (`localhost:8080`).
* 💻 Built `WorkerNode.jsx` displaying worker states (`CONNECTED`, `IDLE`, `COMPUTING`, `COMPLETED`, `DISCONNECTED`).
* ⚡ Implemented `ConnectionLine.jsx` rendering SVG curves with active data flow pulses.
* 🟢 **Blinking Computing Animation**: Applied CSS pulse aura (`@keyframes workerPulse`) when `status === 'COMPUTING'`.
* 🔌 **Real-time WebSocket Integration**: React updates worker states automatically upon receiving `WORKER_STATUS` events from Java Master.
* 📊 Added Fleet Statistics Bar (Connected, Computing, Idle, Completed Jobs).

---

# 📅 Week 4 – Dashboard Polish & Metrics Finalization

## 🎯 Objective

The main objective of **Week 4** was to finalize and polish the dashboard's metric cards to clearly show the swarm's important statistics, prioritizing Total TFLOPS and Active Nodes.

## ✅ Week 4 Deliverables

* 📊 Updated the Topology Dashboard with a professional 8-card responsive layout.
* 📈 Highlighted key metrics: Total TFLOPS, Active Nodes, Active Jobs, and Completed Tasks.
* 📉 Added supporting statistics: Failed Tasks, Average Task Time, Network Status, and Uptime.
* 🖥️ Updated the Java Master Node component to prominently feature **Total TFLOPS** and **Active Nodes** to communicate scale and live health immediately.
* ✨ Improved UI aesthetics and layout for clear, data-driven visualization.

---

# 📁 Project Structure

```text
BYTESWARM/
├── backend/                    ← Java backend / Master Node
├── Frontend/                   ← React frontend
├── public/
│   └── worker.js               ← HTML5 Web Worker (Week 2 Engine)
├── src/
│   ├── components/
│   │   ├── Topology.jsx        ← Week 3 Network Topology View
│   │   ├── MasterNode.jsx      ← Master Server Node Component
│   │   ├── WorkerNode.jsx      ← Worker Client Node Component
│   │   ├── ConnectionLine.jsx  ← Dynamic SVG Connection Lines
│   │   ├── ThreadIsolationCheck.jsx ← Mid-Project Review Dashboard
│   │   ├── WorkerPanel.jsx     ← Worker management & computation
│   │   ├── ProgressBar.jsx     ← Progress & ETA display
│   │   ├── ResultCard.jsx      ← Computation result & Java status
│   │   └── ConsoleLogs.jsx     ← Logs, sorting & export
│   ├── workers/
│   │   └── computeWorker.js    ← Web Worker for Thread Isolation Check
│   ├── App.jsx                 ← Main React application
│   ├── index.css               ← Global styling
│   └── main.jsx                ← React entry point
├── package.json                ← Project dependencies
└── vite.config.js              ← Vite configuration
```

---

# 📈 Overall Project Progress

| Phase                                     |    Progress |
| ----------------------------------------- | ----------: |
| 📅 Week 1 – Grid & Connection Frontend    |      ✅ 100% |
| 📅 Week 2 – Web Worker Integration        |      ✅ 100% |
| 🟢 Mid-Project Review – Thread Isolation  |      ✅ 100% |
| 🌐 Week 3 – Network Topology UI           |      ✅ 100% |
| 📊 Week 4 – Dashboard Polish & Metrics    |      ✅ 100% |
| 🚀 Overall Development Status             | 🟢 Completed |

## 📝 Additional Updates

### 🚧 Blockers

* No major blockers during Week 3 development.
* Radial layout calculation, SVG path curves, dynamic worker fleet scaling, and real-time state synchronization were validated successfully.

### 👨‍🏫 Mentor Notes & Review Statement

> *"For Week 3, the live Network Topology graph connects directly to the Java Master Node WebSocket. Connected browser workers display real-time status transitions, with computing nodes actively pulsing while SVG data lines animate to show active workload distribution."*

---

# 🎯 Current Status

```text
Week 1 – Grid & Connection Frontend
████████████████████ 100% ✅

Week 2 – Web Worker Integration
████████████████████ 100% ✅

Mid-Project Review – Thread Isolation Check
████████████████████ 100% ✅

Week 3 – Network Topology UI
████████████████████ 100% ✅

Week 4 – Dashboard Polish & Metrics
████████████████████ 100% ✅

Overall Project Status
████████████████████ Completed 🚀
```

ByteSwarm's frontend foundation, Web Worker integration, Thread Isolation Check, Network Topology UI, and polished dashboard metrics are 100% completed and ready for evaluation.


