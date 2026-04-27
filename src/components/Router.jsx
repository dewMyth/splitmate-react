import React, { useState, useCallback } from 'react';
import HomeScreen from '../screens/HomeScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ManageParticipantsScreen from '../screens/ManageParticipantsScreen';

const SCREENS = {
  'home': HomeScreen,
  'create-group': CreateGroupScreen,
  'group-detail': GroupDetailScreen,
  'add-expense': AddExpenseScreen,
  'manage-participants': ManageParticipantsScreen,
};

export default function Router() {
  const [stack, setStack] = useState([{ screen: 'home', params: {} }]);
  const current = stack[stack.length - 1];

  const navigate = useCallback((screen, params = {}) => {
    if (screen === 'home') {
      setStack([{ screen: 'home', params: {} }]);
    } else {
      setStack(prev => [...prev, { screen, params }]);
    }
  }, []);

  const Screen = SCREENS[current.screen] || HomeScreen;

  return <Screen key={current.screen + JSON.stringify(current.params)} navigate={navigate} params={current.params} />;
}
