'use client';
import { useEffect, useState } from 'react';

export default function StudioPageFade({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  return (
    <div style={{
      opacity: ready ? 1 : 0,
      transform: ready ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 220ms ease, transform 220ms ease',
    }}>
      {children}
    </div>
  );
}
