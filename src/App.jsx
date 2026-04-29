import React from "react";
import { AppProvider } from "./context/AppContext";
import Router from "./components/Router";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProvider>
          <Router />
        </AppProvider>
      </PersistGate>
    </Provider>
  );
}
