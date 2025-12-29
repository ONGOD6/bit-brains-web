{/* =========================
     BRAIN HERO (RIGHT SIDE)
========================= */}
<div className="home-right">
  <div className="brain-wrapper">
    
    {/* BIT — top right */}
    <div
      style={{
        position: "absolute",
        top: "-26px",
        right: "14px",
        fontSize: "28px",
        fontWeight: 900,
        letterSpacing: "2px",
        color: "#000",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      BIT
    </div>

    {/* Brain Image */}
    <img
      src="/images/brain.gif"   {/* 🔁 change ONLY if filename differs */}
      alt="Brain Intelligence"
      className="brain-image"
    />

    {/* Brain Intelligence Token — bottom right */}
    <div
      style={{
        position: "absolute",
        right: "24px",
        bottom: "18px",
        fontSize: "36px",
        fontWeight: 900,
        textAlign: "right",
        color: "#ffffff",
        textShadow: "0 2px 14px rgba(0,0,0,0.75)",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      Brain Intelligence Token
    </div>

  </div>
</div>
