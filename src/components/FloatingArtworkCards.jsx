import { useEffect, useRef } from 'react';
import './FloatingArtworkCards.css';

/* Each entry defines the visual position/size of one card in the scene.
   x/y are percentage offsets from the container top-left.
   layer controls how far the card drifts on mouse parallax (higher = moves more = "closer").
*/
const CARD_LAYOUT = [
  // Back row — smallest, most faded
  { zIndex: 1, scale: 0.58, x: '82%', y: '4%',  rotate: -10, opacity: 0.45, layer: 0.3, w: 130 },
  { zIndex: 2, scale: 0.62, x: '65%', y: '0%',  rotate: -5,  opacity: 0.55, layer: 0.4, w: 140 },
  { zIndex: 3, scale: 0.66, x: '50%', y: '5%',  rotate: 6,   opacity: 0.62, layer: 0.45, w: 148 },
  // Middle row
  { zIndex: 4, scale: 0.78, x: '72%', y: '20%', rotate: -4,  opacity: 0.80, layer: 0.65, w: 172 },
  { zIndex: 5, scale: 0.76, x: '38%', y: '18%', rotate: -7,  opacity: 0.78, layer: 0.60, w: 168 },
  // Front row — biggest, most vivid
  { zIndex: 7, scale: 1,    x: '27%', y: '30%', rotate: -5,  opacity: 1,    layer: 1.0, w: 210 },
  { zIndex: 8, scale: 1.06, x: '53%', y: '40%', rotate: 2,   opacity: 1,    layer: 1.1, w: 220 },
  { zIndex: 7, scale: 0.95, x: '79%', y: '46%', rotate: -3,  opacity: 0.97, layer: 1.0, w: 200 },
  { zIndex: 6, scale: 0.85, x: '14%', y: '52%', rotate: 4,   opacity: 0.88, layer: 0.75, w: 180 },
];

export default function FloatingArtworkCards({ works }) {
  const containerRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRef.current = {
        x: (e.clientX - cx) / (rect.width / 2),
        y: (e.clientY - cy) / (rect.height / 2),
      };
    };

    const handleLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    const animate = () => {
      // Smooth lerp toward target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.06;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.06;

      const { x, y } = currentRef.current;
      const cards = el.querySelectorAll('.fc-card-wrap');
      cards.forEach((card, i) => {
        const layout = CARD_LAYOUT[i % CARD_LAYOUT.length];
        const dx = x * 22 * layout.layer;
        const dy = y * 16 * layout.layer;
        card.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Repeat works to fill all card slots
  const slots = CARD_LAYOUT.length;
  const displayWorks = Array.from({ length: slots }, (_, i) => works[i % works.length]);

  return (
    <div className="fc-scene" ref={containerRef}>
      {/* Ambient glow lines */}
      <svg className="fc-glow-lines" viewBox="0 0 620 520" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="#3cc8b4" stopOpacity="0.05" />
            <stop offset="45%" stopColor="#3cc8b4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffd93d" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="#ff6b6b" stopOpacity="0.04" />
            <stop offset="55%" stopColor="#a29bfe" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3cc8b4" stopOpacity="0.15" />
          </linearGradient>
          <filter id="blur1"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        {/* Main glow trail */}
        <path d="M 30 500 C 120 400 240 300 360 200 C 450 130 550 80 620 50"
          stroke="url(#g1)" strokeWidth="3" fill="none" opacity="0.8" filter="url(#blur1)" />
        <path d="M 30 500 C 120 400 240 300 360 200 C 450 130 550 80 620 50"
          stroke="url(#g1)" strokeWidth="1" fill="none" opacity="0.4" />
        {/* Secondary trail */}
        <path d="M 0 480 C 100 370 220 270 350 175 C 450 110 560 65 625 35"
          stroke="url(#g2)" strokeWidth="1.5" fill="none" opacity="0.35" filter="url(#blur1)" />
        {/* Glow dots along the path */}
        <circle cx="360" cy="200" r="4" fill="#3cc8b4" opacity="0.6" filter="url(#blur1)" />
        <circle cx="240" cy="300" r="3" fill="#ffd93d" opacity="0.4" filter="url(#blur1)" />
        <circle cx="480" cy="130" r="3" fill="#3cc8b4" opacity="0.5" filter="url(#blur1)" />
      </svg>

      {displayWorks.map((work, i) => {
        const layout = CARD_LAYOUT[i];
        return (
          <div
            key={`slot-${i}`}
            className="fc-card-wrap"
            style={{
              left: layout.x,
              top: layout.y,
              zIndex: layout.zIndex,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="fc-card"
              style={{
                width: layout.w,
                transform: `scale(${layout.scale}) rotate(${layout.rotate}deg)`,
                opacity: layout.opacity,
              }}
            >
              <div
                className="fc-card-img"
                style={work.image
                  ? { backgroundImage: `url(${work.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: work.color }
                }
              >
                <div className="fc-card-img-inner" />
              </div>
              <div className="fc-card-body">
                <div className="fc-card-title">{work.title}</div>
                <div className="fc-card-author">{work.author}</div>
                {layout.scale > 0.75 && (
                  <div className="fc-card-meta">
                    <span className="fc-meta-item">♥ {work.likes}</span>
                    <span className="fc-meta-item">👁 {work.views}</span>
                    <span
                      className="fc-tag"
                      style={{ background: work.tagColor + '28', color: work.tagColor }}
                    >
                      {work.tag}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
