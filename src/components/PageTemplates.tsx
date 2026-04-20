'use client';

import { useState } from 'react';

const TEMPLATES = [
  {
    id: 'open-letter',
    label: '📜 Open Letter',
    icon: '📜',
    preview: 'Formal, heartfelt, structured',
    title: 'A Letter for You',
    html: `<p>Dear [name],</p><p>I've been meaning to write this for a while now. There are things I want you to know — things that don't fit into a quick message or a late-night call.</p><p>First, I want to say...</p><p>With all my love,<br/>[your name]</p>`,
  },
  {
    id: 'memory',
    label: '🌿 Memory',
    icon: '🌿',
    preview: 'A moment frozen in time',
    title: 'I Remember When',
    html: `<p>I was thinking about the day when...</p><p>What I remember most is the way it felt — like the world had slowed down just enough for us to notice.</p><p>I didn't say it then, but I thought...</p>`,
  },
  {
    id: 'timeline',
    label: '📅 Timeline Entry',
    icon: '📅',
    preview: 'A marked moment in history',
    title: 'That Kind of Day',
    html: `<h3>What happened</h3><p>On a completely ordinary day, something extraordinary...</p><h3>What I felt</h3><p>Honestly? I wasn't ready for how much it would matter...</p><h3>What it means now</h3><p>Looking back, I think that was the moment when...</p>`,
  },
  {
    id: 'postcard',
    label: '💌 Postcard',
    icon: '💌',
    preview: 'Short, warm, and vivid',
    title: 'Just a Note',
    html: `<p>Wish you were here. Or maybe I wish <em>I</em> was there — wherever you are, reading this.</p><p>I keep thinking about you and smiling for no reason. That's your fault, by the way.</p>`,
  },
  {
    id: 'confession',
    label: '🪞 Confession',
    icon: '🪞',
    preview: 'Quiet, honest, raw',
    title: 'Something I Never Said',
    html: `<p><em>There's something I've been holding onto for a long time.</em></p><p>It's not dramatic. It's just true. And I think you deserve to know it.</p><p>The truth is...</p>`,
  },
];

export default function PageTemplates({
  onSelect,
}: {
  onSelect: (title: string, html: string) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);

  const pick = (t: typeof TEMPLATES[0]) => {
    setChosen(t.id);
    onSelect(t.title, t.html);
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <label className="label" style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'block' }}>
        START FROM A TEMPLATE  <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional — or just write freely)</span>
      </label>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t)}
            style={{
              background: chosen === t.id ? 'var(--accent)' : 'transparent',
              color: chosen === t.id ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${chosen === t.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-inter)',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t.label}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>{t.preview}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
