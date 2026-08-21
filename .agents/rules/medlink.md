---
trigger: always_on
---

🏥 MedLink OS — Project Analysis Report
1. Overview
MedLink OS is a full-featured medical center management system (نظام إدارة مركز طبي) built as a single-page application. It is an Arabic-first (RTL) platform that manages patients, appointments, doctor sessions, invoicing, expenses, rooms, medical devices, and team staff — all driven by a role-based access control system with three distinct user roles.

Property	Value
Project Name	MedLink
Type	Medical Center Management SPA
Language	Arabic (RTL), JavaScript (JSX)
Framework	React 19 + Vite 8
Styling	Tailwind CSS v4 + OKLCH Design Tokens
State Management	TanStack React Query v5
Routing	React Router v7
API Client	Axios
Backend	Express.js middleware (dev) + remote backend proxy
Database (dev)	JSON file (db.json, ~337 KB seeded data)
2. Tech Stack Breakdown
Frontend
Library	Version	Purpose
react	19.2.8	UI framework
react-dom	19.2.8	DOM renderer
react-router-dom	7.18.2	Client-side routing
@tanstack/react-query	5.101.4	Server-state caching, mutations
tailwindcss	4.3.3	Utility-first CSS
framer-motion	13.0.0	Animations
recharts	3.10.1	Data visualization (charts)
lucide-react	1.28.0	Icon library
sonner	2.0.7	Toast notifications
axios	1.19.0	HTTP client
Backend / Dev Server
Library	Version	Purpose
express	5.2.1	API middleware during dev
json-server	1.0.0-beta.15	Dev JSON database
vite	8.2.0	Build tool & dev server
@vitejs/plugin-react	6.0.4	React HMR & transforms
Dev Tooling
Tool	Purpose
ESLint 10 + react-hooks/react-refresh plugins	Linting
esbuild	Fast JS bundler (used internally by Vite)
tsx	TypeScript/ESM script runner (for seed scripts)
3. Architecture & Code Structure
Server
Data Layer
Pages (21+)
Layout Layer
Routing Layer
Providers Layer
Entry Point
main.jsx
App.jsx
BrowserRouter
QueryClientProvider
AuthProvider
Sonner Toaster
AppRoutes.jsx
ProtectedRoute.jsx
routePermissions.js
AppLayout.jsx
Sidebar
Navbar
FloatingQuickActions
LiveOperationsWindow
Dashboards x4
Patients
Appointments
Doctor Sessions
Invoices
Expenses
Rooms
Team
...and 10+ more
29 Custom Hooks
API Client (Axios)
28 Helper Modules
Services
Vite Dev Server
Express API Middleware
db.json
Remote Backend Proxy
Source Code Statistics
Category	Count
Total source files	263
React components (.jsx)	178
JavaScript modules (.js)	80
Custom hooks	29
Helper modules	28
UI constants	6
Utility modules	8
Pages	21+
Total source code size	~1.2 MB
Server API router	1,482 lines
Seed script	466 lines
4. Key Modules Deep Dive
4.1 Authentication & Authorization
File	Purpose
AuthContext.jsx
React context providing user, login, logout, refreshSession, updateUser
authService.js
Login/logout, JWT token management, session persistence via localStorage
client.js
Axios interceptors for auto-attaching Bearer tokens + automatic 401 refresh queue
Key features:

JWT-based authentication with automatic token refresh (proactive, 2 min before expiry)
Silent retry queue for concurrent 401 responses during refresh
Session persistence in localStorage (medlink_token, medlink_branch_id)
Multi-branch support via X-Branch-Id header
4.2 Role-Based Access Control (RBAC)
Three user roles with hierarchical permissions:

Role	Arabic Label	Access Level
Owner	مالك المركز	Full access (* wildcard)
Secretary	سكرتارية	Patients, appointments, follow-ups, billing, rooms, packages, archive
Doctor	طبيب	Patients (read), appointments (read), sessions, clinical notes, prescriptions
Key files:

roles.js
 — Role constants
permissions.js
 — Fine-grained permission matrix (supports both : and . notation)
routePermissions.js
 — Route-level access control
ProtectedRoute.jsx
 — Route guard component
PermissionGuard.jsx
 — Inline permission guard
4.3 Dashboards (Role-specific)
Dashboard	Route	Target Role
OwnerDashboardPage.jsx
/dashboard/owner	Owner
SecretaryDashboardPage.jsx
/dashboard/secretary	Secretary
DoctorDashboardPage.jsx
/dashboard/doctor	Doctor
CenterPulsePage.jsx
/pulse	Owner (real-time center overview)
4.4 Feature Modules
Module	Key Files	Description
Patients	PatientsPage, PatientDetailsPage, PatientCard, PatientTable, 7 sub-components	Full CRUD, profile, medical history, packages
Appointments	AppointmentsPage, AppointmentModal, AppointmentCard, stats	Scheduling, status tracking, statistics
Doctor Sessions	DoctorSessionsPage, SessionDetailsPage, DoctorSessionCard	Session lifecycle (start/end), clinical notes
Invoicing	InvoicesPage, invoice components, print helpers	Create, view, print invoices with A4 formatting
Expenses	ExpensesPage, expense helpers	Expense tracking and reporting
Rooms	RoomsPage, room components	Room management and status
Medical Devices	MedicalDevicesPage, device tables, stats	Device inventory and maintenance
Maintenance	MaintenancePage, maintenance table	Equipment maintenance tracking
Team	TeamPage, team components	Staff management
Packages	PackageTemplatesPage, assignment modals	Treatment package templates + patient assignment
Follow-up	PatientFollowUpPage, follow-up table	Post-treatment patient follow-up
Notifications	NotificationsPage, notification service	Real-time notification system with sound support
Archive	ArchivePage, archive helpers	Soft-delete archive with restore capability
Live Operations	LiveOperationsWindow, 5 sub-components	Real-time operations monitoring window
Center Pulse	Pulse components (7 files)	Live center status — doctors, rooms, devices, waiting queue
4.5 Data Charts & Visualization
Built with Recharts, the project includes 6 reusable chart components:

AreaChartCard, BarChartCard, LineChartCard, PieChartCard, ComposedChartCard, ChartCard
Themed via 
chartColors.js
4.6 Server / API Layer
The dev backend is an Express middleware embedded directly in the Vite dev server (
apiRouter.js
, 1,482 lines). It:

Reads/writes from a local 
db.json
 file (~337 KB of seeded data)
Proxies to a remote backend at https://lanwan.seifeldeendev.com for auth (with fallback to local)
Provides full CRUD on all collections with pagination, filtering, search
Handles auth (login, logout, refresh, bootstrap-owner, forgot/reset password)
Implements archive/restore, file uploads, and specialized endpoints
5. Design System
Theme
Color system: OKLCH color space with CSS custom properties
Font: Cairo (Arabic-optimized Google Font) at weight 500 base
Border radius: 0.9rem default
Dark mode: Full dark theme support via .dark class toggle
Print styles: A4 page format with proper invoice print layout
UI Component Library (13 reusable components)
Component	Purpose
ConfirmModal	Generic confirmation dialog
CustomSelect	Styled select dropdown
Dropdown	Generic dropdown menu
EmptyState	Empty data placeholder
ErrorState	Error display
LoadingState	Loading spinner
ReusableForm	Generic form builder
ReusableTable	Data table with sorting
SearchBar	Search input
StatCard	KPI/metric card
StatusFilterDropdown	Status filter UI
TabToggleGroup	Tab switcher
AssessmentSlider	Assessment range input
6. Strengths ✅
Well-organized architecture — Clean separation of concerns with hooks, helpers, constants, services, contexts, and components.
Comprehensive RBAC — Granular permission system at both route and component levels with dual-notation support.
Robust auth flow — Proactive token refresh, retry queue for concurrent 401s, session persistence.
RTL-first design — Built from the ground up for Arabic with Cairo font and proper text direction.
Rich feature set — Covers the full lifecycle of a medical center: patients, appointments, sessions, billing, devices, rooms, team, follow-up, archive, and real-time operations.
Data visualization — 6 chart types with consistent theming for dashboard analytics.
Print support — Proper A4 print layout for invoices and prescriptions.
Dark mode — Full light/dark theme support.
Responsive layout — Mobile sidebar with overlay, collapsible desktop sidebar.
Dev DX — Self-contained dev experience with embedded API middleware, seed script, and hot reload (with db.json excluded from watch).
7. Areas for Improvement ⚠️
Code Quality
Issue	Details
No TypeScript	The project uses plain JavaScript. TypeScript would significantly improve maintainability and catch bugs at compile time. Type definitions are in devDependencies but unused.
No tests	No unit, integration, or e2e tests found.
Inconsistent permission notation	Permissions mix : and . separators (patients:view vs patients.read). The hasPermission() function handles both, but the inconsistency adds complexity.
Large monolith API file	
apiRouter.js
 is 1,482 lines in a single file. Should be split into route modules.
No error boundaries	No React Error Boundary components to gracefully handle runtime errors.
Architecture
Issue	Details
No lazy loading	All 21+ pages are eagerly imported in 
AppRoutes.jsx
. Should use React.lazy() + Suspense for code splitting.
No environment separation	VITE_API_URL is empty in .env. The remote backend URL is hardcoded in the server file.
Hardcoded branch ID	b1000000-1111-4111-8111-111111111111 is hardcoded in multiple places as the default branch.
db.json in version control	A 337 KB database file is committed. Should be .gitignore-d and generated via the seed script.
Security
Issue	Details
Token in localStorage	JWT tokens stored in localStorage are vulnerable to XSS. Consider httpOnly cookies for production.
No CSRF protection	The app sends X-CSRF-Token headers if present but doesn't enforce CSRF protection.
Client-side-only auth	The dev middleware relies on client-side role detection from the username string (e.g., "sec" → Secretary).
UX / Accessibility
Issue	Details
No i18n framework	Arabic strings are hardcoded everywhere. No mechanism for multi-language support.
No aria-* attributes	Most interactive elements lack proper ARIA labels.
Custom README	The README is the default Vite template. It should document the project, setup, and usage.
8. File Tree Summary

medlink/
├── .env                          # Environment variables
├── db.json                       # Seeded JSON database (337 KB)
├── index.html                    # SPA entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite + Tailwind + API middleware
├── scripts/
│   └── seed-db.mjs               # Database seed generator
├── server/
│   └── apiRouter.js              # Express API middleware (1,482 lines)
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.svg
└── src/
    ├── main.jsx                  # App entry point
    ├── App.jsx                   # Root component
    ├── index.css                 # Global styles + design tokens
    ├── api/
    │   └── client.js             # Axios instance + interceptors
    ├── auth/
    │   └── authService.js        # Auth logic
    ├── contexts/
    │   ├── AuthContext.jsx        # Auth provider
    │   └── authContextInstance.js # Context singleton
    ├── providers/
    │   └── AppProviders.jsx      # QueryClient + Auth + Toaster
    ├── routes/
    │   ├── AppRoutes.jsx         # All route definitions
    │   └── ProtectedRoute.jsx    # Role-based route guard
    ├── permissions/
    │   ├── roles.js              # Role constants
    │   ├── permissions.js        # Permission matrix
    │   └── routePermissions.js   # Route-level permissions
    ├── guards/
    │   └── PermissionGuard.jsx   # Inline permission guard
    ├── layouts/
    │   └── AppLayout.jsx         # Main app shell
    ├── hooks/ (29 files)         # Custom React hooks
    ├── helpers/ (28 files)       # Business logic helpers
    ├── constants/ (6 files)      # App constants
    ├── utils/ (8 files)          # Utility functions
    ├── services/
    │   └── notificationService.js
    ├── components/
    │   ├── ui/ (13 files)        # Reusable UI primitives
    │   ├── dashboard/ (15 files) # Dashboard widgets
    │   ├── charts/ (7 files)     # Chart components
    │   ├── patients/ (8 files)   # Patient components
    │   ├── live-operations/ (6)  # Real-time ops
    │   ├── pulse/ (7 files)      # Center pulse widgets
    │   └── ... (10+ more dirs)   # Feature-specific components