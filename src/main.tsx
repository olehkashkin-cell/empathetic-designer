import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Force rebuild with React 19.2.0 and ReactDOM 19.2.0
createRoot(document.getElementById("root")!).render(<App />);
