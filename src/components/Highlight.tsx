import React from 'react';

/** Resalta el término buscado dentro de un texto, sin distinguir mayúsculas. */
export const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const haystack = text.toLowerCase();
  const needle = q.toLowerCase();
  if (!haystack.includes(needle)) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) {
      nodes.push(text.slice(i));
      break;
    }
    if (idx > i) nodes.push(text.slice(i, idx));
    nodes.push(
      <span key={key++} className="text-[#C0FF00]">
        {text.slice(idx, idx + needle.length)}
      </span>
    );
    i = idx + needle.length;
  }
  return <>{nodes}</>;
};