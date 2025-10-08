import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { TradeDataProvider } from "./context/TradeDataContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CurrencyProvider>
      <TradeDataProvider>
        <App />
      </TradeDataProvider>
    </CurrencyProvider>
  </React.StrictMode>
);
