import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, GlassCard, EmptyState, ConfirmDialog, PopupMenu } from '../components/ui';
import { getBalances, getSettlements, formatAmount, CATEGORY_EMOJIS, totalExpenses } from '../utils/models';

export default function GroupDetailScreen({ navigate, params }) {
  const { getGroup, deleteGroup, deleteExpense, showSnack } = useApp();
  const group = getGroup(params.groupId);
  const [tab, setTab] = useState('expenses');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // expense id or 'group'

  if (!group) return null;

  function handleDeleteGroup() {
    deleteGroup(group.id);
    navigate('home');
  }

  function handleDeleteExpense(id) {
    deleteExpense(group.id, id);
    setConfirmDelete(null);
    showSnack('Expense deleted');
  }

  return (
    <div className="screen">
      {/* Header */}
      <div className="group-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button className="app-bar-back" onClick={() => navigate('home')}>‹</button>
          <div style={{ flex: 1 }} />
          <button className="icon-btn" style={{ fontSize: 20, color: 'var(--text-secondary)' }}
            onClick={() => navigate('manage-participants', { groupId: group.id })}>
            👥
          </button>
          <div style={{ position: 'relative' }}>
            <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>⋯</button>
            {menuOpen && (
              <PopupMenu
                onClose={() => setMenuOpen(false)}
                items={[{
                  icon: '🗑️', label: 'Delete Group', color: 'var(--negative)',
                  onClick: () => setConfirmDelete('group')
                }]}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <div style={{ fontSize: 40 }}>{group.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{group.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{group.participants.length} members</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {formatAmount(totalExpenses(group))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {['expenses', 'balances', 'settle'].map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="screen-body">
        {tab === 'expenses' && <ExpensesTab group={group} onDelete={id => setConfirmDelete(id)} />}
        {tab === 'balances' && <BalancesTab group={group} />}
        {tab === 'settle' && <SettleTab group={group} showSnack={showSnack} />}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate('add-expense', { groupId: group.id })}>
        ＋ Add Expense
      </button>

      {/* Confirm dialogs */}
      {confirmDelete === 'group' && (
        <ConfirmDialog
          title="Delete Group"
          message="This cannot be undone."
          onConfirm={handleDeleteGroup}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmDelete && confirmDelete !== 'group' && (
        <ConfirmDialog
          title="Delete Expense"
          message={`Delete "${group.expenses.find(e => e.id === confirmDelete)?.title}"?`}
          onConfirm={() => handleDeleteExpense(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function ExpensesTab({ group, onDelete }) {
  if (group.expenses.length === 0) {
    return <EmptyState emoji="💸" title="No expenses yet" subtitle='Tap "Add Expense" to log your first shared expense' />;
  }
  return (
    <div style={{ padding: '16px 20px 120px' }}>
      {group.expenses.map(expense => {
        const payer = group.participants.find(p => p.id === expense.payerId) || group.participants[0];
        return (
          <div key={expense.id} className="swipe-row">
            <div className="swipe-delete-bg">🗑 Delete</div>
            <GlassCard style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--surface-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0
              }}>{CATEGORY_EMOJIS[expense.category] || '💰'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {expense.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {payer?.name} paid
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', flexShrink: 0 }}>
                {formatAmount(expense.amount)}
              </div>
              <button className="icon-btn" style={{ color: 'var(--negative)', fontSize: 16, flexShrink: 0 }}
                onClick={() => onDelete(expense.id)}>🗑</button>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}

function BalancesTab({ group }) {
  if (group.participants.length === 0) {
    return <EmptyState emoji="👥" title="No participants" subtitle="Add participants to see balances" />;
  }
  const balances = getBalances(group);
  return (
    <div style={{ padding: '16px 20px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {group.participants.map(p => {
        const bal = balances[p.id] || 0;
        const pos = bal >= 0;
        const settled = Math.abs(bal) < 0.01;
        return (
          <GlassCard key={p.id}
            borderColor={settled ? undefined : pos ? 'rgba(0,212,170,0.3)' : 'rgba(255,107,107,0.3)'}
            style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar participant={p} size={48} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: settled ? 'var(--text-muted)' : pos ? 'var(--positive)' : 'var(--negative)' }}>
                {settled ? 'All settled up' : pos ? 'Gets back' : 'Owes'}
              </div>
            </div>
            {settled ? (
              <span style={{ color: 'var(--positive)', fontSize: 20 }}>✓</span>
            ) : (
              <div style={{
                padding: '6px 12px', borderRadius: 12,
                background: pos ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)',
                color: pos ? 'var(--positive)' : 'var(--negative)',
                fontWeight: 700, fontSize: 15,
              }}>
                {pos ? '+' : '-'} {formatAmount(Math.abs(bal))}
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}

function SettleTab({ group, showSnack }) {
  const settlements = getSettlements(group);
  const balances = getBalances(group);

  if (settlements.length === 0) {
    return (
      <EmptyState
        emoji={group.expenses.length === 0 ? '💸' : '🎉'}
        title={group.expenses.length === 0 ? 'No expenses yet' : 'All settled up!'}
        subtitle={group.expenses.length === 0 ? 'Add expenses to see settlement plan' : 'Everyone is even — no payments needed'}
      />
    );
  }

  function copySettlement(s) {
    const from = group.participants.find(p => p.id === s.fromId)?.name;
    const to = group.participants.find(p => p.id === s.toId)?.name;
    navigator.clipboard?.writeText(`${from} pays ${to} ${formatAmount(s.amount)}`);
    showSnack('Copied to clipboard');
  }

  return (
    <div style={{ padding: '16px 20px 120px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Summary header */}
      <GlassCard borderColor="rgba(108,99,255,0.3)" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          padding: 10, borderRadius: 12, background: 'rgba(108,99,255,0.15)',
          fontSize: 20
        }}>🧮</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Settlement Plan</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {settlements.length} payment{settlements.length > 1 ? 's' : ''} needed
          </div>
        </div>
      </GlassCard>

      {/* Each settlement */}
      {settlements.map((s, i) => {
        const from = group.participants.find(p => p.id === s.fromId);
        const to = group.participants.find(p => p.id === s.toId);
        return (
          <GlassCard key={i} borderColor="rgba(255,179,71,0.2)">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,179,71,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--warning)', fontWeight: 700, fontSize: 13, flexShrink: 0
              }}>{i + 1}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {from && <Avatar participant={from} size={40} />}
                <div className="settlement-arrow">
                  <span style={{ fontSize: 16 }}>→</span>
                  <span>pays</span>
                </div>
                {to && <Avatar participant={to} size={40} />}
              </div>
              <div style={{
                padding: '8px 12px', borderRadius: 12,
                background: 'rgba(255,179,71,0.15)',
                color: 'var(--warning)', fontWeight: 700, fontSize: 16, flexShrink: 0
              }}>{formatAmount(s.amount)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, paddingLeft: 40 }}>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {from?.name} → {to?.name}
              </div>
              <button className="icon-btn" onClick={() => copySettlement(s)} title="Copy">📋</button>
            </div>
          </GlassCard>
        );
      })}

      {/* Summary totals */}
      <GlassCard>
        {group.participants.map(p => {
          const bal = balances[p.id] || 0;
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <Avatar participant={p} size={32} />
              <div style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{p.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: bal >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {bal >= 0 ? '+' : '-'}{formatAmount(Math.abs(bal))}
              </div>
            </div>
          );
        })}
        <div className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Expenses</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 16 }}>
            {formatAmount(totalExpenses(group))}
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
