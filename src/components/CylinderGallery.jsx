import { useEffect, useRef, useState } from "react";
import heroBg from "../assets/background.png";

const FILENAMES = [
  "1 AI - MALO.png",
  "2 AI - 무브잇.png",
  "3 AI - Reco.png",
  "4 AI - 오모.png",
  "5 AI - Mony.png",
  "6 AI - Tone-Z.png",
  "7 Human - Naru.png",
  "8 Human - Dear Me;Dear you.png",
  "9 Human - SafeShield.png",
  "10 Human - MAKO.png",
  "11 Network - 이음.png",
  "12 Network - survly.png",
  "13 Network - AdMatch.png",
  "14 Network - 정명.png",
  "15 Network - Star Spot.png",
  "16 Network - OVLY.png",
  "17 Personal - 모먼트인.png",
  "18 Personal - 더그아웃.png",
  "19 Personal - 애인 사주오!.png",
  "20 Personal - Ribumi.png",
  "21 Personal - Mikura.png",
  "22 Personal - 이상형.zip.png",
  "23 Creative - 쁘이.png",
  "24 Creative - Feed or Protect.png",
  "25 Creative - 세바스찬.png",
  "26 Creative - Who is criminal_.png",
  "27 Creative - 404 Not Found.png",
  "28 Creative - NewbieQuest.png",
  "29 Journey - WIP.png",
  "30 Journey - 시장여지도.png",
  "31 Journey - Artifact.png",
  "32 Journey - 체크잇.png",
  "33 Journey - Plank.png",
  "34 Journey - Mirim OAuth.png",
  "35 Global - Growvy.png",
  "36 Global - Trustay.png",
  "37 Global - WorkIt.png",
  "38 Global - Root.png",
  "39 Global - 토모랑.png",
  "40 Global - PuranPuran.png",
  "41 Global - Mytsuri.png",
];

const IMAGES = FILENAMES.map(
  (name) => `/projecthumbnail/${encodeURIComponent(name)}`,
);

const CARD_W = 440;
const CARD_H = 580;
const COUNT = IMAGES.length;
const THETA = 360 / COUNT;
const CARD_GAP = 1.03; // 카드 사이 간격 배수
const RADIUS = Math.round((CARD_W / 2 / Math.tan(Math.PI / COUNT)) * CARD_GAP);
const VIEW = Math.round(RADIUS * 0.72);
const BARREL = 5;
const DEPTH = 0.35;
const TWIST = 0.5;
const EASE = 0.055; // 낮을수록 느리고 부드럽게
const FLICK = 85; // 플릭 거리 줄임
const MAX_SKIP = 10;
const DRAG_SENS = 0.13; // 드래그 감도 낮춤

export default function CylinderGallery() {
  const stageRef = useRef(null);
  const areaRef = useRef(null);
  const goByRef = useRef(null);
  const [title, setTitle] = useState("EX.IT");
  const [description, setDescription] = useState(
    "전시에 대한 설명을 입력하세요",
  );
  const [editing, setEditing] = useState(false);
  const isAdmin = true; // TODO: 실제 로그인/권한 체크로 교체 필요 (지금은 항상 켜둠)

  useEffect(() => {
    const stage = stageRef.current;
    const area = areaRef.current;
    if (!stage || !area) return;

    const state = {
      rot: 0,
      target: 0,
      vel: 0,
      raf: null,
      front: -1,
      dragging: false,
      last: { x: 0, t: 0 },
      cards: [],
    };

    const cards = IMAGES.map((src, i) => {
      const c = document.createElement("div");
      c.style.position = "absolute";
      c.style.inset = "0";
      c.style.backfaceVisibility = "hidden";
      c.style.WebkitBackfaceVisibility = "hidden";
      c.style.transform = `rotateY(${i * THETA}deg) translateZ(-${RADIUS}px)`;
      const f = document.createElement("div");
      f.style.width = "100%";
      f.style.height = "100%";
      f.style.borderRadius = "22px";
      f.style.backgroundImage = `url("${src}")`;
      f.style.backgroundSize = "cover";
      f.style.backgroundPosition = "center";
      f.style.backgroundRepeat = "no-repeat";
      f.style.boxShadow =
        "0 30px 60px -20px rgba(40,40,50,.35),0 2px 10px rgba(0,0,0,.12)";
      f.style.transition = "box-shadow .3s ease";
      c.appendChild(f);

      stage.appendChild(c);
      return c;
    });
    state.cards = cards;

    function apply(r) {
      stage.style.transform = `translateZ(${VIEW}px) rotateY(${r}deg)`;
      state.cards.forEach((card, i) => {
        const rawDeg = (((i * THETA + r) % 360) + 360) % 360;
        const signedDeg = rawDeg > 180 ? rawDeg - 360 : rawDeg;
        const dist = Math.abs(signedDeg);
        const t = 1 - Math.cos((dist * Math.PI) / 180);
        const depth = +(1 - t * DEPTH).toFixed(3);
        const barrel = +(1 + t * BARREL).toFixed(3);
        const twist = +(signedDeg * TWIST).toFixed(2);
        card.style.transform = `rotateY(${i * THETA}deg) translateZ(-${RADIUS}px)`;
        if (card.firstChild)
          card.firstChild.style.transform = `perspective(500px) rotateY(${twist}deg) scale(${depth}) scaleY(${barrel})`;
      });
      const fI = ((Math.round(-r / THETA) % COUNT) + COUNT) % COUNT;
      if (fI !== state.front) {
        const prev = state.cards[state.front];
        const next = state.cards[fI];
        if (prev?.firstChild)
          prev.firstChild.style.boxShadow =
            "0 30px 60px -20px rgba(40,40,50,.35),0 2px 10px rgba(0,0,0,.12)";
        if (next?.firstChild)
          next.firstChild.style.boxShadow =
            "0 40px 80px -24px rgba(40,40,50,.5),0 2px 10px rgba(0,0,0,.18)";
        state.front = fI;
      }
    }

    function stopAnim() {
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = null;
    }

    function tick() {
      const next = state.rot + (state.target - state.rot) * EASE;
      if (Math.abs(state.target - next) < 0.02) {
        state.rot = state.target;
        apply(state.rot);
        state.raf = null;
        return;
      }
      state.rot = next;
      apply(state.rot);
      state.raf = requestAnimationFrame(tick);
    }

    function run() {
      if (state.raf == null) state.raf = requestAnimationFrame(tick);
    }

    function goBy(d) {
      stopAnim();
      state.target = (Math.round(state.rot / THETA) + d) * THETA;
      run();
    }
    goByRef.current = goBy;

    function down(e) {
      stopAnim();
      state.dragging = true;
      state.last = {
        x: e.touches ? e.touches[0].clientX : e.clientX,
        t: performance.now(),
      };
      state.vel = 0;
    }
    function move(e) {
      if (!state.dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX,
        now = performance.now();
      const dx = x - state.last.x,
        dt = Math.max(now - state.last.t, 1),
        delta = -dx * DRAG_SENS;
      state.rot += delta;
      apply(state.rot);
      state.vel = state.vel * 0.6 + (delta / dt) * 0.4;
      state.last = { x, t: now };
    }
    function up() {
      if (!state.dragging) return;
      state.dragging = false;
      const proj = state.rot + state.vel * FLICK,
        curIdx = Math.round(state.rot / THETA);
      let idx = Math.round(proj / THETA);
      idx = Math.max(curIdx - MAX_SKIP, Math.min(curIdx + MAX_SKIP, idx));
      state.target = idx * THETA;
      run();
    }
    function onKey(e) {
      if (e.key === "ArrowLeft") goBy(-1);
      if (e.key === "ArrowRight") goBy(1);
    }

    let wt;
    function onWheel(e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      stopAnim();
      state.rot += e.deltaX * 0.12;
      apply(state.rot);
      clearTimeout(wt);
      wt = setTimeout(() => {
        state.target = Math.round(state.rot / THETA) * THETA;
        run();
      }, 90);
    }

    area.addEventListener("mousedown", down);
    area.addEventListener("mousemove", move);
    area.addEventListener("mouseup", up);
    area.addEventListener("mouseleave", up);
    area.addEventListener("touchstart", down, { passive: true });
    area.addEventListener("touchmove", move, { passive: true });
    area.addEventListener("touchend", up);
    area.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);

    apply(0);

    return () => {
      stopAnim();
      area.removeEventListener("mousedown", down);
      area.removeEventListener("mousemove", move);
      area.removeEventListener("mouseup", up);
      area.removeEventListener("mouseleave", up);
      area.removeEventListener("touchstart", down);
      area.removeEventListener("touchmove", move);
      area.removeEventListener("touchend", up);
      area.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      while (stage.firstChild) stage.removeChild(stage.firstChild);
    };
  }, []);

  const navStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.6)",
    color: "#3a3a40",
    border: "1px solid rgba(0,0,0,.06)",
    backdropFilter: "blur(8px)",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,.08)",
    fontSize: "22px",
    transition: "background .2s",
    lineHeight: 1,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        userSelect: "none",
        touchAction: "pan-y",
        background: `url(${heroBg}) center/cover no-repeat`,
        fontFamily:
          '"Pretendard",ui-sans-serif,-apple-system,system-ui,sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.5,
          background: `
          repeating-linear-gradient(90deg,rgba(255,255,255,.55) 0 2px,rgba(0,0,0,0) 2px 16px) left/120px 100% no-repeat,
          repeating-linear-gradient(90deg,rgba(255,255,255,.55) 0 2px,rgba(0,0,0,0) 2px 16px) right/120px 100% no-repeat`,
          WebkitMask:
            "linear-gradient(90deg,#000,transparent 14%,transparent 86%,#000)",
          mask: "linear-gradient(90deg,#000,transparent 14%,transparent 86%,#000)",
        }}
      />

      <div
        ref={areaRef}
        style={{
          position: "absolute",
          inset: 0,
          cursor: "grab",
          perspective: "1200px",
          perspectiveOrigin: "50% 10%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          ref={stageRef}
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            marginTop: "950px",
            willChange: "transform",
            width: CARD_W + "px",
            height: CARD_H + "px",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "34%",
            pointerEvents: "none",
            background:
              "linear-gradient(180deg,rgba(255,255,255,0),rgba(243,240,234,0) 30%,rgba(235,231,222,.6))",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(120% 80% at 50% 45%,transparent 45%,rgba(120,115,105,.18) 100%)",
          }}
        />
      </div>

      <button
        onClick={() => goByRef.current?.(-1)}
        aria-label="이전"
        style={{ ...navStyle, left: "24px" }}
      >
        ‹
      </button>
      <button
        onClick={() => goByRef.current?.(1)}
        aria-label="다음"
        style={{ ...navStyle, right: "24px" }}
      >
        ›
      </button>
      <p
        style={{
          position: "absolute",
          bottom: "22px",
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          fontSize: "13px",
          color: "#9a958c",
        }}
      >
        드래그하거나 ← → 로 둘러보세요
      </p>
      <div
        style={{
          position: "absolute",
          top: "170px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          maxWidth: "80vw",
        }}
      >
        {isAdmin && editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="전시 이름을 입력하세요"
              size={Math.max(title.length, 1)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: "3px solid rgba(58,58,64,.35)",
                outline: "none",
                textAlign: "center",
                color: "#26242b",
                fontSize: "clamp(48px, 9vw, 96px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                padding: "0 4px 8px",
                textShadow: "0 8px 24px rgba(40,40,50,.15)",
              }}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="전시에 대한 설명을 입력하세요"
              rows={2}
              style={{
                width: "min(520px, 70vw)",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid rgba(58,58,64,.25)",
                outline: "none",
                textAlign: "center",
                resize: "none",
                color: "#6b6673",
                fontSize: "16px",
                lineHeight: 1.5,
                padding: "0 4px 6px",
              }}
            />
            <button
              onClick={() => setEditing(false)}
              style={{
                marginTop: "4px",
                padding: "8px 18px",
                borderRadius: "999px",
                border: "none",
                background: "#26242b",
                color: "#fff",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              완료
            </button>
          </>
        ) : (
          <>
            <h1
              style={{
                margin: 0,
                textAlign: "center",
                color: "#26242b",
                fontSize: "clamp(48px, 9vw, 96px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.03em",
                textShadow: "0 8px 24px rgba(40,40,50,.15)",
                paddingBottom: "8px",
                borderBottom: "3px solid rgba(58,58,64,.18)",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                color: "#6b6673",
                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  marginTop: "4px",
                  padding: "6px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(58,58,64,.25)",
                  background: "rgba(255,255,255,.6)",
                  color: "#3a3a40",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                수정
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
