# ByteSwarm - Frontend

ByteSwarm is a Browser-Based Distributed Compute Grid. This repository contains the frontend React application built for the project.

The frontend is responsible for connecting to the Java Master Node via WebSockets, registering as a Worker Node, and (in later weeks) processing chunks of data using background HTML5 Web Workers to offload heavy mathematical processing without freezing the UI.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Open your terminal and navigate to the project directory.
2. Install the required dependencies by running:

```bash
npm install
```

## How to Run the Project

To start the local development server, run the following command in your terminal:

```bash
npm run dev
```

Once the server starts, it will provide a local URL (typically `http://localhost:5173`). Open this URL in your web browser to view the application.

### Building for Production

If you need to create a production-ready build, run:

```bash
npm run build
```
This will generate optimized static files in the `dist` folder.
