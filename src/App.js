import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const DEFAULT_CATEGORIES = [
  { id: 'general',  label: 'General',  icon: '⭐' },
  { id: 'work',     label: 'Work',     icon: '💼' },
  { id: 'coding',   label: 'Coding',   icon: '💻' },
  { id: 'reading',  label: 'Reading',  icon: '📖' },
  { id: 'dev',      label: 'Dev',      icon: '</>' },
  { id: 'personal', label: 'Personal', icon: '🙂' },
];

const NOTE_COLORS = [
  { id: 'sky',      value: '#79D4F1' },
  { id: 'yellow',   value: '#F9E04B' },
  { id: 'salmon',   value: '#F4837C' },
  { id: 'green',    value: '#82D48E' },
  { id: 'lavender', value: '#C9B3F5' },
  { id: 'white',    value: '#E8E8E8' },
];

const FONTS = [
  { id: 'Poppins',      label: 'Poppins' },
  { id: 'Inter',        label: 'Inter' },
  { id: 'Roboto',       label: 'Roboto' },
  { id: 'Caveat',       label: 'Caveat' },
  { id: 'Indie Flower', label: 'Indie Flower' },
];

const TREE_STAGES = [
  { min: 0,  max: 4,        emoji: '🌱', label: 'Seed',             desc: 'Your journey begins with a single idea.' },
  { min: 5,  max: 9,        emoji: '🌿', label: 'Sprout',           desc: 'Ideas are taking root!' },
  { min: 10, max: 19,       emoji: '🌳', label: 'Young Tree',       desc: 'Growing steadily, task by task.' },
  { min: 20, max: 39,       emoji: '🌲', label: 'Growing Tree',     desc: 'A mighty tree of progress!' },
  { min: 40, max: Infinity, emoji: '🌳', label: 'Flourishing Tree', desc: "You're a force of creativity!" },
];

function getTreeStage(n) {
  return TREE_STAGES.find(s => n >= s.min && n <= s.max) || TREE_STAGES[0];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function migrateNote(n) {
  if (Array.isArray(n.tasks)) return n;
  const tasks = n.description && n.description.trim()
    ? n.description.trim().split('\n').filter(Boolean).map(t => ({ id: uid(), text: t, completed: false }))
    : [];
  const { description, completed, ...rest } = n;
  return { ...rest, tasks };
}

function countCompletedTasks(notes) {
  return (notes || []).reduce((s, n) => s + (n.tasks || []).filter(t => t.completed).length, 0);
}

function isAllDone(note) {
  const t = note.tasks || [];
  return t.length > 0 && t.every(t => t.completed);
}

// ─── NoteCard ─────────────────────────────────────────────────────────────────
function NoteCard({ note, categories, onToggleTask, onToggleFavorite, onEdit, onDelete }) {
  const cat = (categories || []).find(c => c.id === note.category);
  const tasks = note.tasks || [];
  const done = tasks.filter(t => t.completed).length;
  const allDone = isAllDone(note);

  return (
    <div className={`nc ${allDone ? 'nc--done' : ''}`} style={{ '--nc-bg': note.color || '#F9E04B' }}>
      {/* title row */}
      <div className="nc__top">
        <h3 className="nc__title">{note.title}</h3>
      </div>

      {/* tasks */}
      {tasks.length > 0 && (
        <ul className="nc__tasks">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`nc__task ${task.completed ? 'nc__task--done' : ''}`}
              onClick={() => onToggleTask(note.id, task.id)}
            >
              <span className="nc__cb">
                {task.completed
                  ? <svg viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" fill="rgba(0,0,0,0.55)" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/><path d="M4.5 9l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="3" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5"/></svg>
                }
              </span>
              <span className="nc__task-text">{task.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* footer */}
      <div className="nc__footer">
        <span className="nc__date">
          {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {tasks.length > 0 && <span className="nc__progress"> · {done}/{tasks.length}</span>}
        </span>
        <div className="nc__foot-actions">
          <button className="nc__icon-btn" onClick={() => onEdit(note)} title="Edit">
            <svg viewBox="0 0 20 20" fill="none"><path d="M14.85 2.85a2 2 0 012.83 2.83L6.5 16.83 3 17.5l.67-3.5L14.85 2.85z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="nc__icon-btn nc__icon-btn--del" onClick={() => onDelete(note.id)} title="Delete">
            <svg viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
          <button
            className={`nc__icon-btn nc__star ${note.favorite ? 'nc__star--on' : ''}`}
            onClick={() => onToggleFavorite(note.id)}
            title="Favorite"
          >
            <svg viewBox="0 0 20 20"><path d="M10 2l2.39 4.84 5.34.78-3.86 3.76.91 5.31L10 14.27l-4.78 2.52.91-5.31L2.27 7.62l5.34-.78L10 2z" fill={note.favorite ? 'rgba(0,0,0,0.6)' : 'none'} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      {cat && <div className="nc__cat-dot" title={cat.label}>{cat.icon}</div>}
    </div>
  );
}

// ─── AddPanel ─────────────────────────────────────────────────────────────────
function AddPanel({ categories, editingNote, onSave, onCancelEdit, font, onFontChange }) {
  const [title, setTitle]       = useState('');
  const [tasksText, setTasksText] = useState('');
  const [color, setColor]       = useState(NOTE_COLORS[0].value);
  const [catId, setCatId]       = useState(categories[0]?.id || 'general');
  const [showFonts, setShowFonts] = useState(false);
  const titleRef = useRef(null);

  // populate form when editing
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setTasksText((editingNote.tasks || []).map(t => t.text).join('\n'));
      setColor(editingNote.color || NOTE_COLORS[0].value);
      setCatId(editingNote.category || categories[0]?.id || 'general');
    } else {
      reset();
    }
  }, [editingNote]);

  function reset() {
    setTitle('');
    setTasksText('');
    setColor(NOTE_COLORS[0].value);
    setCatId(categories[0]?.id || 'general');
  }

  function handleSave() {
    if (!title.trim()) return;
    const existingTasks = editingNote?.tasks || [];
    const lines = tasksText.split('\n').map(l => l.trim()).filter(Boolean);
    const tasks = lines.map(text => {
      const ex = existingTasks.find(t => t.text === text);
      return ex || { id: uid(), text, completed: false };
    });
    onSave({ title: title.trim(), tasks, color, category: catId });
    reset();
  }

  function handleClear() {
    if (editingNote) { onCancelEdit(); }
    reset();
  }

  const isEditing = Boolean(editingNote);

  return (
    <aside className="panel">
      {/* panel header */}
      <div className="panel__header">
        <span className="panel__pin">📌</span>
        <h2 className="panel__title">{isEditing ? 'Edit note…' : 'Add another item…'}</h2>
        <div className="panel__header-actions">
          <button className="panel__icon-btn" onClick={() => setShowFonts(v => !v)} title="Font">Aa</button>
        </div>
      </div>

      {/* font picker */}
      {showFonts && (
        <div className="panel__font-picker">
          {FONTS.map(f => (
            <button
              key={f.id}
              className={`panel__font-opt ${font === f.id ? 'panel__font-opt--active' : ''}`}
              style={{ fontFamily: `'${f.id}', sans-serif` }}
              onClick={() => { onFontChange(f.id); setShowFonts(false); }}
            >{f.label}</button>
          ))}
        </div>
      )}

      {/* title */}
      <div className="panel__field">
        <label className="panel__label">Title</label>
        <input
          ref={titleRef}
          className="panel__input"
          placeholder="e.g. Study Next.js"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      {/* tasks */}
      <div className="panel__field">
        <label className="panel__label">What do you need to do?</label>
        <textarea
          className="panel__textarea"
          placeholder={"e.g. Learn TypeScript\nBuild a small project\nDeploy on Vercel"}
          value={tasksText}
          onChange={e => setTasksText(e.target.value)}
          rows={5}
        />
      </div>

      {/* color */}
      <div className="panel__field">
        <label className="panel__label">Choose a color</label>
        <div className="panel__colors">
          {NOTE_COLORS.map(c => (
            <button
              key={c.id}
              className={`panel__color ${color === c.value ? 'panel__color--active' : ''}`}
              style={{ background: c.value }}
              onClick={() => setColor(c.value)}
            />
          ))}
        </div>
      </div>

      {/* category */}
      <div className="panel__field">
        <label className="panel__label">Category / Tag</label>
        <div className="panel__cats">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`panel__cat ${catId === cat.id ? 'panel__cat--active' : ''}`}
              onClick={() => setCatId(cat.id)}
              title={cat.label}
            >{cat.icon}</button>
          ))}
        </div>
      </div>

      {/* actions */}
      <button
        className="panel__add-btn"
        style={{ background: color, color: 'rgba(0,0,0,0.75)' }}
        onClick={handleSave}
        disabled={!title.trim()}
      >
        {isEditing ? 'Save Changes' : 'Add Note'} <span className="panel__plus">+</span>
      </button>
      <button className="panel__clear-btn" onClick={handleClear}>
        {isEditing ? 'Cancel' : 'Clear'}
      </button>
    </aside>
  );
}

// ─── TreeModal ────────────────────────────────────────────────────────────────
function TreeModal({ notes, onClose }) {
  const safeNotes = notes || [];
  const completed = countCompletedTasks(safeNotes);
  const favorites = safeNotes.filter(n => n.favorite).length;
  const total     = safeNotes.reduce((s, n) => s + (n.tasks || []).length, 0);
  const stage     = getTreeStage(completed);
  const next      = TREE_STAGES.find(s => s.min > completed);
  const toNext    = next ? next.min - completed : 0;
  const pct       = next ? Math.round(((completed - stage.min) / (next.min - stage.min)) * 100) : 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box tree-modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>My Growth Tree 🌳</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="tree-stage-display">
          <div className="tree-emoji">{stage.emoji}</div>
          <h3 className="tree-stage-name">{stage.label}</h3>
          <p className="tree-stage-desc">{stage.desc}</p>
        </div>
        <div className="tree-stats">
          <div className="tree-stat"><span className="tree-stat-value">{total}</span><span className="tree-stat-label">Total Tasks</span></div>
          <div className="tree-stat"><span className="tree-stat-value">{completed}</span><span className="tree-stat-label">Completed</span></div>
          <div className="tree-stat"><span className="tree-stat-value">{favorites}</span><span className="tree-stat-label">Favorites</span></div>
        </div>
        {next && (
          <div className="tree-progress-section">
            <div className="tree-progress-label">
              <span>To {next.emoji} {next.label}</span>
              <span>{toNext} tasks to go</span>
            </div>
            <div className="tree-progress-bar">
              <div className="tree-progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        {!next && <p className="tree-max-msg">🎉 You've reached the highest stage!</p>}
        <div className="tree-all-stages">
          {TREE_STAGES.map((s, i) => (
            <div key={i} className={`tree-stage-pill ${completed >= s.min ? 'unlocked' : 'locked'}`}>
              <span>{s.emoji}</span><span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem('stickyspace_notes');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map(migrateNote) : [];
    } catch { return []; }
  });

  const [categories] = useState(() => {
    try {
      const raw = localStorage.getItem('stickyspace_categories');
      return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });

  const [font, setFont] = useState(() => localStorage.getItem('stickyspace_font') || 'Poppins');

  const [search,         setSearch]         = useState('');
  const [filterType,     setFilterType]     = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingNote,    setEditingNote]     = useState(null);
  const [showTree,       setShowTree]        = useState(false);

  useEffect(() => {
    try { localStorage.setItem('stickyspace_notes', JSON.stringify(notes)); } catch {}
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem('stickyspace_font', font); } catch {}
    document.documentElement.style.setProperty('--app-font', `'${font}', sans-serif`);
  }, [font]);

  function handleSave(data) {
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...data } : n));
      setEditingNote(null);
    } else {
      setNotes(prev => [{ id: uid(), ...data, favorite: false, createdAt: new Date().toISOString() }, ...prev]);
    }
  }

  function handleToggleTask(noteId, taskId) {
    setNotes(prev => prev.map(n =>
      n.id !== noteId ? n : {
        ...n,
        tasks: (n.tasks || []).map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      }
    ));
  }

  function handleToggleFavorite(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n));
  }

  function handleDelete(id) {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (editingNote?.id === id) setEditingNote(null);
  }

  const safeNotes = notes || [];
  const completedTaskCount = countCompletedTasks(safeNotes);
  const treeStage = getTreeStage(completedTaskCount);

  const filtered = safeNotes.filter(note => {
    const q = search.toLowerCase();
    const tasks = note.tasks || [];
    const matchSearch = !q ||
      (note.title || '').toLowerCase().includes(q) ||
      tasks.some(t => (t.text || '').toLowerCase().includes(q));
    const matchCat = filterCategory === 'all' || note.category === filterCategory;
    const allDone = isAllDone(note);
    const matchType =
      filterType === 'all' ||
      (filterType === 'favorites' && note.favorite) ||
      (filterType === 'completed' && allDone) ||
      (filterType === 'active' && !allDone);
    return matchSearch && matchCat && matchType;
  });

  return (
    <div className="app" style={{ fontFamily: `'${font}', sans-serif` }}>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📌</span>
            <span className="logo-text">StickySpace</span>
          </div>
          <span className="header-tagline">your creative idea wall</span>
        </div>
        <div className="header-right">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search ideas…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>
          <div className="filter-row">
            {[
              { id: 'all',       label: 'All' },
              { id: 'favorites', label: '❤️ Favorites' },
              { id: 'active',    label: '⭕ Active' },
              { id: 'completed', label: '✅ Done' },
            ].map(f => (
              <button
                key={f.id}
                className={`filter-pill ${filterType === f.id ? 'active' : ''}`}
                onClick={() => setFilterType(f.id)}
              >{f.label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Category bar ── */}
      <div className="cat-bar">
        <button
          className={`cat-pill ${filterCategory === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCategory('all')}
        >📋 All</button>
        {(categories || []).map(cat => (
          <button
            key={cat.id}
            className={`cat-pill ${filterCategory === cat.id ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat.id)}
          >{cat.icon} {cat.label}</button>
        ))}
      </div>

      {/* ── Main: wall + panel ── */}
      <div className="layout">
        {/* notes wall */}
        <main className="wall">
          {/* status bar */}
          <div className="wall__status">
            <span>{filtered.length} note{filtered.length !== 1 ? 's' : ''}</span>
            <span className="wall__dot" />
            <span style={{ color: '#4ade80' }}>All synced</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💭</div>
              <h3>This wall is empty</h3>
              <p>Add your first idea using the panel →</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filtered.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categories={categories}
                  onToggleTask={handleToggleTask}
                  onToggleFavorite={handleToggleFavorite}
                  onEdit={n => setEditingNote(n)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>

        {/* add / edit panel */}
        <AddPanel
          categories={categories || DEFAULT_CATEGORIES}
          editingNote={editingNote}
          onSave={handleSave}
          onCancelEdit={() => setEditingNote(null)}
          font={font}
          onFontChange={setFont}
        />
      </div>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>{safeNotes.length} note{safeNotes.length !== 1 ? 's' : ''}</span>
        <span className="footer-dot" />
        <span style={{ color: '#4ade80' }}>All synced</span>
        <span className="footer-tagline">Keep it simple. Keep it moving.</span>
      </footer>

      {/* ── Tree FAB ── */}
      <button className="tree-fab" onClick={() => setShowTree(true)} title="My Growth Tree">
        <span className="tree-fab-emoji">{treeStage.emoji}</span>
        <span className="tree-fab-label">My Tree</span>
      </button>

      {showTree && <TreeModal notes={safeNotes} onClose={() => setShowTree(false)} />}
    </div>
  );
}