# React Playground: React + Vite

## Technologies + Frameworks

- React TypeScript Frontend
- Vite hot reloading and serving
- devbox for a reproducible dev environment
- direnv to automatically load dev environment when entering project directory

## Setup

Install `devbox` and `direnv`.
Allow `direnv` to automatically run the `.envrc`.

```bash
direnv allow
```

When `direnv` finished setting up the environment using devbox, simply run `yarn` to install all dependencies:
```bash
yarn install
```

## Run

For the frontend, simply run `yarn dev`:
```bash
yarn dev
```
Check the output for the address under which the project is project is served.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
