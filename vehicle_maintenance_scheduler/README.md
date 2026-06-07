# Vehicle Maintenance Scheduler API

An optimized scheduling microservice built using Node.js, Express, Axios, and clean architecture principles. It determines the optimal subset of maintenance tasks for vehicle depots using the **0/1 Knapsack Dynamic Programming algorithm** to maximize total task impact without exceeding available mechanic hours.

---

## 1. System Architecture

The application is structured following Clean Architecture principles to enforce a strict separation of concerns, decoupling controllers/routers, business logic (services), algorithm utilities, and external network requests:

```
                                      +------------------------------------+
                                      |         HTTP Request (Postman)     |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +-----------------+------------------+
                                      |          scheduler.routes          |
                                      +-----------------+------------------+
                                                        |
                                                        v
                                      +-----------------+------------------+
                                      |         scheduler.service          |
                                      +-------+------------------+---------+
                                              |                  |
                       +----------------------+                  +-----------------------+
                       v                                                                 v
+----------------------+-------------+                                    +--------------+-------------+
|        depot.service (Axios)        |                                    |    vehicle.service (Axios)  |
+----------------------+-------------+                                    +--------------+-------------+
                       |                                                                 |
                       v                                                                 v
+----------------------+-------------+                                    +--------------+-------------+
|      External Depots Endpoint       |                                    |       External Tasks Endpoint|
+------------------------------------+                                    +----------------------------+
                                                        |
                                                        v
                                      +-----------------+------------------+
                                      |          knapsack.js (DP)          |
                                      +------------------------------------+
```

- **Routes (`/src/routes/`)**: Receives the incoming request, extracts parameter payloads, handles HTTP responses, and handles route validation.
- **Services (`/src/services/`)**: Contains the core business orchestration and integrates external API fetching logic via Axios.
- **Utils (`/src/utils/`)**: Contains mathematical or algorithmic helper modules (in this case, the Knapsack DP solver).
- **Middleware (`/src/middleware/`)**: Houses interceptors for logging incoming requests and handling application errors globally.

---

## 2. Directory Structure

```
vehicle_maintenance_scheduler/
├── src/
│   ├── middleware/
│   │   ├── error.middleware.js       # Centralized exception logging and formatting
│   │   └── logging.middleware.js     # Intercepts requests for audit shipping
│   ├── routes/
│   │   └── scheduler.routes.js       # Express routes for scheduling endpoints
│   ├── services/
│   │   ├── depot.service.js          # API service fetching depots with mock fallback
│   │   ├── scheduler.service.js      # Orchestrator running optimization per depot
│   │   └── vehicle.service.js        # API service fetching tasks with mock fallback
│   ├── utils/
│   │   └── knapsack.js               # 0/1 Knapsack Dynamic Programming algorithm
│   ├── app.js                        # Configures Express app and registers middlewares
│   └── server.js                     # Listens on PORT and handles server lifecycle
├── .env                              # Environment variable settings
├── package.json                      # NPM project metadata and dependencies
└── README.md                         # Documentation
```

---

## 3. Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- NPM

### Installation
1. Install dependencies from the `vehicle_maintenance_scheduler` directory:
   ```bash
   npm install
   ```
   *Note: This will automatically link the local `logging_middleware` package.*

2. Set up the environment variables:
   Create or edit the `.env` file in the root folder with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   ACCESS_TOKEN=your_access_token
   DEPOTS_API_URL=https://api.mockservice.io/depots
   TASKS_API_URL=https://api.mockservice.io/tasks
   EVALUATION_AUTH_URL=https://api.mockservice.io/oauth/token
   LOGGING_API_URL=https://api.mockservice.io/logs
   USE_MOCK_FALLBACK=true
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Or run standard start:
   ```bash
   npm start
   ```

---

## 4. Postman Testing Instructions

Import the following endpoint patterns into Postman to test the optimization scheduler.

### A. Run Default Scheduler Optimization (Using Fetched API Data)
- **URL**: `http://localhost:3000/api/scheduler/optimize`
- **Method**: `GET`
- **Headers**:
  - `Accept: application/json`

### B. Run Custom Scheduler Optimization (Using Payload Overrides)
You can test the 0/1 Knapsack solver with explicit custom test values directly in the body request.
- **URL**: `http://localhost:3000/api/scheduler/optimize`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Body** (JSON):
  ```json
  {
    "depots": [
      { "ID": "DEPOT-A", "MechanicHours": 10 },
      { "ID": "DEPOT-B", "MechanicHours": 5 }
    ],
    "tasks": [
      { "TaskID": "T-1", "Duration": 3, "Impact": 30 },
      { "TaskID": "T-2", "Duration": 4, "Impact": 50 },
      { "TaskID": "T-3", "Duration": 5, "Impact": 60 },
      { "TaskID": "T-4", "Duration": 2, "Impact": 20 }
    ]
  }
  ```

---

## 5. Expected API Responses

### A. Success Response (POST /optimize with custom payload)
**Status**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "schedule": [
      {
        "depotID": "DEPOT-A",
        "mechanicHoursLimit": 10,
        "totalImpact": 110,
        "totalDuration": 9,
        "selectedTasks": [
          { "TaskID": "T-2", "Duration": 4, "Impact": 50 },
          { "TaskID": "T-3", "Duration": 5, "Impact": 60 }
        ]
      },
      {
        "depotID": "DEPOT-B",
        "mechanicHoursLimit": 5,
        "totalImpact": 50,
        "totalDuration": 5,
        "selectedTasks": [
          { "TaskID": "T-1", "Duration": 3, "Impact": 30 },
          { "TaskID": "T-4", "Duration": 2, "Impact": 20 }
        ]
      }
    ],
    "aggregatedMetrics": {
      "totalDepotsProcessed": 2,
      "totalImpactAcrossDepots": 160,
      "totalDurationAcrossDepots": 14
    }
  }
}
```

### B. Validation or Route Not Found Response (404)
**Status**: `404 Not Found`
```json
{
  "status": "error",
  "error": {
    "message": "Resource not found: GET /api/scheduler/invalid-route",
    "status": 404
  }
}
```

### C. Error Response (500)
If the API endpoints fail and fallback is disabled, you will get:
**Status**: `500 Internal Server Error`
```json
{
  "status": "error",
  "error": {
    "message": "DEPOTS_API_URL is not configured and mock fallback is disabled.",
    "status": 500
  }
}
```

---

## 6. Code Quality & Optimization Opportunities

1. **Big-O Complexity**: 
   - **Time Complexity**: $O(D \cdot N \cdot W)$, where $D$ is the number of depots, $N$ is the number of maintenance tasks, and $W$ is the maximum `MechanicHours` value. This is highly efficient for typical scheduling inputs.
   - **Space Complexity**: $O(N \cdot W)$ per depot to maintain the dynamic programming table. Can be optimized to $O(W)$ if task reconstruction is not needed (or by storing only the previous row), but keeping it allows traceback to obtain the exact selected tasks list.
2. **Axios Timeout & Resiliency**:
   - Each endpoint request includes a `timeout` configuration of 5000ms, ensuring that slow downstream microservices do not tie up the event loop resources indefinitely.
3. **Resilient Logging isolation**:
   - The logging wrapper runs asynchronously and handles internal exceptions gracefully, guaranteeing that error audit logging failures never break primary application flows.
