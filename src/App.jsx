import React from 'react';
import { AppProvider } from './context/AppContext';
import Router from './components/Router';

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
