# GeoMine Solutions (React dummy site)

React + Vite website template with **dummy** mining/geotech consultancy content (inspired by the layout/sections commonly found on sites like `gtmsind.com` and `gemssalem.com`).

## Run locally

```bash
cd mining-website
npm install
npm run dev
```

Then open the URL shown in your terminal (usually `http://localhost:5173`).

## Customize

- **Site copy / phone / email**: `src/content/siteData.js`
- **Pages**: `src/pages/*`
- **Navbar / footer**: `src/components/Navbar.jsx`, `src/components/Footer.jsx`
- **Theme styles**: `src/index.css` (Tailwind utilities + a few reusable component classes)

## Build

```bash
npm run build
npm run preview
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
