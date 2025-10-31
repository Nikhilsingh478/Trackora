# Trackora — 30‑Day Habit Tracker

**Trackora** is a polished, front-end-first 30‑day habit & sleep tracker built with modern web technologies. It’s designed to be fast, accessible, and visually focused so users can add custom protocols (habits), mark daily progress on a 30‑day grid, track sleep with a connected line graph, and view weekly/monthly analysis — all while keeping data local (no backend required).

---

## Key highlights

* **Frontend-only**: All user data persists locally (LocalStorage / optional IndexedDB). No server required.
* **Custom protocols**: Add, edit, reorder, and remove protocols.
* **30‑day grid**: Sticky protocol column + horizontally scrollable date grid (works for any month).
* **Sleep tracker**: Hard-coded sleep options (10–5 hrs) with live connected line graph.
* **Analysis views**: Weekly and monthly analytics with charts and highlights.
* **Export / Import**: JSON & CSV export for backups and sharing.
* **Print friendly**: Dedicated print stylesheet for physical copies.
* **Design & UX**: Responsive layout, dark mode, smooth micro‑animations (Framer Motion), and accessible keyboard navigation.

---

## Tech stack

* React + TypeScript (Vite)
* Tailwind CSS for styling
* Framer Motion for UI micro‑animations
* Recharts / SVG for charts and the sleep line
* localForage (optional) for IndexedDB fallback

---

## Quick start (development)

**Prerequisites**: Node.js (LTS recommended — v18 or v20), npm (or pnpm/yarn).

```bash
# 1. Clone
git clone https://github.com/Nikhilsingh478/Trackora.git
cd Trackora

# 2. Install deps
npm install
# or use pnpm: pnpm install

# 3. Run dev server
npm run dev
# open http://localhost:3000 (configured in vite.config.ts)
```

---

## Build & Deploy

To build a production bundle:

```bash
npm run build
```

> **Vercel note:** By default Vite outputs to `dist`. The project includes `vite.config.ts` configured with `outDir: 'dist'` so Vercel will detect the correct output. If you customize the Vite config or Vercel settings, ensure the Vercel **Output Directory** points to `dist`.

Recommended deployment: **Vercel** or **Netlify** (zero-config for static SPA) — both support the built artifact directly.

---

## Project structure (high level)

```
/ (root)
├─ public/               # static assets, favicon, manifest
├─ src/
│  ├─ components/        # UI components (Dashboard, TopNav, SleepTracker...)
│  ├─ contexts/          # React contexts (Data, Theme)
│  ├─ hooks/             # custom hooks (useLocalStorage...)
│  ├─ styles/            # global and utility styles
│  └─ main.tsx
├─ vite.config.ts
├─ package.json
└─ README.md
```

---

## Configuration & conventions

* **Data persistence**: Stored per profile and month under a single versioned schema in LocalStorage. Use `schemaVersion` to enable migrations.
* **Grid behavior**: Protocol column is sticky (left). Date grid is horizontally scrollable and supports pointer drag to toggle cells.
* **Accessibility**: Cells are keyboard-focusable buttons with ARIA attributes. Charts and analysis pages include textual summaries for screen readers.

---

## Coding standards & contribution

We value clean, maintainable code and welcome contributions.

**Before you open a PR:**

1. Fork the repo and create a feature branch.
2. Run `npm install` and `npm run dev`.
3. Keep changes scoped, and include tests or documentation for major features.
4. Follow the existing folder structure and naming conventions.

**Suggested workflow:**

```bash
git checkout -b feat/your-feature
# implement changes
git add .
git commit -m "feat: short description"
git push origin feat/your-feature
# open a PR on GitHub
```

---

## Troubleshooting & tips

* If development starts slowly on Windows, consider:

  * Excluding your project folder from Windows Defender / antivirus scanning.
  * Moving projects out of `Downloads` / OneDrive to a plain path like `C:\Projects`.
  * Using `pnpm` for faster installs.
* If TypeScript reports missing JSX types, ensure `@types/react` and `@types/react-dom` are installed as devDependencies:

```bash
npm install --save-dev @types/react @types/react-dom
```

---

## Roadmap & ideas

* Cloud sync (optional, encrypted)
* User accounts & backup export
* CSV columns customization on export
* More granular analytics and habit grouping

If you want any of these implemented, open an issue or a discussion!

---

## License & credits

This project is open source — choose a license that fits your goals (MIT recommended for permissive use).

Design inspiration: original Figma file (link included in repo).

---

## Contact

For questions or collaboration: open an issue or reach out on GitHub.

---

*Trackora — small daily actions, big compound results.*
