# React Playground: React + Vite + Flask

## Technologies + Frameworks

- React TypeScript Frontend
- Flask Python Backend
- Vite hot reloading and serving
- devbox for a reproducible dev environment
- direnv to automatically load dev environment when entering project directory

## Setup

Install `devbox` and `direnv`.
Allow `direnv` to automatically run the `.envrc`.

```bash
direnv allow
```

When `direnv` finished setting up the environment using devbox, simply run `yarn` from the `frondend` folder to install all dependencies:
```bash
yarn install
```

## Run

For the frontend, simply run `yarn dev`:
```bash
yarn dev
```
Check the output for the address under which the project is project is served.
## Run

For the frontend, `cd` to `frontend` folder and run `yarn dev` or run `yarn` as follows:
```bash
yarn --cwd ./frontend dev
```

In a second terminal, run the backend by `cd` to the `backend` folder and run `flask`:
```bash
cd backend
flask --app login run
```
