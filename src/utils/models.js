import { v4 as uuidv4 } from "uuid";

const AVATAR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#82E0AA",
  "#F1948A",
];

export function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function getInitials(name) {
  const parts = name?.trim().split(" ");
  if (parts?.length >= 2) return (parts[0][0] + parts[1][0])?.toUpperCase();
  return name?.length > 0 ? name[0]?.toUpperCase() : "?";
}

export function createParticipant(name) {
  return { id: uuidv4(), name, avatarColor: randomColor() };
}

export function createGroup(name, emoji = "🏠", category = "General") {
  return {
    id: uuidv4(),
    name,
    emoji,
    category,
    participants: [],
    expenses: [],
    createdAt: new Date().toISOString(),
  };
}

export function createExpense({
  title,
  amount,
  payerId,
  category = "General",
  splitType = "equally",
  customSplits = {},
  participantIds = [],
  note = "",
}) {
  return {
    id: uuidv4(),
    title,
    amount,
    payerId,
    category,
    splitType,
    customSplits,
    participantIds,
    note,
    date: new Date().toISOString(),
  };
}

export function getSplitAmounts(expense, participants) {
  const involved =
    expense.participantIds.length > 0
      ? expense.participantIds
      : participants.map((p) => p.id);
  if (expense.splitType === "equally") {
    const share = expense.amount / involved.length;
    return Object.fromEntries(involved.map((id) => [id, share]));
  } else if (expense.splitType === "byAmount") {
    return Object.fromEntries(
      involved.map((id) => [id, expense.customSplits[id] || 0]),
    );
  } else {
    return Object.fromEntries(
      involved.map((id) => [
        id,
        (expense.amount * (expense.customSplits[id] || 0)) / 100,
      ]),
    );
  }
}

export function getBalances(group) {
  const balances = {};
  group.participants.forEach((p) => {
    balances[p.uid] = 0;
  });
  group.expenses.forEach((expense) => {
    balances[expense.payerId] =
      (balances[expense.payerId] || 0) + expense.amount;
    const splits = getSplitAmounts(expense, group.participants);
    Object.entries(splits).forEach(([id, amt]) => {
      balances[id] = (balances[id] || 0) - amt;
    });
  });
  return balances;
}

export function getSettlements(group) {
  const balances = getBalances(group);
  const settlements = [];
  const creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .map(([k, v]) => [k, v])
    .sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .map(([k, v]) => [k, Math.abs(v)])
    .sort((a, b) => b[1] - a[1]);

  console.log(creditors, debtors); // Debugging line to check creditors and debtors

  let ci = 0,
    di = 0;
  const mc = creditors.map(([k, v]) => [k, v]);
  const md = debtors.map(([k, v]) => [k, v]);

  while (ci < mc.length && di < md.length) {
    const amount = Math.min(mc[ci][1], md[di][1]);
    settlements.push({ fromId: md[di][0], toId: mc[ci][0], amount });
    mc[ci][1] -= amount;
    md[di][1] -= amount;
    if (mc[ci][1] < 0.01) ci++;
    if (md[di][1] < 0.01) di++;
  }
  console.log("Settlements calculated:", settlements); // Debugging line to check settlements
  return settlements;
}

export const CATEGORIES = [
  "General",
  "Food",
  "Transport",
  "Accommodation",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Other",
];
export const CATEGORY_EMOJIS = {
  General: "💰",
  Food: "🍔",
  Transport: "🚗",
  Accommodation: "🏨",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Utilities: "⚡",
  Healthcare: "🏥",
  Other: "📦",
};
export const GROUP_EMOJIS = [
  "🏠",
  "✈️",
  "🎉",
  "🍕",
  "🏖️",
  "🎮",
  "🏃",
  "🎸",
  "💼",
  "🚗",
  "⛺",
  "🎓",
  "💪",
  "🌍",
  "🛒",
  "🎭",
];
export const GROUP_CATEGORIES = [
  "Home",
  "Trip",
  "Party",
  "Food",
  "Sports",
  "Work",
  "Entertainment",
  "Other",
];

export function formatAmount(n) {
  return `LKR ${Number(n).toFixed(2)}`;
}

export function totalExpenses(group) {
  return group?.expenses?.reduce((s, e) => s + e.amount, 0);
}
