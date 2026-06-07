# Logging Middleware Package

A reusable logging library built for Express applications to integrate with the evaluation service logging API.

## Features

- **OAuth2 Token Authentication**: Authenticates with `CLIENT_ID` and `CLIENT_SECRET` to obtain a Bearer token.
- **In-Memory Caching**: Caches access tokens with buffer offsets to minimize authentication requests.
- **Robust Exception Isolation**: Logging errors are caught gracefully and logged locally, ensuring they never crash the parent application.
- **Universal Log Format**: Captures timestamps, stack traces, severity levels, and package names.

## API Usage

### `Log(stack, level, packageName, message)`

Asynchronous function to ship log data.

```javascript
const Log = require('logging-middleware');

// Example Info Log
await Log(null, 'INFO', 'vehicle_maintenance_scheduler', 'Scheduler successfully started');

// Example Error Log
try {
  throw new Error('Something went wrong');
} catch (error) {
  await Log(error.stack, 'ERROR', 'vehicle_maintenance_scheduler', error.message);
}
```

## Environment Setup

The package reads credentials from the environment:

- `CLIENT_ID`: OAuth client identifier.
- `CLIENT_SECRET`: OAuth client secret.
- `ACCESS_TOKEN`: Direct authorization token (fallback).
- `EVALUATION_AUTH_URL`: Endpoint to request token.
- `LOGGING_API_URL`: Endpoint to ship logs.
