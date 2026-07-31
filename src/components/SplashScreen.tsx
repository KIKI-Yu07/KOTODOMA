import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";

interface Props {
  onDone: () => void;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function inkEase(t: number) {
  const base = easeInOutCubic(t);
  const noise = Math.sin(t * Math.PI * 9) * 0.012 * Math.sin(t * Math.PI);
  return Math.max(0, Math.min(1, base + noise));
}

type Phase = "idle" | "writing";

const WRITE_DURATION = 3000;

function useAnimatedPhase(phase: Phase, target: Phase, duration: number, ease = easeInOutCubic) {
  const [t, setT] = useState(0);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const active = phase === target;

  useEffect(() => {
    if (!active) { setT(0); return; }
    startRef.current = 0;
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const raw = Math.min((now - startRef.current) / duration, 1);
      setT(ease(raw));
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, duration, ease]);

  return t;
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const ghostRef = useRef<HTMLParagraphElement>(null);
  const [textWidth, setTextWidth] = useState(400);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const writeT = useAnimatedPhase(phase, "writing", WRITE_DURATION, inkEase);

  useLayoutEffect(() => {
    const id = setTimeout(() => {
      if (ghostRef.current) {
        const w = ghostRef.current.getBoundingClientRect().width;
        if (w > 10) setTextWidth(w);
      }
    }, 300);
    return () => clearTimeout(id);
  }, []);

  const go = useCallback((p: Phase) => setPhase(p), []);

  useEffect(() => {
    timerRef.current = setTimeout(() => go("writing"), 500);
    return () => clearTimeout(timerRef.current ?? undefined);
  }, [go]);

  useEffect(() => {
    if (phase === "writing" && writeT >= 1) {
      timerRef.current = setTimeout(onDone, 400);
    }
  }, [phase, writeT, onDone]);

  const revealW = (phase === "idle" ? 0 : writeT) * (textWidth + 10);
  const penX = revealW;
  const penVisible = phase === "writing" && writeT > 0.01 && writeT < 0.99;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,205,240,0.45) 0%, rgba(220,225,248,0.18) 45%, transparent 70%)",
          pointerEvents: "none",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
        }}
      />

      {/* ── Text + pen ── */}
      <div style={{ position: "relative", marginTop: -20 }}>
        {/* ghost */}
        <p
          ref={ghostRef}
          aria-hidden="true"
          style={{
            fontFamily: "Sacramento, cursive",
            fontSize: 88,
            color: "#d8dae8",
            lineHeight: 1,
            margin: 0,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          kotodama
        </p>

        {/* ink reveal */}
        <p
          style={{
            fontFamily: "Sacramento, cursive",
            fontSize: 88,
            color: "#111118",
            lineHeight: 1,
            margin: 0,
            whiteSpace: "nowrap",
            userSelect: "none",
            position: "absolute",
            inset: 0,
            clipPath: `inset(0 ${textWidth - revealW}px 0 0)`,
          }}
        >
          kotodama
        </p>

        {/* pen tip */}
        {penVisible && (
          <div
            style={{
              position: "absolute",
              left: penX,
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 14, height: 10, borderRadius: "50%",
                background: "rgba(20,20,30,0.06)",
                position: "absolute", left: -7, top: -5,
              }}
            />
            <div
              style={{
                width: 5.6, height: 7.6, borderRadius: "50%",
                background: "#0a0a14", filter: "blur(0.3px)",
                position: "absolute", left: -3.8, top: -3.8,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
