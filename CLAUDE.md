# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

MedLink is a clinic/medical-center management dashboard (patients, appointments, doctor sessions, devices, maintenance, services, treatment packages, rooms). It is a React SPA with a `json-server` mock REST backend. All UI text and copy is in Arabic, and the layout is RTL-aware (e.g. table headers use `text-right`, icons/chevrons are mirrored).

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run server` — start the `json-server` API backend (`db.json`) on port 5000, with `--watch`. **The app requires this running** — `src/services/api.js` hardcodes `API_BASE_URL = "http://localhost:5000"`. Run dev server and API server in two separate terminals.
- `npm run build` — production build via Vite.
- `npm run preview` — preview the production build.
- `npm run lint` — run ESLint over the project.
- No test runner is configured in this repo.

## Architecture

### Data layer: db.json as the source of truth

`db.json` at the repo root is the entire "database," served via `json-server`. Its schema (`$schema` key inside the file) is much larger than what's currently wired into the UI — it includes tables for `patient_medical_history`, `invoices`, `payments`, `treatment_sessions`, `audit_logs`, `notifications`, etc. that don't yet have hooks/pages. When adding a feature, check `db.json` first to see if the backing collection already exists before inventing a new shape.

Vite's dev-server file watcher explicitly ignores `db.json` (see `vite.config.js`) so editing/seeding data doesn't trigger an HMR reload of the whole app.

### API + data-fetching pattern

- `src/services/api.js` exports a single `apiRequest(endpoint, options)` helper wrapping `fetch` against the json-server base URL, JSON-encoding bodies and throwing on non-OK responses.
- Every resource gets its own hook in `src/hooks/` (e.g. `usePatients`, `useAppointments`) built on TanStack Query (`useQuery` + `useMutation`). Each hook follows the same shape:
  - one `useQuery` per collection (`queryKey: ["resource"]`, `queryFn: () => apiRequest("/resource")`), with `staleTime`/`gcTime` set and `refetchOnWindowFocus`/`refetchOnReconnect`/`refetchOnMount` disabled (data is treated as effectively static / manually invalidated).
  - `addMutation` / `updateMutation` / `deleteMutation` using `apiRequest` with POST/PUT/DELETE, each calling `queryClient.invalidateQueries` on success instead of manual cache patching.
  - the hook return value spreads the query result and adds normalized names: `{ resource: data ?? [], addResource, updateResource, deleteResource, isAdding, isUpdating, isDeleting }`.
- Some hooks (e.g. `useAppointments`) fetch multiple related collections (patients, staff, services) and manually "join" them client-side into an enriched array (matching foreign keys like `patient_id`/`doctor_id`/`service_id`) since json-server has no real relational joins. Follow this pattern for any new cross-entity view rather than adding backend logic.
- A single global `QueryClient` is created in `src/main.jsx` and provided via `QueryClientProvider`.

### Routing & layout

- Routing is centralized in `src/App.jsx` using `react-router-dom` (`Routes`/`Route`), all wrapped in `AppLayout`. `/` redirects to `/patients`.
- `src/components/AppLayout.jsx` owns the shell: sidebar (desktop `<aside>` + mobile drawer), sticky header with `Navbar`, and dark-mode toggling via a `dark` class on the root element (Tailwind v4 dark-mode-by-class). Dark mode and sidebar-collapsed state live as local `useState` in `AppLayout`, not global state — there's no theme/auth context yet.
- `src/constants/sidebarData.js` defines `SIDEBAR_SECTIONS`, the single source of truth for sidebar nav items/icons/routes. Some entries point at routes not yet registered in `App.jsx` (e.g. `/pulse`, `/team`, `/attendance`) — check both files when adding a nav item so link and route stay in sync.

### Page/component conventions

Each resource typically follows this file layout:
- `src/hooks/use<Resource>.js` — data layer (see above).
- `src/pages/<Resource>Page.jsx` — top-level page: search/filter state, view-mode toggle (table vs. card grid is common, see `PatientsPage`), and wires the hook's CRUD callbacks into modals/tables.
- `src/components/<resource>/` or flat in `src/components/` — presentational pieces: a `*Table.jsx`, `*Card.jsx`, `Add*Modal.jsx`, `Edit*Modal.jsx`, `Delete*Modal.jsx` per resource. Patients group these under `src/components/patients/`; older/simpler resources keep components flat in `src/components/`.
- `src/components/ui/` holds cross-resource generic building blocks: `ReusableTable` (paginated table driven by a `columns` config with `{ header, accessor, render, className }`), `ReusableForm` (config-driven modal form driven by a `fields` array supporting `select`/`text`/etc, using `CustomSelect` for selects), `CustomSelect`, `Dropdown`, `ConfirmModal`. Prefer `ReusableTable`/`ReusableForm` for new simple CRUD screens instead of hand-rolling a table/form.
- Modals manage their own `isSubmitting` state and call `onClose()` after the mutation resolves; parent pages own `isOpen`/`selected<Entity>` state.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` — config is CSS-first in `src/index.css` using `@theme`). Design tokens (`--background`, `--primary`, `--card`, `--sidebar`, etc.) are defined as OKLCH CSS variables in `:root` and overridden in `.dark`; components reference them through Tailwind utility classes like `bg-background`, `text-muted-foreground`, `border-border`. Font is Cairo (loaded via Google Fonts import in `index.css`), applied through `font-['Cairo',sans-serif]` in `AppLayout`.

## Engineering Rules

This project must always follow these rules.

### General

- JavaScript only. Never use TypeScript.
- Never use Redux.
- Prefer React Query for server state.
- Prefer Axios for HTTP calls.
- Use JSON Server as the backend.
- Never break existing functionality.
- Always preserve backward compatibility.

### Architecture

Always follow Clean Architecture. Keep these concerns in separate, dedicated folders and never mix responsibilities across them:

- `pages`
- `layouts`
- `components`
- `ui`
- `charts`
- `hooks`
- `services`
- `api`
- `contexts`
- `providers`
- `routes`
- `guards`
- `permissions`
- `utils`
- `helpers`
- `constants`

### Components

- Single responsibility per component.
- Target size: 50–150 lines. Avoid files larger than 200 lines.
- If a component becomes too large, split it into smaller reusable components.
- Never duplicate JSX — extract a shared component instead.

### Pages

Pages should only:

- fetch data
- render components
- manage page state

Do not place business logic inside pages.

### Business Logic

Move calculations into hooks, services, or utils. Never calculate statistics inside JSX.

### API

- Never call Axios directly inside components.
- All API calls must go through `services`.

### React Query

Each resource must have a `useQuery`, its mutations, and cache invalidation on mutation success. Follow the existing project pattern (see "API + data-fetching pattern" above).

### RBAC

Implement Role-Based Access Control with three roles: `owner`, `secretary`, `doctor`.

Create:

- `roles.js`
- `permissions.js`
- `routePermissions.js`

Never hardcode permissions inside components. Use `ProtectedRoute` and permission guards.

### Sidebar

Generate the sidebar dynamically based on the user's role. Hide unauthorized pages.

### Dashboards

Each role must have its own dashboard.

- **Owner Dashboard** — analytics, revenue, reports, charts.
- **Secretary Dashboard** — appointments, waiting list, patients.
- **Doctor Dashboard** — today's patients, notes, prescriptions, session timer.

### Charts

Use ONLY Recharts. Create reusable chart components under `charts`. Never duplicate chart code.

### Code Quality

Follow SOLID, DRY, and Single Responsibility. Reuse components; avoid repeated code.

### Performance

Prefer `React.memo`, `useMemo`, and `useCallback`. Avoid unnecessary re-renders.

### Styling Rules

- Tailwind CSS only.
- Keep spacing and sizing consistent.
- Use existing design tokens (see "Styling" above) rather than inventing new colors/spacing.

### Before Creating New Files

Always search the project first. Reuse existing components whenever possible. Do not create duplicate functionality.

### Final Rule

Every change should improve the project structure, reduce duplicated code, improve readability, and keep the codebase scalable and maintainable.
