# Tasky

Tasky is a minimal task tracking tool built with a Node.js backend and a React frontend. The UI features an infinite canvas where tasks and states can be linked and arranged freely.

## Project Structure

- `server/` – Express API server
- `client/` – React application powered by Vite

## Setup

```bash
npm install --prefix server
npm install --prefix client
```

### Development

Run the API server and frontend in separate terminals:

```bash
npm start --prefix server
npm run dev --prefix client
```

The frontend is served at `http://localhost:5173` and proxies API requests to `http://localhost:3001`.

### Production Build

```bash
npm run build --prefix client
```

## API Endpoints

- `GET /api/canvas` – fetch saved canvas data
- `POST /api/canvas` – persist canvas data

## License

ISC
