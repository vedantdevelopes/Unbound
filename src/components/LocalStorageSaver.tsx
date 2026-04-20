'use client';

import { useEffect } from 'react';

/** Saves this library's editId to localStorage for the creator dashboard. */
export default function LocalStorageSaver({ editId, name }: { editId: string; name: string }) {
  useEffect(() => {
    try {
      const existing: { editId: string; name: string; ts: number }[] =
        JSON.parse(localStorage.getItem('unbound-libraries') || '[]');
      const filtered = existing.filter(l => l.editId !== editId);
      filtered.unshift({ editId, name, ts: Date.now() });
      localStorage.setItem('unbound-libraries', JSON.stringify(filtered.slice(0, 30)));
    } catch { /* Safari private mode can fail */ }
  }, [editId, name]);
  return null;
}
