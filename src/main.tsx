import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// HashRouter shim: garante que /auth e /admin funcionem mesmo sem o # na URL
const { pathname, hash, search } = window.location;
if (!hash && pathname !== "/") {
  const newUrl = `${window.location.origin}/#${pathname}${search}`;
  window.location.replace(newUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
