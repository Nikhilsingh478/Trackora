# Trackora - 30-Day Habit Tracker Application

## Overview
**Trackora** is a premium, high-performance web application designed to help users track their habits (protocols) and sleep patterns over 30-day cycles. Built with a focus on aesthetics, interactivity, and discipline, it offers a visually stunning interface with robust functionality for tracking daily progress, analyzing trends, and maintaining consistency.

---

## 🚀 Tech Stack

### Core Technologies
- **Framework**: React 18 (via Vite)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4.1.3 (with custom CSS variables)
- **Animation**: Motion (formerly Framer Motion) for fluid transitions
- **Icons**: Lucide React
- **State Management**: React Context (`DataContext`, `ThemeContext`) + LocalStorage persistence

### UI Components & Libraries
- **Component Library**: Custom implementation using Radix UI primitives (shadcn/ui style pattern)
- **Charts**: Recharts (for Weekly/Monthly analysis) & Custom SVG Graphs (Sleep Tracker)
- **Notifications**: Sonner (Toast notifications)
- **Date Handling**: Native Date object utilities
- **Build Tool**: Vite 6.3.5

---

## 🎨 Design & UI/UX

### Design Philosophy
The application follows a **"Glassmorphism"** and **"Premium Modern"** aesthetic.
- **Visuals**: Heavy use of translucent backgrounds (`backdrop-blur`), subtle borders (`border-white/10`), and deep, rich gradients.
- **Interactivity**: 
  - Hover effects on almost every interactive element.
  - Smooth transitions (`transition-all`, `motion` animations) for opening dialogs, expanding sections, and filling tracker cells.
  - Responsive layout that adapts seamlessly from Desktop to Mobile.

### Color Palette
The application uses a semantic color system defined in CSS variables (`index.css`), supporting both Light and Dark modes (defaulting to a dark, sleek theme).

**Primary Colors (Tailwind v4 Variables):**
- **Cyan**: `#06b6d4` (Default protocol color)
- **Purple**: `#8b5cf6` (Sleep tracker theme)
- **Pink**: `#ec4899` (Secondary accents)
- **Emerald**: `#10b981` (High success/Elite tier)
- **Blue**: `#3b82f6` (Pro tier)
- **Amber**: `#f59e0b` (Consistent tier)
- **Red**: `#ef4444` (Beginner tier/Error states)

**Theme Colors:**
- **Background**: `bg-gradient-to-br from-background via-background to-muted/20`
- **Cards**: `bg-card` (usually a dark, semi-transparent grey)
- **Text**: `text-foreground` (White/Off-white), `text-muted-foreground` (Grey)

---

## 📱 User Interface (UI)

### 1. Dashboard (Main View)
The central hub of the application.

#### **Protocol Grid**
- **Sticky Layout**: 
  - **Top Row**: Days of the month (Sun-Sat) stay fixed while scrolling vertically.
  - **Left Column**: Protocol names stay fixed while scrolling horizontally.
  - **Desktop**: Protocol column is `220px`.
  - **Mobile**: Protocol column compresses to `160px` with text truncation.
- **Protocol Management**:
  - **Add**: "Add Protocol" button at the bottom of the list. Opens a dialog to set Name (max 20 chars) and Color.
  - **Edit/Delete**: Hovering over a protocol name reveals Edit (Pencil) and Delete (Trash) icons.
  - **Completion Stats**: Shows a mini percentage next to the name.
- **Cell Interaction**:
  - **Click**: Toggles completion (fills cell with protocol's assigned color).
  - **Drag**: Click and drag across multiple cells to batch-fill or batch-clear.
  - **Shift+Click**: Range selection to fill all days between two clicks.
  - **Right-Click**: Opens a context menu to add a text **Note** to that specific day. A small yellow sticky note icon appears on cells with notes.

#### **Discipline Meter**
A gamified progress bar at the top of the dashboard.
- **Function**: Calculates an overall discipline score based on `(Total Completed / Total Possible) * 100`.
- **Tiers**:
  - **Elite**: 90%+ (Emerald Green)
  - **Pro**: 75-89% (Blue)
  - **Consistent**: 50-74% (Amber)
  - **Beginner**: <50% (Red)
- **Visuals**: Animated progress bar with a "shine" effect.

#### **Sleep Tracker**
Located below the protocol grid.
- **Graph**: Custom SVG line graph showing sleep hours trend with bezier curves and gradient fills (Purple to Pink).
- **Input**: Grid of buttons allowing users to log sleep from 4 hours to 10 hours per day.
- **Interactivity**: Hovering over graph points shows detailed tooltips.

### 2. Analysis Views
- **Weekly Analysis**: Visualization (Bar/Line charts) of performance aggregated by week. Good for spotting weekly trends.
- **Monthly Analysis**: High-level summary of the entire month's performance.

### 3. Settings
- **Profile Management**: Manage different local user profiles.
- **Data Management**: options to Export data (JSON) or Import data.
- **Clear Data**: Dangerous actions to wipe the current month or all data.

---

## ⚙️ Functionality & Logic

### Data Model (`DataContext`)
The app uses a robust schema stored in `localStorage` under key `tracker-data-v2`.
- **Structure**:
  - `profiles`: Map of user profiles.
  - `months`: Each profile contains data for specific months (key: `YYYY-MM`).
  - `protocols`: Array of habits defined for that month.
  - `cells`: Flat map of completion data.
    - Key format: `protocolId::YYYY-MM-DD` -> `boolean`
    - Sleep key: `sleep::YYYY-MM-DD` -> `string` ('8hr')
    - Note key: `note::protocolId::YYYY-MM-DD` -> `string`

### Optimizations
1.  **Rendering Performance**:
    - **Virtualization**: The protocol grid uses sticky positioning to handle large datasets without complex virtualization libraries, keeping the DOM relatively light while maintaining usability.
    - **Memoization**: `useMemo` and `useCallback` are used extensively in `DataContext` to prevent unnecessary re-renders of the grid.
2.  **Interaction latency**:
    - Optimistic UI updates (state updates immediately before persistence).
    - Event delegation for global pointer up events to handle drag-outside-bounds scenarios.

### Mobile Responsiveness
- **Adaptive Layout**: The main container is `max-w-[1600px]` but shrinks to fit smaller screens.
- **Touch Targets**: Buttons and grid cells are sized (`w-12`, `h-12`) to be touch-friendly.
- **Scroll Snap**: The grid supports smooth scrolling on touch devices.

---

## 📄 File Structure Overview

- `src/App.tsx`: Main router and layout shell.
- `src/components/Dashboard.tsx`: Primary view containing the Grid and Discipline Meter.
- `src/components/SleepTracker.tsx`: Standalone visualization and input for sleep.
- `src/components/DisciplineMeter.tsx`: Score calculation and animated bar.
- `src/contexts/DataContext.tsx`: Core logic, state management, and simple "database" layer.
- `src/index.css`: Global styles and Tailwind configuration.
