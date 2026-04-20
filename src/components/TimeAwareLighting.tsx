'use client';

import { useEffect, useRef } from 'react';

const TIME_CLASSES: Record<string, string> = {
  dawn:  'time-dawn',
  day:   'time-day',
  dusk:  'time-dusk',
  night: 'time-night',
};

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 8)  return 'dawn';
  if (h >= 8  && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

export default function TimeAwareLighting() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const period = getTimeOfDay();
    if (ref.current) {
      ref.current.setAttribute('data-time', period);
    }
    // Inject once-per-mount CSS
  }, []);

  return (
    <>
      <div ref={ref} id="time-lighting" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, transition: 'opacity 2s ease' }} />
      <style>{`
        #time-lighting[data-time="dawn"]  { background: radial-gradient(ellipse at 50% 100%, rgba(255,180,100,0.07) 0%, transparent 70%); }
        #time-lighting[data-time="day"]   { background: transparent; }
        #time-lighting[data-time="dusk"]  { background: radial-gradient(ellipse at 50% 100%, rgba(255,120,40,0.10) 0%, transparent 70%); }
        #time-lighting[data-time="night"] { background: radial-gradient(ellipse at 50% 50%, rgba(30,20,10,0.35) 0%, transparent 80%); }
      `}</style>
    </>
  );
}
