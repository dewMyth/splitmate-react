import React, { useState, useCallback } from "react";
import HomeScreen from "../screens/HomeScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ManageParticipantsScreen from "../screens/ManageParticipantsScreen";
import LoginScreen from "../screens/LoginScreen";

const SCREENS = {
  login: LoginScreen,
  home: HomeScreen,
  "create-group": CreateGroupScreen,
  "group-detail": GroupDetailScreen,
  "add-expense": AddExpenseScreen,
  "manage-participants": ManageParticipantsScreen,
};

export default function Router() {
  const [stack, setStack] = useState([{ screen: "login", params: {} }]);
  const current = stack[stack.length - 1];

  const navigate = useCallback((screen, params = {}) => {
    if (screen === "login") {
      setStack([{ screen: "login", params: {} }]);
    } else {
      setStack((prev) => [...prev, { screen, params }]);
    }
  }, []);

  const Screen = SCREENS[current.screen] || LoginScreen;

  return (
    <Screen
      key={current.screen + JSON.stringify(current.params)}
      navigate={navigate}
      params={current.params}
    />
  );
}
