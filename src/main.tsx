import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TrimProvider } from "./components/context/TrimContext.tsx";
import { TimeLineProvider } from "./components/context/TimeLineContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <TrimProvider>
        <TimeLineProvider>
          <App />
        </TimeLineProvider>
      </TrimProvider>
    </DndProvider>
  </StrictMode>
);
