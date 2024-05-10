# HnJobs

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

When `direnv` finished setting up the environment using devbox, simply run `yarn` from the `frondend` folder to install all dependencies:
```bash
yarn install
```

## Run

### With Devbox
Just run `devbox services up` from your terminal.

### Without Devbox

For the frontend, `cd` to `frontend` folder and run `yarn dev` or run `yarn` as follows:
```bash
yarn --cwd ./frontend dev
```
