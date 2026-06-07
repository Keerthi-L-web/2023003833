# Vehicle Maintenance Scheduler Microservice

## Overview

The Vehicle Maintenance Scheduler Microservice is designed to optimize daily vehicle maintenance planning for a logistics company. Each depot receives multiple maintenance requests, where every task has:

* **Duration** (mechanic-hours required)
* **Impact Score** (operational importance)

Given a limited number of mechanic-hours available at a depot, the system determines the optimal subset of maintenance tasks that maximizes the total operational impact while staying within the available maintenance budget.

The solution uses the **0/1 Knapsack Dynamic Programming Algorithm** to efficiently compute the best task schedule.

---

## Problem Statement

Given:

* A list of maintenance tasks
* Task duration (hours)
* Task impact score
* Depot mechanic-hour budget

Determine:

* The optimal set of tasks to perform
* Maximum achievable impact score
* Tasks selected within the available mechanic-hours

---

## Features

* Fetch depot information from protected API
* Fetch vehicle maintenance tasks from protected API
* Dynamic Programming based optimization
* RESTful API architecture
* Modular service-based project structure
* Environment-based configuration
* Error handling and validation
* Optimized task scheduling

---

## Project Structure

```text
vehicle_maintenance_scheduler/
│
├── src/
│   ├── routes/
│   ├── services/
│   │   ├── depot.service.js
│   │   ├── vehicle.service.js
│   │   └── scheduler.service.js
│   ├── utils/
│   │   └── knapsack.js
│   └── app.js
│
├── server.js
├── .env
├── package.json
└── README.md
```

## Technology Stack

* Node.js
* Express.js
* Axios
* dotenv
* JavaScript (ES6)

---

## Algorithm Used

### 0/1 Knapsack Algorithm

Mapping:

| Maintenance Scheduling | Knapsack Problem |
| ---------------------- | ---------------- |
| Duration               | Weight           |
| Impact                 | Value            |
| Mechanic Hours         | Capacity         |

Objective:

```text
Maximize Total Impact
Subject To:
Total Duration ≤ Available Mechanic Hours
```

Time Complexity:

```text
O(N × Capacity)
```

Space Complexity:

```text
O(N × Capacity)
```

---

## API Flow

### Step 1

Fetch depot details:

```http
GET /evaluation-service/depots
```

### Step 2

Fetch vehicle maintenance tasks:

```http
GET /evaluation-service/vehicles
```

### Step 3

Apply scheduling algorithm.

### Step 4

Return optimal maintenance plan.

---

## Sample Response

```json
{
  "depotId": 1,
  "mechanicHours": 60,
  "totalImpact": 118,
  "selectedTasks": [
    {
      "taskId": "abc123",
      "duration": 5,
      "impact": 10
    }
  ]
}
```

---

## Installation

Clone repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```env
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
BASE_URL=http://4.224.186.213
```

Run application:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

---

## Design Decisions

* Service-oriented architecture for maintainability
* Dynamic Programming for optimal scheduling
* Separation of routes, services, and utility modules
* Environment variables for secure credential management
* Reusable scheduling engine

---

## Future Improvements

* Redis caching
* Scheduling history persistence
* Multi-depot parallel processing
* Performance monitoring
* Dashboard visualization

---

## Author

Keerthi L

Backend Assessment Submission
