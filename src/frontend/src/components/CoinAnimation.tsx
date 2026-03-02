import { useCallback, useState } from "react";

interface CoinParticle {
  id: number;
  x: number;
  y: number;
  amount: number;
}

let particleId = 0;

export function useCoinAnimation() {
  const [particles, setParticles] = useState<CoinParticle[]>([]);

  const trigger = useCallback((amount: number, rect?: DOMRect) => {
    const id = ++particleId;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    setParticles((prev) => [...prev, { id, x, y, amount }]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1400);
  }, []);

  return { particles, trigger };
}

interface CoinOverlayProps {
  particles: CoinParticle[];
}

export function CoinOverlay({ particles }: CoinOverlayProps) {
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed z-[9999] pointer-events-none coin-float"
          style={{ left: p.x, top: p.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="flex items-center gap-1 bg-card border border-gold/40 rounded-full px-3 py-1.5 shadow-gold-sm">
            <span className="text-sm">🪙</span>
            <span className="text-xs font-bold gold-text">+{p.amount}</span>
          </div>
          {/* Sparkles */}
          {([0, 1, 2, 3] as const).map((i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute sparkle"
              style={{
                left: `${50 + Math.cos((i * Math.PI) / 2) * 24}%`,
                top: `${50 + Math.sin((i * Math.PI) / 2) * 24}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span className="text-xs">✨</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
