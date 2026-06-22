import { useMemo, useRef, useState, type DragEvent } from 'react';
import { downloadBlob } from '../export/exportZip';
import { PHRASE_CATEGORIES, PHRASE_LIBRARY, PHRASE_PRESETS } from '../domain/phrases';
import type { CaptionSlot, PhraseEntry } from '../domain/types';
import { useProject } from '../state/ProjectContext';

const CUSTOM_KEY = 'line-sticker-custom-phrases-v1';
function loadCustom(): PhraseEntry[] { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]') as PhraseEntry[]; } catch { return []; } }

export function PhraseSelector() {
  const { project, dispatch } = useProject(); const [category, setCategory] = useState(PHRASE_CATEGORIES[0]);
  const importRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''); const [custom, setCustom] = useState<PhraseEntry[]>(loadCustom);
  const [customText, setCustomText] = useState(''); const all = useMemo(() => [...PHRASE_LIBRARY, ...custom], [custom]);
  const filtered = all.filter((entry) => (category === '全部' || entry.category === category) && (!query || `${entry.text}${entry.intent}`.includes(query)));
  const cellCount = project.settings.rows * project.settings.columns; const selectedIds = new Set(project.captionSlots.map((item) => item.phraseId));
  function setSlots(captionSlots: CaptionSlot[]) { dispatch({ type: 'update', patch: { captionSlots } }); }
  function toggle(entry: PhraseEntry) {
    if (selectedIds.has(entry.id)) return setSlots(project.captionSlots.filter((item) => item.phraseId !== entry.id));
    if (project.captionSlots.length >= cellCount) return;
    setSlots([...project.captionSlots, { id: crypto.randomUUID(), phraseId: entry.id, text: entry.text, category: entry.category, intent: entry.intent, visible: entry.category !== '無文字動作' }]);
  }
  function applyPreset(name: string) {
    const texts = PHRASE_PRESETS[name]; const pool = [...texts, ...PHRASE_LIBRARY.map((item) => item.text)];
    const unique = [...new Set(pool)].slice(0, cellCount);
    setSlots(unique.map((text) => { const entry = all.find((item) => item.text === text) ?? all[0];
      return { id: crypto.randomUUID(), phraseId: entry.id, text, category: entry.category, intent: entry.intent, visible: true }; }));
  }
  function addCustom() {
    const text = customText.trim(); if (!text || all.some((item) => item.text === text)) return;
    const next = [...custom, { id: `custom-${crypto.randomUUID()}`, category: '我的常用語', text, intent: `以「${text}」的語意設計表情與動作`, tone: 'casual' as const }];
    setCustom(next); localStorage.setItem(CUSTOM_KEY, JSON.stringify(next)); setCustomText(''); setCategory('我的常用語');
  }
  function exportCustom(){downloadBlob(new Blob([JSON.stringify(custom,null,2)],{type:'application/json'}),'line-sticker-phrases.json');}
  async function importCustom(file:File){const value=JSON.parse(await file.text()) as PhraseEntry[];if(!Array.isArray(value))return;const safe=value.filter((item)=>item&&typeof item.text==='string'&&typeof item.category==='string').map((item)=>({...item,id:item.id||`custom-${crypto.randomUUID()}`}));setCustom(safe);localStorage.setItem(CUSTOM_KEY,JSON.stringify(safe));}
  function drop(event: DragEvent, target: number) {
    const from = Number(event.dataTransfer.getData('text/plain')); if (!Number.isInteger(from) || from === target) return;
    const next = [...project.captionSlots]; const [item] = next.splice(from, 1); next.splice(target, 0, item); setSlots(next);
  }
  return <section className="phrase-section panel">
    <div className="phrase-header"><div className="section-heading"><span>文</span><div><h2>常用文字詞庫</h2><p>{PHRASE_CATEGORIES.length} 類 · {PHRASE_LIBRARY.length} 組內建短句</p></div></div>
      <strong className={project.captionSlots.length === cellCount ? 'slot-count complete' : 'slot-count'}>{project.captionSlots.length} / {cellCount}</strong></div>
    <div className="preset-row">{Object.keys(PHRASE_PRESETS).map((name) => <button key={name} className="mini-button" onClick={() => applyPreset(name)}>{name}</button>)}</div>
    <div className="phrase-tools"><input aria-label="搜尋文字" placeholder="搜尋文字或語意" value={query} onChange={(e) => setQuery(e.target.value)} />
      <select aria-label="文字分類" value={category} onChange={(e) => setCategory(e.target.value)}><option>全部</option>{[...PHRASE_CATEGORIES, '我的常用語'].map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="phrase-options">{filtered.map((entry) => <label key={entry.id} className={selectedIds.has(entry.id) ? 'phrase-option selected' : 'phrase-option'}>
      <input type="checkbox" checked={selectedIds.has(entry.id)} disabled={!selectedIds.has(entry.id) && project.captionSlots.length >= cellCount} onChange={() => toggle(entry)} />
      <span>{entry.text}<small>{entry.category}</small></span></label>)}</div>
    <div className="custom-phrase"><input placeholder="新增自己的常用文字" value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }} /><button onClick={addCustom}>加入</button><button onClick={exportCustom}>匯出詞庫</button><button onClick={()=>importRef.current?.click()}>匯入詞庫</button><input ref={importRef} hidden type="file" accept="application/json" onChange={(e)=>{const file=e.target.files?.[0];if(file)void importCustom(file);}}/></div>
    <div className="selected-slots">{project.captionSlots.map((slot, index) => <div key={slot.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
      onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, index)}><b>{String(index + 1).padStart(2, '0')}</b><span>{slot.text}</span>
      <button aria-label={`移除 ${slot.text}`} onClick={() => setSlots(project.captionSlots.filter((item) => item.id !== slot.id))}>×</button></div>)}</div>
  </section>;
}
