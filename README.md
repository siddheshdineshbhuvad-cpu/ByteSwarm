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

# 📁 Project Structure

```text
BYTESWARM/
├── backend/                    ← Java backend / Master Node
├── Frontend/                   ← React frontend
├── public/
│   └── worker.js               ← HTML5 Web Worker
├── src/
│   ├── components/
│   │   ├── WorkerPanel.jsx     ← Worker management & computation
│   │   ├── ProgressBar.jsx     ← Progress & ETA display
│   │   ├── ResultCard.jsx      ← Computation result & Java status
│   │   └── ConsoleLogs.jsx     ← Logs, sorting & export
│   ├── App.jsx                 ← Main React application
│   ├── index.css               ← Global styling
│   └── main.jsx                ← React entry point
├── package.json                ← Project dependencies
└── vite.config.js              ← Vite configuration
```

---

# 📈 Overall Project Progress

| Phase                                  |    Progress |
| -------------------------------------- | ----------: |
| 📅 Week 1 – Grid & Connection Frontend |      ✅ 100% |
| 📅 Week 2 – Web Worker Integration     |      ✅ 100% |
| 🚀 Overall Development Status          | 🟢 On Track |

## 📝 Additional Updates

### 🚧 Blockers

* No major blockers during Week 2.
* Minor issues related to Worker lifecycle, duplicate Worker instances, React StrictMode, progress animation, and CSS were identified.
* All identified issues were resolved and tested successfully.

### 👨‍🏫 Mentor Notes

* Web Worker implementation was reviewed and verified.
* Recommended maintaining a single active Worker instance.
* Progress tracking and WebSocket status handling were improved.
* Continued focus on clean component structure and proper Worker lifecycle management.

### 🔄 Other Updates

* PING/PONG successfully confirms Worker communication.
* Background computations run without blocking the main UI thread.
* Four mathematical algorithms are currently integrated.
* Console logs can be viewed, sorted, and exported.
* Result re-emission functionality has been implemented.
* Loading and progress states have been improved.
* Week 2 implementation is stable and ready for the next development phase.

---

# 🎯 Current Status

```text
Week 1 – Grid & Connection Frontend
████████████████████ 100% ✅

Week 2 – Web Worker Integration
████████████████████ 100% ✅

Overall Project Status
████████████████████ On Track 🚀
```

ByteSwarm's frontend foundation and Web Worker integration are successfully completed for Weeks 1 and 2. The project is ready to proceed with the next phase of distributed computation and frontend enhancements.
