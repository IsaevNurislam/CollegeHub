# AI Coding Instructions for College Hub

## Project Overview
**College Hub** is a React + Vite student community management platform featuring a campus news feed, club directory, project discovery, activity tracking, and a responsive dashboard. Built with Tailwind CSS and Lucide React icons.

## Architecture & Data Flow

### Component Structure
- **App.jsx** (root): Manages global state (auth, active tab, search), renders layout with sidebar + main content
- **View Components** (`src/components/views/`): Tab-based pages (Home, Clubs, Projects, Activity, Schedule)
  - HomeView: News feed, club sidebar, next class info
  - ClubsView, ProjectsView, ActivityView, ScheduleView: Filtered displays
- **Layout Components** (`src/components/layout/`): SidebarItem (navigation buttons)
- **Common Components** (`src/components/common/UI.jsx`): Reusable Card and Badge components

### State Management
All state lives in `App.jsx` with `useState` hooks. **No external state management** (Redux, Context API) is used.
- **Critical flows**:
  1. `handleLogin()` → sets auth + user from mockData
  2. `handleLikePost()` → mutates newsFeed state with immutable spread pattern
  3. Search filtering: `useMemo()` filters news/clubs/projects by title/author/description (case-insensitive)

### Data Source
Mock data in `src/data/mockData.js`:
- INITIAL_NEWS_FEED, INITIAL_CLUBS, INITIAL_PROJECTS, USER_ACTIVITIES, MOCK_USER
- Structure is flat (no nested relationships); IDs used for references (e.g., user.joinedClubs = [1, 4])

## Key Patterns & Conventions

### Component Props Naming
- Boolean callbacks: `handle{Action}` (e.g., `handleLikePost`, `handleLogin`)
- Tab navigation: `setActiveTab()` passed to components to change views
- Filters passed as `filtered{Plural}` arrays to views

### Styling
- **Tailwind CSS** exclusively; no CSS modules or styled-components
- **Responsive design**: 
  - Mobile-first breakpoints: `sm:`, `md:`, `lg:` (lg = 1024px breakpoint for sidebar toggle)
  - Grid: `grid-cols-1 lg:grid-cols-3` for responsive layouts
- **Color scheme**: Primary `sky-600/sky-50`, neutral grays, accent colors (blue, green, purple) per club
- **Icons**: Lucide React (e.g., `<Home size={20} />`)

### Defensive Programming
- **Nullable checks**: `(schedule && schedule.length > 0) ? schedule[0] : fallback` for safe array access
- **Truncation**: `truncate` class on text to prevent overflow; `flex-shrink-0` on fixed-width elements
- **Immutable updates**: Always use spread operator for state mutations (e.g., `...post, liked: !post.liked`)

### Form Inputs
- Search input: `<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />`
- Placeholder text uses domain language (Russian in this project)

## Build & Development Workflow

### Commands
- `npm run dev` → Start Vite dev server with HMR (Hot Module Replacement)
- `npm run build` → Production build to `dist/`
- `npm run lint` → ESLint check (no auto-fix)
- `npm run preview` → Local preview of production build

### Entry Points
- HTML: `index.html` (root div with id="root")
- JS: `src/main.jsx` → renders `<App />` with StrictMode
- CSS: `src/index.css` (global Tailwind imports)

### ESLint Rules
- No unused variables allowed (`no-unused-vars` error) except uppercase identifiers (e.g., icon imports like `Home`)
- React Hooks and React Refresh rules enforced
- Run `npm run lint` after major changes

## Common Development Tasks

### Adding a New View Tab
1. Create component in `src/components/views/{Name}View.jsx`
2. Import data from `src/data/mockData.js` (e.g., `INITIAL_CLUBS`)
3. Add case to `renderView()` switch in App.jsx
4. Add SidebarItem in sidebar nav with icon, label, onClick handler

### Adding Mock Data
- Edit `src/data/mockData.js`
- Follow existing object structure (id, title/name, author, etc.)
- Reference arrays by ID in related objects (e.g., `user.joinedClubs = [1, 4]`)

### Responsive Layout
- Use Tailwind's responsive classes: `hidden lg:block` for desktop-only, `lg:hidden` for mobile
- Test on mobile (sm: 640px) and tablet (md: 768px) breakpoints
- Sidebar uses fixed/absolute positioning and transform for mobile drawer effect

## Important Files & References
- **App.jsx**: State hub; view routing; search logic
- **src/components/views/HomeView.jsx**: Primary example of view component structure
- **src/data/mockData.js**: All static data; modify here for feature testing
- **tailwind.config.js**: Minimal config; extends default theme
- **eslint.config.js**: Flat config format with React Hooks enforcement

## Known Constraints
- No TypeScript; JSX-only (React 19, no type safety)
- No backend/API integration; all data is mock
- Mobile sidebar uses fixed positioning (z-index 30); overlay z-index 20
- Search is client-side only; affects all views in real-time
