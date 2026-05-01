import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { saveUserToFirestore } from "../services/database-services";

export default function LoginScreen({ navigate }) {
  const [mounted, setMounted] = useState(false);
  const [hovering, setHovering] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    console.log("Google sign-in result:", result);

    if (result.user) {
      const userData = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      };

      // Save the user in firestore if they don't exist
      await saveUserToFirestore(userData);
      dispatch(login(userData));
      navigate("home");

      //   dispatch(login(result.user));
      //   navigate("home");
    }

    console.log(result.user);
  };

  return (
    <div style={styles.root}>
      {/* Ambient background blobs */}
      <div style={{ ...styles.blob, ...styles.blob1 }} />
      <div style={{ ...styles.blob, ...styles.blob2 }} />
      <div style={{ ...styles.blob, ...styles.blob3 }} />

      {/* Grid overlay */}
      <div style={styles.grid} />

      {/* Content */}
      <div
        style={{
          ...styles.content,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            ...styles.logoWrap,
            transitionDelay: "0.1s",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.8)",
            transition:
              "opacity 0.6s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <div style={styles.logoRing}>
            <div style={styles.logoInner}>
              <span style={styles.logoEmoji}>💸</span>
            </div>
          </div>
        </div>

        {/* Wordmark */}
        <div
          style={{
            ...styles.wordmarkWrap,
            transitionDelay: "0.2s",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <h1 style={styles.wordmark}>SplitMate</h1>
          <p style={styles.tagline}>Split smarter. Settle faster.</p>
        </div>

        {/* Feature pills */}
        <div
          style={{
            ...styles.pillRow,
            transitionDelay: "0.35s",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          {["No sign-up hassle", "Instant settlements", "Zero math"].map(
            (label, i) => (
              <div key={i} style={styles.featurePill}>
                <span style={styles.pillDot} />
                {label}
              </div>
            ),
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            ...styles.divider,
            transitionDelay: "0.4s",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>Continue with</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Google button */}
        <button
          style={{
            ...styles.googleBtn,
            ...(hovering ? styles.googleBtnHover : {}),
            transitionDelay: "0.45s",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 0.6s ease, transform 0.6s ease, background 0.2s, box-shadow 0.2s, scale 0.15s",
            scale: hovering ? "0.98" : "1",
          }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onTouchStart={() => setHovering(true)}
          onTouchEnd={() => setHovering(false)}
          onClick={() => googleLogin()}
        >
          <GoogleIcon />
          <span style={styles.googleBtnText}>Continue with Google</span>
        </button>

        {/* Fine print */}
        <p
          style={{
            ...styles.finePrint,
            transitionDelay: "0.55s",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
        >
          By continuing, you agree to our <span style={styles.link}>Terms</span>{" "}
          &amp; <span style={styles.link}>Privacy Policy</span>
        </p>
      </div>

      {/* Bottom brand strip */}
      <div
        style={{
          ...styles.bottomStrip,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s ease 0.6s",
        }}
      >
        <span style={styles.bottomText}>Made with ❤️ for easy splitting</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const styles = {
  root: {
    position: "relative",
    height: "100%",
    width: "100%",
    background: "#0D0D1A",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  // Background blobs
  blob: {
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  blob1: {
    width: 340,
    height: 340,
    background: "rgba(108,99,255,0.18)",
    top: -80,
    left: -80,
  },
  blob2: {
    width: 280,
    height: 280,
    background: "rgba(0,212,170,0.12)",
    bottom: 60,
    right: -60,
  },
  blob3: {
    width: 200,
    height: 200,
    background: "rgba(255,107,107,0.08)",
    bottom: 200,
    left: -40,
  },

  // Grid
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },

  // Main content
  content: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: "0 32px",
    gap: 0,
  },

  // Logo
  logoWrap: {
    marginBottom: 28,
  },
  logoRing: {
    width: 96,
    height: 96,
    borderRadius: 28,
    background:
      "linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,170,0.2))",
    padding: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 40px rgba(108,99,255,0.35), 0 0 80px rgba(108,99,255,0.1)",
  },
  logoInner: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    background: "#1A1A2E",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 42,
    lineHeight: 1,
  },

  // Wordmark
  wordmarkWrap: {
    textAlign: "center",
    marginBottom: 28,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: -1,
    background: "linear-gradient(135deg, #FFFFFF 0%, #B0B0D0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    lineHeight: 1.1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: "rgba(176,176,208,0.7)",
    fontWeight: 400,
    letterSpacing: 0.2,
  },

  // Feature pills
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 36,
  },
  featurePill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 12,
    color: "rgba(176,176,208,0.8)",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
    flexShrink: 0,
  },

  // Divider
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: 12,
    color: "rgba(176,176,208,0.5)",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  // Google button
  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "15px 24px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    marginBottom: 20,
  },
  googleBtnHover: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#FFFFFF",
    fontFamily: "inherit",
    letterSpacing: 0.1,
  },

  // Fine print
  finePrint: {
    fontSize: 12,
    color: "rgba(176,176,208,0.4)",
    textAlign: "center",
    lineHeight: 1.6,
    margin: 0,
  },
  link: {
    color: "rgba(108,99,255,0.8)",
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationColor: "rgba(108,99,255,0.3)",
  },

  // Bottom
  bottomStrip: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  bottomText: {
    fontSize: 12,
    color: "rgba(176,176,208,0.25)",
    letterSpacing: 0.3,
  },
};
