import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { AppBar, GradientBtn, InputField } from "../components/ui";
import { GROUP_EMOJIS, GROUP_CATEGORIES } from "../utils/models";
import { useSelector } from "react-redux";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path to your firebase config

export default function CreateGroupScreen({ navigate }) {
  const user = useSelector((state) => state.auth.user);
  const { addGroup, addParticipant, showSnack } = useApp();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [category, setCategory] = useState("General");
  const [participants, setParticipants] = useState([
    { name: user.displayName, uid: user.uid, photoURL: user.photoURL },
  ]);
  const [pInput, setPInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownRef = useRef(null);

  // Search Firestore when input changes
  useEffect(() => {
    const term = pInput.trim();
    if (!term || term.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Search by displayName prefix (case-sensitive Firestore query)
        // Assumes your users collection has a "displayName" field
        const q = query(
          collection(db, "users"),
          where("displayName", ">=", term),
          where("displayName", "<=", term + "\uf8ff"),
        );
        const snap = await getDocs(q);
        const results = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          // Exclude current user and already-added participants
          .filter(
            (u) =>
              u.uid !== user.uid && !participants.some((p) => p.uid === u.uid),
          );
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error("Firestore search error:", err);
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(searchTimeout.current);
  }, [pInput]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function addFromSuggestion(suggested) {
    setParticipants((prev) => [...prev, suggested]);
    setPInput("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  function addTyped() {
    const n = pInput.trim();
    if (!n) return;
    if (participants.some((p) => p.name.toLowerCase() === n.toLowerCase())) {
      showSnack("Already added");
      return;
    }
    setParticipants((prev) => [
      ...prev,
      { name: n, uid: null, photoURL: null },
    ]);
    setPInput("");
    setSuggestions([]);
    setShowDropdown(false);
  }

  async function handleCreate() {
    if (!name.trim()) {
      showSnack("Enter a group name");
      return;
    }
    if (participants.length < 2) {
      showSnack("Add at least 2 participants");
      return;
    }
    setSaving(true);
    const group = addGroup(name.trim(), emoji, category);
    participants.forEach((p) => addParticipant(group.id, p.name, p.uid));
    navigate("group-detail", { groupId: group.id });
  }

  return (
    <div className="screen">
      <AppBar title="New Group" onBack={() => navigate("home")} />
      <div className="screen-body">
        <div
          style={{
            padding: "0 20px 40px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Emoji picker */}
          <div>
            <div className="input-label" style={{ marginBottom: 12 }}>
              Choose an icon
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {GROUP_EMOJIS.map((e) => (
                <div
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    transition: "all 0.15s",
                    background:
                      emoji === e
                        ? "rgba(108,99,255,0.2)"
                        : "var(--surface-light)",
                    border: `2px solid ${emoji === e ? "var(--primary)" : "transparent"}`,
                  }}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>

          {/* Name */}
          <InputField
            label="Group Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Bali Trip, Monthly Rent..."
          />

          {/* Category */}
          <div>
            <div className="input-label" style={{ marginBottom: 12 }}>
              Category
            </div>
            <div className="chip-row">
              {GROUP_CATEGORIES.map((c) => (
                <div
                  key={c}
                  className={`pill${category === c ? " active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <div className="input-label">Participants</div>
              {participants.length > 0 && (
                <span className="badge badge-primary">
                  {participants.length}
                </span>
              )}
            </div>

            {/* Search input + dropdown */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    className="input-field"
                    style={{ width: "100%", paddingRight: searching ? 40 : 16 }}
                    value={pInput}
                    onChange={(e) => setPInput(e.target.value)}
                    placeholder="Search by name or type a new one"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (suggestions.length > 0)
                          addFromSuggestion(suggestions[0]);
                        else addTyped();
                      }
                      if (e.key === "Escape") setShowDropdown(false);
                    }}
                    onFocus={() =>
                      suggestions.length > 0 && setShowDropdown(true)
                    }
                    autoComplete="off"
                  />
                  {/* Searching spinner */}
                  {searching && (
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid var(--surface-light)",
                          borderTopColor: "var(--primary)",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                    </div>
                  )}
                </div>
                <button className="add-circle-btn" onClick={addTyped}>
                  ＋
                </button>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    right: 52,
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    overflow: "hidden",
                    zIndex: 100,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                  }}
                >
                  {suggestions.length > 0 ? (
                    <>
                      {/* Firestore results */}
                      {suggestions.map((s) => (
                        <div
                          key={s.uid}
                          onClick={() => addFromSuggestion(s)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            cursor: "pointer",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--surface-light)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {/* Avatar */}
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              overflow: "hidden",
                              flexShrink: 0,
                              border: "2px solid rgba(108,99,255,0.3)",
                            }}
                          >
                            {s.photoURL ? (
                              <img
                                src={s.photoURL}
                                alt={s.displayName}
                                referrerPolicy="no-referrer"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  background:
                                    "linear-gradient(135deg, #6C63FF, #00D4AA)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: "white",
                                }}
                              >
                                {s.displayName?.[0]?.toUpperCase() ?? "?"}
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "var(--text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {s.displayName}
                            </div>
                            {s.email && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {s.email}
                              </div>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--accent)",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            Add
                          </span>
                        </div>
                      ))}

                      {/* Divider + add-as-typed option */}
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        <div
                          onClick={addTyped}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            cursor: "pointer",
                            transition: "background 0.12s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--surface-light)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: "rgba(108,99,255,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                            }}
                          >
                            ＋
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "var(--text-primary)",
                              }}
                            >
                              Add "{pInput.trim()}"
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--text-muted)",
                              }}
                            >
                              Not a registered user
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* No matches — offer to add typed name */
                    !searching &&
                    pInput.trim().length >= 2 && (
                      <div
                        onClick={addTyped}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          cursor: "pointer",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-light)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            flexShrink: 0,
                            background: "rgba(108,99,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                          }}
                        >
                          ＋
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "var(--text-primary)",
                            }}
                          >
                            Add "{pInput.trim()}"
                          </div>
                          <div
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            No users found — add as guest
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {participants.length === 0 && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                Add at least 2 people to split expenses
              </div>
            )}

            {/* Participant list */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {participants.map((p, i) => {
                const isCurrentUser = p.uid === user.uid;

                return (
                  <div
                    key={i}
                    className="glass-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "2px solid rgba(108,99,255,0.3)",
                      }}
                    >
                      {p.photoURL ? (
                        <>
                          <img
                            src={p.photoURL}
                            alt={p?.displayName}
                            referrerPolicy="no-referrer"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />

                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: p.uid
                                ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                                : "rgba(108,99,255,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: p.uid ? "white" : "var(--primary)",
                            }}
                          >
                            {p?.displayName}
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: p.uid
                              ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                              : "rgba(108,99,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: p.uid ? "white" : "var(--primary)",
                          }}
                        >
                          {p?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name ?? p?.displayName}{" "}
                        {isCurrentUser && (
                          <span
                            style={{ fontSize: 11, color: "var(--text-muted)" }}
                          >
                            (you)
                          </span>
                        )}
                      </div>
                      {!p.uid && (
                        <div
                          style={{ fontSize: 11, color: "var(--text-muted)" }}
                        >
                          Guest
                        </div>
                      )}
                    </div>

                    {/* Can't remove yourself */}
                    {!isCurrentUser && (
                      <button
                        className="icon-btn"
                        style={{ color: "var(--text-muted)", fontSize: 16 }}
                        onClick={() =>
                          setParticipants((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <GradientBtn onClick={handleCreate} disabled={saving}>
            {saving ? "Creating…" : "✓ Create Group"}
          </GradientBtn>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
