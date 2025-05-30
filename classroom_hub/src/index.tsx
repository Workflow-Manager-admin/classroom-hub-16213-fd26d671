import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import "./session";

// Ensure root HTML element is present and non-null.
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element with id 'root' not found in index.html.");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
