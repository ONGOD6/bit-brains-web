export default function StakePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem 1.25rem",
        maxWidth: "960px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* =========================
          TOP CONTENT
      ========================= */}
      <div>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "0.75rem" }}>
          Stake Bit Brains
        </h1>

        <p
          style={{
            opacity: 0.9,
            fontSize: "1.1rem",
            marginBottom: "1.75rem",
          }}
        >
          Stake your Bit Brains NFTs to participate in Proof of Care and earn
          protocol rewards.
        </p>

        <section
          style={{
            padding: "1.25rem",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "14px",
            marginBottom: "1.25rem",
          }}
        >
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
            Your Status
          </h2>

          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>Connected wallet: Not connected</li>
            <li>Brains staked: 0</li>
            <li>Reward multiplier: 1.0×</li>
          </ul>
        </section>

        <button
          disabled
          style={{
            padding: "0.9rem 1.25rem",
            fontSize: "1rem",
            borderRadius: "999px",
            opacity: 0.7,
            cursor: "not-allowed",
            marginBottom: "1.5rem",
          }}
        >
          Stake (Coming Soon)
        </button>

        {/* =========================
            ENS + ZK STAKING NOTE
            (NO OVERLAY, SHORT)
        ========================= */}
        <div
          style={{
            maxWidth: "720px",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            opacity: 0.85,
            marginBottom: "2rem",
          }}
        >
          <strong>ENS-Verified Staking.</strong> No wallet connection required.
          <br />
          Eligibility for Proof of Care is verified through ENS ownership and
          zero-knowledge proofs, without exposing wallet data or requiring
          persistent connections.
        </div>
      </div>

      {/* PUSH IMAGE TO BOTTOM */}
      <div style={{ flexGrow: 1 }} />

      {/* =========================
          STAKING BRAIN IMAGE
          (UNTOUCHED)
      ========================= */}
      <div
        style={{
          marginTop: "2.5rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "min(960px, 96vw)",
            position: "relative",
            overflow: "hidden",
            borderRadius: "18px",
          }}
        >
          {/* Soft glow layer */}
          <div
            style={{
              position: "absolute",
              inset: "-18%",
              background:
                "radial-gradient(circle at 50% 50%, rgba(80,200,255,0.25), rgba(0,0,0,0) 55%)",
              filter: "blur(22px)",
              opacity: 0.9,
              animation: "bbGlow 6.5s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Image */}
          <img
            src="/stake-brain-vertical.jpg"
            alt="Bit Brains — Staking"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transformOrigin: "50% 55%",
              animation: "bbSway 7.5s ease-in-out infinite",
              filter: "drop-shadow(0 0 36px rgba(160,120,255,0.45))",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
      </div>

      {/* =========================
          MOTION STYLES
      ========================= */}
      <style>{`
        @keyframes bbSway {
          0%   { transform: translateY(0px) rotate(-0.6deg); }
          25%  { transform: translateY(-6px) rotate(0.7deg); }
          50%  { transform: translateY(0px) rotate(-0.4deg); }
          75%  { transform: translateY(6px) rotate(0.6deg); }
          100% { transform: translateY(0px) rotate(-0.6deg); }
        }

        @keyframes bbGlow {
          0%   { opacity: 0.75; transform: scale(0.98); }
          50%  { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.75; transform: scale(0.98); }
        }

        @media (prefers-reduced-motion: reduce) {
          img { animation: none !important; }
          div { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
