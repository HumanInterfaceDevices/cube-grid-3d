import React from "react";
import ReactDOM from "react-dom/client";

import "./css/App.css";
import "./css/controls.css";
import "./css/slider.css";
import "./css/button.css";

import { GridProvider } from "./context/GridProvider";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <GridProvider> */}
      <App />
    {/* </GridProvider> */}
  </React.StrictMode>
);

