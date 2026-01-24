import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { store } from "./store";
import router from "./route/index.jsx";
import { Toaster } from "react-hot-toast";
import { getUserFromStorage } from "./store/slices/Auth.slice.js";

store.dispatch(getUserFromStorage());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.log("SW Registration failed:", err));
  });
}

createRoot(document.getElementById("root")).render(
  <>
    <Provider store={store}>
      <Toaster reverseOrder={false} />
      <RouterProvider router={router} />
    </Provider>
  </>,
);
