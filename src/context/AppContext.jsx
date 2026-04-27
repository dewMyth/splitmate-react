import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createGroup, createParticipant, createExpense } from '../utils/models';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [groups, setGroups] = useState(() => {
    try {
      const saved = localStorage.getItem('splitmate_groups');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('splitmate_groups', JSON.stringify(groups)); } catch {}
  }, [groups]);

  const showSnack = useCallback((msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 2200);
  }, []);

  const addGroup = useCallback((name, emoji, category) => {
    const g = createGroup(name, emoji, category);
    setGroups(prev => [g, ...prev]);
    return g;
  }, []);

  const deleteGroup = useCallback((groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const getGroup = useCallback((id) => groups.find(g => g.id === id), [groups]);

  const updateGroup = useCallback((updated) => {
    setGroups(prev => prev.map(g => g.id === updated.id ? updated : g));
  }, []);

  const addParticipant = useCallback((groupId, name) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, participants: [...g.participants, createParticipant(name)] };
    }));
  }, []);

  const removeParticipant = useCallback((groupId, participantId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        participants: g.participants.filter(p => p.id !== participantId),
        expenses: g.expenses.map(e => ({
          ...e,
          participantIds: e.participantIds.filter(id => id !== participantId)
        }))
      };
    }));
  }, []);

  const updateParticipantName = useCallback((groupId, participantId, newName) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, participants: g.participants.map(p => p.id === participantId ? { ...p, name: newName } : p) };
    }));
  }, []);

  const addExpense = useCallback((groupId, expenseData) => {
    const expense = createExpense(expenseData);
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, expenses: [expense, ...g.expenses] };
    }));
  }, []);

  const deleteExpense = useCallback((groupId, expenseId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, expenses: g.expenses.filter(e => e.id !== expenseId) };
    }));
  }, []);

  const getTotalAcrossGroups = useCallback(() => {
    return groups.reduce((sum, g) => sum + g.expenses.reduce((s, e) => s + e.amount, 0), 0);
  }, [groups]);

  return (
    <AppContext.Provider value={{
      groups, getGroup, addGroup, deleteGroup, updateGroup,
      addParticipant, removeParticipant, updateParticipantName,
      addExpense, deleteExpense,
      getTotalAcrossGroups, showSnack
    }}>
      {children}
      {snackbar && <div className="snackbar">{snackbar}</div>}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
