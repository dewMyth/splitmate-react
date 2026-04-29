import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { GlassCard, EmptyState, GradientBtn } from "../components/ui";
import { totalExpenses, getSettlements, formatAmount } from "../utils/models";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";

import { useSelector } from "react-redux";

export default function HomeScreen({ navigate }) {
  const { groups, getTotalAcrossGroups } = useApp();
  const total = getTotalAcrossGroups();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in:", user.uid);
      } else {
        console.log("No user");
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="screen">
      {/* Header */}
      {/* <div className="app-bar" style={{ paddingBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SplitMate
          </div>
        </div>

        
      </div> */}

      <div className="app-bar" style={{ paddingBottom: 8 }}>
        {/* Wordmark */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SplitMate
          </div>
        </div>

        {/* Avatar */}
        {user && (
          <div
            title={user.displayName || user.email}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              flexShrink: 0,
              overflow: "hidden",
              border: "2px solid rgba(108,99,255,0.5)",
              boxShadow: "0 0 0 3px rgba(108,99,255,0.12)",
              cursor: "default",
            }}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "avatar"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {getInitials(user.displayName || user.email)}
              </div>
            )}
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => dispatch(logout())}
          title="Sign out"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            border: "none",
            background: "rgba(255,107,107,0.1)",
            color: "#FF6B6B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,107,107,0.22)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,107,107,0.1)")
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <div className="screen-body">
        {/* Hero card */}
        <div className="hero-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              💳
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Total Tracked
            </span>
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            {formatAmount(total)}
          </div>
          <div
            style={{
              marginTop: 8,
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
            }}
          >
            {groups.length} {groups.length === 1 ? "group" : "groups"} active
          </div>
        </div>

        {/* Groups list */}
        {groups.length === 0 ? (
          <EmptyState
            emoji="🎯"
            title="No groups yet"
            subtitle="Create your first group to start splitting expenses with friends"
            action={
              <GradientBtn onClick={() => navigate("create-group")}>
                ＋ Create Group
              </GradientBtn>
            }
          />
        ) : (
          <>
            <div className="section-header">YOUR GROUPS</div>
            <div style={{ padding: "0 20px 120px" }}>
              {groups.map((group) => {
                const total = totalExpenses(group);
                const settlements = getSettlements(group);
                const pending = settlements.length;
                return (
                  <GlassCard
                    key={group.id}
                    onClick={() =>
                      navigate("group-detail", { groupId: group.id })
                    }
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 16,
                        background: "var(--surface-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 28,
                        flexShrink: 0,
                      }}
                    >
                      {group.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "var(--text-primary)",
                          marginBottom: 4,
                        }}
                      >
                        {group.name}
                      </div>
                      <div
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        {group.participants.length} members ·{" "}
                        {group.expenses.length} expenses
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "var(--text-primary)",
                        }}
                      >
                        LKR {total.toFixed(0)}
                      </div>
                      {pending > 0 ? (
                        <span
                          className="badge badge-negative"
                          style={{ marginTop: 4, display: "inline-block" }}
                        >
                          {pending} to settle
                        </span>
                      ) : group.expenses.length > 0 ? (
                        <span
                          className="badge badge-positive"
                          style={{ marginTop: 4, display: "inline-block" }}
                        >
                          ✓ Settled
                        </span>
                      ) : null}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      {groups.length > 0 && (
        <button
          className="fab fab-home"
          onClick={() => navigate("create-group")}
        >
          ＋ New Group
        </button>
      )}
    </div>
  );
}
