import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import initI18n from "./i18n";
import "./index.css";

function applyTheme() {
  const saved = localStorage.getItem("portman-theme");
  if (saved === "dark") document.documentElement.classList.add("dark");
  else if (saved === "light") document.documentElement.classList.remove("dark");
  else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }
}
applyTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

async function startApp() {
  await initI18n();
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

startApp();
