import React from "react";
import ReactDOM from "react-dom/client";

import { FirebaseAppProvider } from "reactfire";
import HnJobs from "./components/HnJobs";
import "./index.css";

const firebaseConfig = {
  databaseURL: "https://hacker-news.firebaseio.com",
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <HnJobs />
      </FirebaseAppProvider>
  </React.StrictMode>
);
