# HnJobs

Online at https://grburst.github.io/hnjobs

<p float="left">
<img alt="mobile startpage light mode" src="https://github.com/grburst/hnjobs/blob/update-readme/doc/assets/screenshots/mobile_startpage_lm.png?raw=true" width="150px"/>
</p>


## Technologies + Frameworks

- [React](https://react.dev/) TypeScript Frontend
- [Vite](https://vitejs.dev/) hot reloading and serving
- [devbox](https://github.com/jetify-com/devbox) for a reproducible dev environment
- [direnv](https://github.com/direnv/direnv) to automatically load dev environment when entering project directory
- [Effect-TS/effect](https://github.com/Effect-TS/effect) for async calls and effect management
- [Reactfire](https://github.com/FirebaseExtended/reactfire/blob/main/docs/quickstart.md) for Realtime Database connection to Hackernews Firabase
- [sqlite-wasm-http](https://github.com/mmomtchev/sqlite-wasm-http#readme) for partial requests to static served sqlite3 db (not online yet)
- [ant design](https://github.com/ant-design/ant-design) as components framework.
- [Reaviz](https://github.com/reaviz/reaviz) for Venn Diagrams.

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
