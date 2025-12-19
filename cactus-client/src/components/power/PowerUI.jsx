import { useState, useEffect } from "react";
import { SELF_PEEK, OPPONENT_PEEK, SWAP_ANY } from "../../game/powers";

export const PowerTimeIndicator = ({ expiresAt, label, variant = "swap", onClick }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return setRemaining(0);
    let id = null;
    const tick = () => {
      const now = Date.now();
      const ms = Math.max(0, expiresAt - now);
      setRemaining(ms);
      if (ms > 0) id = setTimeout(tick, 100);
    };
    tick();
    return () => { if (id) clearTimeout(id); };
  }, [expiresAt]);

  if (!expiresAt || remaining <= 0) return null;

  const seconds = (remaining / 1000).toFixed(1);
  const fraction = Math.min(1, Math.max(0, remaining / 10000));

  const palettes = {
    swap: {
      border: "rgba(147,51,234,0.4)",
      bg: "rgba(147,51,234,0.12)",
      text: "#e9d5ff",
      bar: "rgba(147,51,234,0.25)",
    },
    opponent: {
      border: "rgba(59,130,246,0.45)",
      bg: "rgba(59,130,246,0.12)",
      text: "#dbeafe",
      bar: "rgba(59,130,246,0.28)",
    },
    self: {
      border: "rgba(34,197,94,0.45)",
      bg: "rgba(34,197,94,0.12)",
      text: "#dcfce7",
      bar: "rgba(34,197,94,0.28)",
    },
  };
  const { border, bg, text: textColor, bar: barColor } = palettes[variant] || palettes.swap;

  const container = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "2px 6px",
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: bg,
    color: textColor,
    marginLeft: 8,
    position: "relative",
    overflow: "hidden",
    fontSize: 12,
    lineHeight: 1,
    cursor: onClick ? "pointer" : "default",
  };
  const barStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${fraction * 100}%`,
    background: barColor,
    transition: "width 100ms linear",
  };
  const labelStyle = { position: "relative", zIndex: 1, fontWeight: 700 };
  const timeStyle = { position: "relative", zIndex: 1, opacity: 0.9 };

  return (
    <span style={container} title="Power time left" onClick={onClick}>
      <span style={barStyle} />
      <span style={labelStyle}>{label}</span>
      <span style={timeStyle}>{seconds}s</span>
    </span>
  );
};

export const LookButton = ({ expiresAt, onClick }) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!expiresAt) return setProgress(0);
    let timerId = null;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setProgress(remaining / 10000); // fraction 0..1
      if (remaining > 0) {
        timerId = setTimeout(tick, 100); // update every 100ms instead of every frame
      }
    };
    tick();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [expiresAt]);

  if (!expiresAt || progress <= 0) return null;

  const container = {
    width: 70,
    height: 22,
    padding: 2,
    borderRadius: 6,
    background: "linear-gradient(180deg,#2b2b2b,#1e1e1e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 12,
    position: "relative",
    overflow: "hidden",
  };
  const bar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress * 100}%`,
    background: "rgba(34,197,94,0.5)",
    transition: "width 100ms linear",
  };
  const label = { zIndex: 2, fontWeight: 700 };

  return (
    <div style={container} onClick={onClick} title="Use Look power">
      <div style={bar} />
      <div style={label}>Look</div>
    </div>
  );
};

export const RevealProgressBar = ({ expiresAt, onClick }) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!expiresAt) return setProgress(0);
    let timerId = null;
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setProgress(remaining / 4000); // 4s reveal duration
      if (remaining > 0) {
        timerId = setTimeout(tick, 100);
      }
    };
    tick();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [expiresAt]);

  if (!expiresAt || progress <= 0) return null;

  const container = {
    width: 70,
    height: 22,
    padding: 2,
    borderRadius: 6,
    background: "linear-gradient(180deg,#2b2b2b,#1e1e1e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 12,
    position: "relative",
    overflow: "hidden",
  };
  const bar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress * 100}%`,
    background: "rgba(100,200,255,0.5)",
    transition: "width 100ms linear",
  };
  const label = { zIndex: 2, fontWeight: 700 };

  return (
    <div style={container} onClick={onClick} title="Close card reveal">
      <div style={bar} />
      <div style={label}>Close</div>
    </div>
  );
};

export const SwapProgressBar = ({ progress, onClick, isSelected }) => {
  const container = {
    width: 70,
    height: 22,
    padding: 2,
    borderRadius: 6,
    background: "linear-gradient(180deg,#2b2b2b,#1e1e1e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    fontSize: 11,
    position: "relative",
    overflow: "hidden",
    border: isSelected ? "2px solid #ffa500" : "none",
  };
  const bar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: `${progress * 100}%`,
    background: "rgba(147,51,234,0.5)",
    transition: "width 100ms linear",
  };
  const labelStyle = { zIndex: 2, fontWeight: 700, textAlign: "center" };

  const text = progress < 0.5 ? "Swap" : "Swap 2nd";

  return (
    <div style={container} onClick={onClick}>
      <div style={bar} />
      <div style={labelStyle}>{text}</div>
    </div>
  );
};

export const PowerButton = ({ power, activePower, activePowerToken, activePowerExpiresAt, cardRevealExpiresAt, revealedCardId, cardId, onClick, onClose, showClose = true, swapProgress, isSelected, buttonLabel = "Look" }) => {
  if (activePower === power && activePowerToken) {
    if (power === SWAP_ANY) {
      return (
        <SwapProgressBar
          progress={swapProgress}
          onClick={onClick}
          isSelected={isSelected}
        />
      );
    }
    return (
      <LookButton
        expiresAt={activePowerExpiresAt}
        onClick={onClick}
      />
    );
  }
  if (showClose && cardRevealExpiresAt && revealedCardId === cardId) {
    return <RevealProgressBar expiresAt={cardRevealExpiresAt} onClick={onClose} />;
  }
  return null;
};
