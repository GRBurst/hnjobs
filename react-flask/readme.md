# React Playground: React + Flask

## Technologies + Frameworks

- React TypeScript Frontend
- Flask Python Backend
- Vite hot reloading and serving
- devbox for a reproducible dev environment
- direnv to automatically load dev environment when entering project directory

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
