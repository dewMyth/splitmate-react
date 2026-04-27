import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppBar, GradientBtn, InputField } from '../components/ui';
import { GROUP_EMOJIS, GROUP_CATEGORIES } from '../utils/models';

export default function CreateGroupScreen({ navigate }) {
  const { addGroup, addParticipant, showSnack } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏠');
  const [category, setCategory] = useState('General');
  const [participants, setParticipants] = useState([]);
  const [pInput, setPInput] = useState('');
  const [saving, setSaving] = useState(false);

  function addP() {
    const n = pInput.trim();
    if (!n) return;
    if (participants.includes(n)) { showSnack('Name already added'); return; }
    setParticipants(prev => [...prev, n]);
    setPInput('');
  }

  async function handleCreate() {
    if (!name.trim()) { showSnack('Enter a group name'); return; }
    if (participants.length < 2) { showSnack('Add at least 2 participants'); return; }
    setSaving(true);
    const group = addGroup(name.trim(), emoji, category);
    participants.forEach(n => addParticipant(group.id, n));
    navigate('group-detail', { groupId: group.id });
  }

  return (
    <div className="screen">
      <AppBar title="New Group" onBack={() => navigate('home')} />
      <div className="screen-body">
        <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Emoji picker */}
          <div>
            <div className="input-label" style={{ marginBottom: 12 }}>Choose an icon</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {GROUP_EMOJIS.map(e => (
                <div key={e} onClick={() => setEmoji(e)} style={{
                  width: 52, height: 52, borderRadius: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, transition: 'all 0.15s',
                  background: emoji === e ? 'rgba(108,99,255,0.2)' : 'var(--surface-light)',
                  border: `2px solid ${emoji === e ? 'var(--primary)' : 'transparent'}`,
                }}>{e}</div>
              ))}
            </div>
          </div>

          {/* Name */}
          <InputField label="Group Name" value={name} onChange={setName} placeholder="e.g. Bali Trip, Monthly Rent..." />

          {/* Category */}
          <div>
            <div className="input-label" style={{ marginBottom: 12 }}>Category</div>
            <div className="chip-row">
              {GROUP_CATEGORIES.map(c => (
                <div key={c} className={`pill${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div className="input-label">Participants</div>
              {participants.length > 0 && (
                <span className="badge badge-primary">{participants.length}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="input-field"
                style={{ flex: 1 }}
                value={pInput}
                onChange={e => setPInput(e.target.value)}
                placeholder="Enter participant name"
                onKeyDown={e => e.key === 'Enter' && addP()}
              />
              <button className="add-circle-btn" onClick={addP}>＋</button>
            </div>

            {participants.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                Add at least 2 people to split expenses
              </div>
            )}

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participants.map((name, i) => (
                <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(108,99,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', fontWeight: 700, flexShrink: 0
                  }}>{name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{name}</div>
                  <button className="icon-btn" style={{ color: 'var(--text-muted)', fontSize: 16 }}
                    onClick={() => setParticipants(prev => prev.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <GradientBtn onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating…' : '✓ Create Group'}
          </GradientBtn>
        </div>
      </div>
    </div>
  );
}
