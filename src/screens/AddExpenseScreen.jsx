import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar, GlassCard, GradientBtn, Checkbox } from '../components/ui';
import { CATEGORIES, CATEGORY_EMOJIS } from '../utils/models';

const SPLIT_TYPES = [
  { value: 'equally', label: 'Equally' },
  { value: 'byAmount', label: 'By Amount' },
  { value: 'byPercentage', label: 'By %' },
];

export default function AddExpenseScreen({ navigate, params }) {
  const { getGroup, addExpense, showSnack } = useApp();
  const group = getGroup(params.groupId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState(group?.participants[0]?.id || '');
  const [category, setCategory] = useState('General');
  const [splitType, setSplitType] = useState('equally');
  const [includedIds, setIncludedIds] = useState(new Set(group?.participants.map(p => p.id) || []));
  const [customSplits, setCustomSplits] = useState({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!group) return null;

  function toggleParticipant(id) {
    setIncludedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function save() {
    if (!title.trim()) { showSnack('Enter a title'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showSnack('Enter a valid amount'); return; }
    if (!payerId) { showSnack('Select who paid'); return; }
    if (includedIds.size === 0) { showSnack('Select at least one participant'); return; }

    if (splitType === 'byAmount') {
      const sum = [...includedIds].reduce((s, id) => s + (parseFloat(customSplits[id]) || 0), 0);
      if (Math.abs(sum - amt) > 0.01) { showSnack(`Amounts must sum to ${amt.toFixed(2)}`); return; }
    }
    if (splitType === 'byPercentage') {
      const sum = [...includedIds].reduce((s, id) => s + (parseFloat(customSplits[id]) || 0), 0);
      if (Math.abs(sum - 100) > 0.01) { showSnack('Percentages must sum to 100%'); return; }
    }

    setSaving(true);
    addExpense(group.id, {
      title: title.trim(),
      amount: amt,
      payerId,
      category,
      splitType,
      customSplits: Object.fromEntries(Object.entries(customSplits).map(([k, v]) => [k, parseFloat(v) || 0])),
      participantIds: [...includedIds],
      note: note.trim(),
    });
    navigate('group-detail', { groupId: group.id });
  }

  return (
    <div className="screen">
      {/* App bar */}
      <div className="app-bar">
        <button className="app-bar-back" onClick={() => navigate('group-detail', { groupId: group.id })}>✕</button>
        <div className="app-bar-title">Add Expense</div>
        <button className="app-bar-action" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="screen-body">
        <div style={{ padding: '0 20px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Big amount input */}
          <GlassCard style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Amount</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span className="amount-prefix">LKR</span>
              <input
                className="amount-display"
                style={{ width: 'auto', maxWidth: 200 }}
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </GlassCard>

          {/* Title */}
          <input
            className="input-field"
            placeholder="What for? e.g. Dinner, Taxi, Hotel..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          {/* Category */}
          <div>
            <div className="input-label" style={{ marginBottom: 10 }}>Category</div>
            <div className="chip-row">
              {CATEGORIES.map(c => (
                <div key={c} className={`pill${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
                  <span>{CATEGORY_EMOJIS[c]}</span> {c}
                </div>
              ))}
            </div>
          </div>

          {/* Paid by */}
          <div>
            <div className="input-label" style={{ marginBottom: 10 }}>Paid by</div>
            <div className="chip-wrap">
              {group.participants.map(p => (
                <div key={p.id}
                  className={`pill${payerId === p.id ? ' active-accent' : ''}`}
                  onClick={() => setPayerId(p.id)}>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Split type */}
          <div>
            <div className="input-label" style={{ marginBottom: 10 }}>Split</div>
            <div className="split-type-row">
              {SPLIT_TYPES.map(s => (
                <button key={s.value} className={`split-type-btn${splitType === s.value ? ' active' : ''}`}
                  onClick={() => setSplitType(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="input-label" style={{ marginBottom: 10 }}>Split between</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.participants.map(p => {
                const included = includedIds.has(p.id);
                return (
                  <GlassCard key={p.id} style={{ padding: '10px 12px' }}>
                    <div className="participant-expense-row" style={{ padding: 0 }}>
                      <Checkbox checked={included} onChange={() => toggleParticipant(p.id)} />
                      <Avatar participant={p} size={36} />
                      <div style={{ flex: 1, fontWeight: 500, color: included ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {p.name}
                      </div>
                      {splitType !== 'equally' && included && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input
                            className="custom-split-input"
                            type="number"
                            inputMode="decimal"
                            placeholder="0"
                            value={customSplits[p.id] || ''}
                            onChange={e => setCustomSplits(prev => ({ ...prev, [p.id]: e.target.value }))}
                          />
                          {splitType === 'byPercentage' && (
                            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>%</span>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <input
            className="input-field"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <GradientBtn accent onClick={save} disabled={saving}>
            ＋ {saving ? 'Saving…' : 'Add Expense'}
          </GradientBtn>
        </div>
      </div>
    </div>
  );
}
