# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Full stack workflow

1. Run `npm run install:all` to install dependencies for both sides. It executes `npm install` in the root workspace (frontend) and then runs the same command inside `backend/`, so you never miss backend-only packages such as `express`, `sqlite3`, or `dotenv`.
2. Start everything with `npm run start:all`. This script uses `concurrently` to launch `npm run dev` (Vite) and `npm run start:backend` (Express in watch mode).
	- Vite serves the UI on `http://localhost:5173` and proxies `/api` calls to `http://localhost:3000` (see `vite.config.js`). Keep the backend listening on port `3000` so the proxy works, or change `PORT` and the proxy target together if you need a different value.
	- The backend terminal prints the SQLite connection status and startup confirmation. Error handling is already wired: you’ll see logs such as `Database connection error` or `listen EADDRINUSE` before the process exits.
3. If the backend fails to start, run `npm --prefix backend run check:db` to verify `backend/database.sqlite` exists, permits read/write access, and responds to a simple `SELECT 1` query. A non-zero exit code indicates a configuration or permission issue.
4. Once both commands report they are listening, open `http://localhost:5173`. The React app transparently proxies `/api/*` calls to the Express server on port `3000`, so you don’t need to hardcode back-end URLs while developing.

### Error handling tips

- Database missing or locked? Delete `backend/database.sqlite` and restart `npm run start:backend`; the server re-creates the schema and seeds sample data. The startup logs already show the underlying SQLite error if the file is unreadable.
- Port conflict? If Express logs `Error: listen EADDRINUSE`, stop the conflicting process or set `PORT=3001` before `npm run start:backend`. Update the proxy target in `vite.config.js` or set `VITE_API_URL` for production builds so the front-end can still reach `/api` endpoints.
- Need to debug authentication/data issues? Check the backend terminal for `UNCaught Exception`/`Unhandled Rejection` handlers—they surface stack traces before the process exits, preventing silent failures.
- Frontend requests failing? Confirm the backend terminal shows matching `/api` logs, since all JSON requests flow through Vite’s proxy (`/api` → `http://localhost:3000`).

### Example commands

```powershell
# Windows / PowerShell
npm run install:all
npm run start:all
```

```bash
# Linux / macOS (bash)
npm run install:all
npm run start:all
```

Need only the backend for API tests? Run `npm run start:backend` separately. Likewise `npm run dev` launches just the frontend.
