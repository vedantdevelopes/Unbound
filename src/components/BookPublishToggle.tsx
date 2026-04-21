'use client';

import { useTransition } from 'react';
import { toggleBookPublished } from '@/app/actions';

interface Props {
  editId: string;
  bookId: string;
  isPublished: boolean;
}

export default function BookPublishToggle({ editId, bookId, isPublished }: Props) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(() => {
      toggleBookPublished(editId, bookId, isPublished);
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      title={isPublished ? 'Click to hide from public view' : 'Click to make visible'}
      style={{
        position: 'absolute', top: '0.75rem', left: '0.75rem',
        zIndex: 10, border: 'none', borderRadius: '6px',
        padding: '0.3rem 0.65rem',
        fontFamily: 'var(--font-geist-mono)', fontSize: '9px',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        cursor: pending ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        background: isPublished
          ? 'rgba(16,185,129,0.15)'
          : 'rgba(255,255,255,0.08)',
        color: isPublished ? '#10b981' : 'rgba(255,255,255,0.4)',
        border: `1px solid ${isPublished ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.12)'}`,
        backdropFilter: 'blur(4px)',
        opacity: pending ? 0.6 : 1,
      }}
    >
      {pending ? '…' : isPublished ? '● LIVE' : '○ HIDDEN'}
    </button>
  );
}
