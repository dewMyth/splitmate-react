import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  AppBar,
  Avatar,
  GlassCard,
  EmptyState,
  ConfirmDialog,
  Modal,
  InputField,
  GradientBtn,
} from "../components/ui";

import { getGroupDataFromFirestoreByGroupId } from "../services/database-services";

export default function ManageParticipantsScreen({ navigate, params }) {
  const {
    addParticipant,
    removeParticipant,
    updateParticipantName,
    showSnack,
  } = useApp();

  console.log("ManageParticipantsScreen params:", params);

  const [input, setInput] = useState("");
  const [editTarget, setEditTarget] = useState(null); // { id, name }
  const [editName, setEditName] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null); // { id, name }

  const [group, setGroup] = useState(params.group);

  if (!group) return null;

  function handleAdd() {
    const n = input.trim();
    if (!n) return;
    addParticipant(group.id, n);

    const newParticipant = {
      id: Date.now().toString(),
      name: n,
    };

    setInput("");
    showSnack(`${n} added`);
  }

  function handleEdit() {
    if (!editName.trim()) return;
    updateParticipantName(group.id, editTarget.id, editName.trim());
    setEditTarget(null);
    showSnack("Name updated");
  }

  function handleRemove() {
    removeParticipant(group.id, confirmRemove.id);
    setConfirmRemove(null);
    showSnack(`${confirmRemove.name} removed`);
  }

  return (
    <div className="screen">
      <AppBar
        title="Manage Participants"
        onBack={() => navigate("group-detail", { groupId: group.id })}
      />

      {/* Add input */}
      <div
        style={{
          padding: "0 20px 16px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <input
          className="input-field"
          style={{ flex: 1 }}
          placeholder="Add participant name"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className="add-circle-btn" onClick={handleAdd}>
          ＋
        </button>
      </div>

      {/* List */}
      <div className="screen-body">
        <div style={{ padding: "0 20px 40px" }}>
          {group.participants.length === 0 ? (
            <EmptyState
              emoji="👥"
              title="No participants"
              subtitle="Add people to this group"
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {group.participants.map((p) => (
                <GlassCard
                  key={p.id}
                  style={{ display: "flex", alignItems: "center", gap: 14 }}
                >
                  <Avatar participant={p} size={44} />
                  <div
                    style={{
                      flex: 1,
                      fontWeight: 600,
                      fontSize: 16,
                      color: "var(--text-primary)",
                    }}
                  >
                    {p.name || p.displayName}
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setEditTarget(p);
                      setEditName(p.name);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn"
                    style={{ color: "var(--negative)" }}
                    onClick={() => setConfirmRemove(p)}
                  >
                    🗑
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editTarget && (
        <Modal title="Edit Name" onClose={() => setEditTarget(null)}>
          <InputField
            value={editName}
            onChange={setEditName}
            placeholder="New name"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
          />
          <div style={{ marginTop: 16 }}>
            <GradientBtn onClick={handleEdit}>Save</GradientBtn>
          </div>
        </Modal>
      )}

      {/* Confirm remove */}
      {confirmRemove && (
        <ConfirmDialog
          title="Remove Participant"
          message={`Remove ${confirmRemove.name} from this group?`}
          confirmLabel="Remove"
          onConfirm={handleRemove}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  );
}
