import React, { useState, useCallback } from "react";
import HomeScreen from "../screens/HomeScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ManageParticipantsScreen from "../screens/ManageParticipantsScreen";
import LoginScreen from "../screens/LoginScreen";
import { useSelector } from "react-redux";

const SCREENS = {
  login: LoginScreen,
  home: HomeScreen,
  "create-group": CreateGroupScreen,
  "group-detail": GroupDetailScreen,
  "add-expense": AddExpenseScreen,
  "manage-participants": ManageParticipantsScreen,
};

export default function Router() {
  const user = useSelector((state) => state.auth.user);

  const [stack, setStack] = useState([
    { screen: user ? "home" : "login", params: {} },
  ]);
  const current = stack[stack.length - 1];

  const navigate = useCallback((screen, params = {}) => {
    if (screen === "login") {
      setStack([{ screen: "login", params: {} }]);
    } else {
      setStack((prev) => [...prev, { screen, params }]);
    }
  }, []);

  const resolvedScreen =
    !user && current.screen !== "login" ? "login" : current.screen;
  const Screen = SCREENS[current.screen] || LoginScreen;

  return (
    <Screen
      key={current.screen + JSON.stringify(current.params)}
      navigate={navigate}
      params={current.params}
    />
  );
}
