import React, { useState } from 'react';
import { getInitials } from '../utils/models';

export function Avatar({ participant, size = 40 }) {
  const color = participant.avatarColor || '#6C63FF';
  const fontSize = size * 0.35;
  return (
    <div className="avatar" style={{
      width: size, height: size, fontSize,
      backgroundColor: color + '33',
      borderColor: color,
      color,
      flexShrink: 0,
    }}>
      {getInitials(participant.name)}
    </div>
  );
}

export function GlassCard({ children, onClick, style, borderColor, padding }) {
  return (
    <div
      className={`glass-card${onClick ? ' clickable' : ''}`}
      onClick={onClick}
      style={{ borderColor: borderColor || undefined, padding: padding || undefined, ...style }}
    >
      {children}
    </div>
  );
}

export function GradientBtn({ children, onClick, disabled, accent, style }) {
  return (
    <button
      className={`gradient-btn${accent ? ' accent' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export function EmptyState({ emoji, title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-emoji">{emoji}</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-subtitle">{subtitle}</div>
      {action && <div style={{ marginTop: 24, width: '100%' }}>{action}</div>}
    </div>
  );
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  return (
    <div className="confirm-dialog" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary-text'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function AppBar({ title, onBack, actions, children }) {
  return (
    <div className="app-bar">
      {onBack && (
        <button className="app-bar-back" onClick={onBack}>
          ‹
        </button>
      )}
      <div className="app-bar-title">{title || children}</div>
      {actions}
    </div>
  );
}

export function Pill({ label, icon, active, activeAccent, onClick }) {
  let cls = 'pill';
  if (active) cls += ' active';
  if (activeAccent) cls += ' active-accent';
  return (
    <div className={cls} onClick={onClick}>
      {icon && <span>{icon}</span>}
      {label}
    </div>
  );
}

export function InputField({ label, value, onChange, placeholder, type = 'text', autoFocus, onKeyDown }) {
  return (
    <div className="input-group">
      {label && <div className="input-label">{label}</div>}
      <input
        className="input-field"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

export function Checkbox({ checked, onChange }) {
  return (
    <div className={`checkbox${checked ? ' checked' : ''}`} onClick={() => onChange(!checked)}>
      {checked && <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>✓</span>}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function PopupMenu({ items, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={onClose} />
      <div className="popup-menu">
        {items.map((item, i) => (
          <div key={i} className="popup-menu-item" style={{ color: item.color || 'var(--text-primary)' }}
            onClick={() => { item.onClick(); onClose(); }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
