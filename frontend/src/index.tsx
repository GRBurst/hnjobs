import "@radix-ui/themes/styles.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { Theme } from '@radix-ui/themes';

import { FirebaseAppProvider } from "reactfire";
import HnJobs from "./components/HnJobs";


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
    <Theme>
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <HnJobs />
      </FirebaseAppProvider>
    </Theme>
  </React.StrictMode>
);
