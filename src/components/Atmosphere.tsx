import React, { useMemo } from 'react';

const Atmosphere = ({ seed = 0 }: { seed?: number }) => {
  const isMobile = useMemo(() => window.innerWidth <= 768, []);

  const bokeh = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        key: `b-${seed}-${i}`,
        left: `${(i * 20 + seed * 7) % 100}%`,
        top: `${(i * 25 + seed * 11) % 80}%`,
        size: 20 + ((i * 9) % 20),
        delay: (i * 0.8) % 2.5,
        dur: 8 + (i % 3) * 1.8,
      })),
    [seed]
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => ({
        key: `p-${seed}-${i}`,
        left: `${(i * 20 + seed * 13) % 100}%`,
        delay: (i * 0.6) % 2.5,
        dur: 10 + (i % 4) * 1.5,
        size: 6 + ((i * 3) % 4),
        drift: -20 + ((i * 17) % 40),
      })),
    [seed]
  );

  return (
    <div className="particles atmosphere" aria-hidden="true">
      {bokeh.map((b) => (
        <span
          key={b.key}
          className="bokeh"
          style={{
            left: b.left,
            top: b.top,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            willChange: 'transform, opacity'
          }}
        />
      ))}
      {petals.map((p) => (
        <span
          key={p.key}
          className="petal"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ['--petal-drift' as any]: `${p.drift}px`,
            willChange: 'transform, opacity'
          }}
        />
      ))}
    </div>
  );
};

export default Atmosphere;