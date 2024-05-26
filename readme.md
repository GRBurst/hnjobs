# HnJobs

Online at https://grburst.github.io/hnjobs

## Desktop Screenshots

<p float="left">
<img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-startpage_dm.png?raw=true" alt="startpage dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-startpage_lm.png?raw=true" alt="startpage light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-3_active_filters_dm.png?raw=true" alt="3 active filters in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-3_active_filters_lm.png?raw=true" alt="3 active filters in light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-custom_filters_dm.png?raw=true" alt="custom filters in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-custom_filters_lm.png?raw=true" alt="custom filters in light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-single_filter_dm.png?raw=true" alt="single filter active in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-single_filter_lm.png?raw=true" alt="single filter active in light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-3_active_filters_startpage_dm.png?raw=true" alt="3 active filters startpage view in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/HackerNews_Jobs-grburst.github.io-3_active_filters_startpage_lm.png?raw=true" alt="3 active filters startpage view in light mode" width="150px" />
</p>

## Mobile Screenshots

<p float="left">
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_3filters_dm.png?raw=true" alt="mobile 3 filters active in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_3filters_lm.png?raw=true" alt="mobile 3 filters active in light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_3filters-startpage_dm.png?raw=true" alt="mobile 3 filters startpage view in dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_3filters-startpage_lm.png?raw=true" alt="mobile 3 filters startpage view in light mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_startpage_dm.png?raw=true" alt="mobile startpage dark mode" width="150px" />
 <img src="https://github.com/grburst/hnjobs/blob/main/doc/assets/screenshots/mobile_startpage_lm.png?raw=true" alt="mobile startpage light mode" width="150px" />
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
