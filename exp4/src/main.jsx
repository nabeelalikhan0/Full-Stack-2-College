import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, Filter, Grid2X2,
  List, MoreHorizontal, Plus, Search, Settings2, Sparkles, Trash2, X
} from 'lucide-react';
import './index.css';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const platformColors = { Instagram: '#e65f52', LinkedIn: '#2878a8', X: '#1d2428', Blog: '#e0a33c' };
const initialPosts = [
  { id: 1, title: 'The quiet power of a consistent voice', date: '2026-09-02', time: '09:30', platform: 'LinkedIn', status: 'Published', color: '#2878a8' },
  { id: 2, title: 'Behind the scenes: Studio day', date: '2026-09-04', time: '12:00', platform: 'Instagram', status: 'Scheduled', color: '#e65f52' },
  { id: 3, title: 'September notes: what we are learning', date: '2026-09-08', time: '08:15', platform: 'Blog', status: 'Draft', color: '#e0a33c' },
  { id: 4, title: 'Three small rituals for better work', date: '2026-09-11', time: '10:45', platform: 'X', status: 'Scheduled', color: '#1d2428' },
  { id: 5, title: 'A field guide to thoughtful launches', date: '2026-09-15', time: '14:30', platform: 'LinkedIn', status: 'Scheduled', color: '#2878a8' },
  { id: 6, title: 'Weekend reading list', date: '2026-09-19', time: '11:00', platform: 'Instagram', status: 'Scheduled', color: '#e65f52' },
  { id: 7, title: 'What makes an idea memorable?', date: '2026-09-24', time: '16:00', platform: 'Blog', status: 'Draft', color: '#e0a33c' },
  { id: 8, title: 'Monthly studio dispatch', date: '2026-09-29', time: '09:00', platform: 'LinkedIn', status: 'Scheduled', color: '#2878a8' }
];

function isoDate(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const previousCount = new Date(year, month, 0).getDate();
  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstDay + 1;
    if (dayOffset < 1) return { day: previousCount + dayOffset, monthOffset: -1, date: isoDate(year, month - 1, previousCount + dayOffset) };
    if (dayOffset > count) return { day: dayOffset - count, monthOffset: 1, date: isoDate(year, month + 1, dayOffset - count) };
    return { day: dayOffset, monthOffset: 0, date: isoDate(year, month, dayOffset) };
  });
}
function formatDate(date) { return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }

function App() {
  const today = new Date(2026, 8, 2);
  const [cursor, setCursor] = useState(today);
  const [posts, setPosts] = useState(initialPosts);
  const [selectedDate, setSelectedDate] = useState('2026-09-02');
  const [selectedPost, setSelectedPost] = useState(null);
  const [view, setView] = useState('month');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [scale, setScale] = useState(1);
  const setRenderScale = setScale;
  const [renderMode, setRenderMode] = useState('optimized');
  const [parentRender, setParentRender] = useState(0);
  const renderCount = useRef(0);
  const countedMode = useRef(renderMode);
  const skipNextCount = useRef(false);
  const initialRender = useRef(true);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const renderScale = scale;
  if (initialRender.current) initialRender.current = false;
  else if (skipNextCount.current) skipNextCount.current = false;
  else if (countedMode.current === renderMode) renderCount.current += renderMode === 'baseline' ? daysInMonth : 1;
  else countedMode.current = renderMode;

  const scaledPosts = useMemo(() => renderScale === 1 ? posts : posts.flatMap((post) => Array.from({ length: renderScale }, (_, index) => index === 0 ? post : { ...post, id: `${post.id}-${index}`, title: `${post.title} / sample ${index + 1}` })), [posts, renderScale]);
  const optimizedVisiblePosts = useMemo(() => scaledPosts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()) || post.platform.toLowerCase().includes(query.toLowerCase())), [scaledPosts, query]);
  const visiblePosts = renderMode === 'optimized' ? optimizedVisiblePosts : scaledPosts.filter((post) => post.title.toLowerCase().includes(query.toLowerCase()) || post.platform.toLowerCase().includes(query.toLowerCase()));
  const monthDays = useMemo(() => getMonthDays(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const selectedPosts = useMemo(() => visiblePosts.filter((post) => post.date === selectedDate), [visiblePosts, selectedDate]);
  const scheduled = useMemo(() => posts.filter((post) => post.status === 'Scheduled').length, [posts]);

  function resetCalendar() {
    setPosts(initialPosts);
    setSelectedDate('2026-09-02');
    setRenderMode('optimized');
    setRenderScale(1);
    setParentRender(0);
    renderCount.current = 0;
    countedMode.current = 'optimized';
    skipNextCount.current = true;
  }

  const moveMonth = useCallback((amount) => { setCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1)); }, []);
  const handleDrop = useCallback((date, event) => {
    const postId = event.dataTransfer.getData('postId');
    setPosts((current) => current.map((post) => String(post.id) === postId ? { ...post, date } : post));
    setSelectedDate(date);
  }, []);
  function savePost(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    const post = { id: Date.now(), title: values.title, date: values.date, time: values.time, platform: values.platform, status: 'Scheduled', color: platformColors[values.platform] };
    setPosts((current) => [...current, post]);
    setSelectedDate(values.date);
    setModal(false);
  }

  return (
    <main className="shell">
      <aside className="sidebar"><div className="backlog-heading"><h2>Post backlog</h2><p>Drag posts into any day cell.</p></div><div className="backlog-list">{posts.slice(0, 3).map((post) => <button className="backlog-post" key={post.id} draggable onDragStart={(event) => event.dataTransfer.setData('postId', post.id)} onClick={() => setSelectedPost(post)}><strong>{post.title}</strong><span>{post.platform} · {post.status}</span></button>)}</div><div className="sidebar-date"><div className="sidebar-date-heading"><span className="eyebrow">Selected date</span><strong>{formatDate(selectedDate)}</strong></div>{selectedPosts.length > 0 ? selectedPosts.map((post) => { const Detail = renderMode === 'optimized' ? PostDetail : BaselinePostDetail; return <Detail key={post.id} post={post} onClick={() => setSelectedPost(post)} />; }) : <span className="sidebar-empty">No posts scheduled</span>}</div><div className="sidebar-up-next"><div className="section-label"><span>Up next</span></div>{posts.filter((post) => post.date > selectedDate).slice(0, 2).map((post) => <div className="mini-post" key={post.id}><span className="mini-date">{formatDate(post.date)}</span><strong>{post.title}</strong><span className="mini-platform" style={{ color: post.color }}>{post.platform}</span></div>)}</div></aside>
      <section className="content">
        <header className="topbar"><div className="crumb">Workspace <ChevronRight size={14} /> <strong>Calendar</strong></div><div className="top-actions"><div className="search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content" /></div><button className="icon-button" aria-label="Notifications"><Bell size={18} /><i /></button><button className="new-button" onClick={() => setModal(true)}><Plus size={17} /> New post</button></div></header>
        <div className="page-heading"><div><p className="eyebrow">Performance engineering / React UI</p><h1>Interactive Calendar Optimization &amp; Testing</h1><p className="subtitle">Drag posts between the backlog and calendar, then compare render behavior.</p></div><div className="reference-controls"><button className="reference-button trigger" onClick={() => setParentRender((count) => count + 1)}>Trigger parent render</button></div></div>
        <div className="stats"><div><span className="stat-dot blue" /><strong>{scheduled}</strong><span>scheduled this month</span></div><div><span className="stat-dot gold" /><strong>{posts.filter((post) => post.status === 'Draft').length}</strong><span>drafts to review</span></div><div><span className="stat-dot coral" /><strong>4</strong><span>active channels</span></div></div>
        <div className="calendar-layout"><section className="calendar-panel"><div className="calendar-toolbar"><div className="month-control"><button className="square-button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={17} /></button><h2>{monthNames[cursor.getMonth()]} <span>{cursor.getFullYear()}</span></h2><button className="square-button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={17} /></button><button className="today-button" onClick={() => setCursor(today)}>Today</button></div><div className="legend"><span><i className="legend-dot instagram" /> Instagram</span><span><i className="legend-dot linkedin" /> LinkedIn</span><span><i className="legend-dot blog" /> Blog</span></div></div>{view === 'month' ? <div className="month-grid"><div className="weekday-row">{weekDays.map((day) => <span key={day}>{day}</span>)}</div><div className="days-grid">{monthDays.map((cell) => { const dayPosts = visiblePosts.filter((post) => post.date === cell.date); const isToday = cell.date === '2026-09-02'; return <div key={cell.date} data-date={cell.date} className={`day-cell ${cell.monthOffset !== 0 ? 'outside' : ''} ${selectedDate === cell.date ? 'focused' : ''}`} onClick={() => setSelectedDate(cell.date)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(cell.date, event)}><div className="day-number"><span className={isToday ? 'today-number' : ''}>{cell.day}</span>{dayPosts.length > 0 && <em>{dayPosts.length}</em>}</div><div className="day-events">{dayPosts.slice(0, 3).map((post) => <button key={post.id} draggable onDragStart={(event) => event.dataTransfer.setData('postId', post.id)} onClick={(event) => { event.stopPropagation(); setSelectedPost(post); }} className="event" style={{ '--event-color': post.color }}><b>{post.time}</b><span>{post.title}</span></button>)}{dayPosts.length > 3 && <small>+ {dayPosts.length - 3} more</small>}</div></div>})}</div></div> : (renderMode === 'optimized' ? <WeekView posts={visiblePosts} selectedDate={selectedDate} onSelect={setSelectedDate} onSelectPost={setSelectedPost} onDrop={handleDrop} /> : <BaselineWeekView posts={visiblePosts} selectedDate={selectedDate} onSelect={setSelectedDate} onSelectPost={setSelectedPost} onDrop={handleDrop} />)}</section>
          <aside className="details-panel"><div className="details-header"><div><p className="eyebrow">Render monitor</p><h2>{renderMode === 'optimized' ? 'ON' : 'OFF'}</h2></div><button className="square-button"><MoreHorizontal size={18} /></button></div><div className="right-mode-toggle mode-toggle"><button className={renderMode === 'baseline' ? 'selected' : ''} onClick={() => setRenderMode('baseline')}>Non-optimized</button><button className={renderMode === 'optimized' ? 'selected' : ''} onClick={() => setRenderMode('optimized')}>Optimized</button></div><button className="reference-button right-reset" onClick={resetCalendar}>Reset</button><div className="render-summary"><span className="summary-label">Optimization mode</span><strong>{renderMode === 'optimized' ? 'Memoized rendering' : 'Non-optimized rendering'}</strong><div className="summary-metrics"><span><b>{renderCount.current}</b> app renders</span><span><b>{parentRender}</b> parent checks</span><span><b>{renderScale}x</b> workload</span></div></div><div className="date-section"><div className="section-label"><span>Selected date · {formatDate(selectedDate)}</span></div>{selectedPosts.length > 0 ? <div className="selected-list">{selectedPosts.map((post) => { const Detail = renderMode === 'optimized' ? PostDetail : BaselinePostDetail; return <Detail key={post.id} post={post} onClick={() => setSelectedPost(post)} />; })}</div> : <div className="empty-state"><CalendarDays size={25} /><strong>No posts here yet</strong><span>Drop a post into this day or schedule something new.</span><button onClick={() => setModal(true)}><Plus size={15} /> Schedule post</button></div>}</div><div className="up-next"><div className="section-label"><span>Up next</span><button onClick={() => setView('month')}>View all</button></div>{posts.filter((post) => post.date > selectedDate).slice(0, 2).map((post) => <div className="mini-post" key={post.id}><span className="mini-date">{formatDate(post.date)}</span><strong>{post.title}</strong><span className="mini-platform" style={{ color: post.color }}>{post.platform}</span></div>)}</div></aside></div>
      </section>
      {modal && <div className="modal-backdrop" onClick={() => setModal(false)}><form className="modal" onSubmit={savePost} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">New content</p><h2>Schedule a post</h2></div><button type="button" className="square-button" onClick={() => setModal(false)}><X size={18} /></button></div><label>Post title<input name="title" required placeholder="What are you sharing?" /></label><div className="form-row"><label>Date<input name="date" type="date" defaultValue={selectedDate} required /></label><label>Time<input name="time" type="time" defaultValue="09:00" required /></label></div><label>Channel<select name="platform" defaultValue="Instagram"><option>Instagram</option><option>LinkedIn</option><option>X</option><option>Blog</option></select></label><button className="new-button submit" type="submit"><Plus size={17} /> Add to calendar</button></form></div>}
      {selectedPost && <div className="modal-backdrop" onClick={() => setSelectedPost(null)}><div className="modal post-modal" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="status-pill" style={{ '--pill-color': selectedPost.color }}>{selectedPost.status}</span><h2>{selectedPost.title}</h2></div><button className="square-button" onClick={() => setSelectedPost(null)}><X size={18} /></button></div><div className="post-info"><span><CalendarDays size={16} /> {formatDate(selectedPost.date)}</span><span><Clock3 size={16} /> {selectedPost.time}</span><span><span className="channel-dot" style={{ background: selectedPost.color }} /> {selectedPost.platform}</span></div><button className="delete-button" onClick={() => { setPosts((current) => current.filter((post) => post.id !== selectedPost.id)); setSelectedPost(null); }}><Trash2 size={15} /> Remove post</button></div></div>}
    </main>
  );
}

const PostDetail = memo(function PostDetail({ post, onClick }) { return <button className="detail-post" onClick={onClick}><span className="detail-bar" style={{ background: post.color }} /><div><div className="detail-top"><span>{post.platform}</span><span className="status-text">{post.status}</span></div><strong>{post.title}</strong><small><Clock3 size={13} /> {post.time}</small></div><ChevronRight size={16} /></button>; });
function BaselinePostDetail({ post, onClick }) { return <button className="detail-post" onClick={onClick}><span className="detail-bar" style={{ background: post.color }} /><div><div className="detail-top"><span>{post.platform}</span><span className="status-text">{post.status}</span></div><strong>{post.title}</strong><small><Clock3 size={13} /> {post.time}</small></div><ChevronRight size={16} /></button>; }
const WeekView = memo(function WeekView({ posts, selectedDate, onSelect, onSelectPost, onDrop }) { const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(`${selectedDate}T12:00:00`); date.setDate(date.getDate() - date.getDay() + index); return isoDate(date.getFullYear(), date.getMonth(), date.getDate()); }), [selectedDate]); return <div className="week-view"><div className="week-head">{dates.map((date) => <button key={date} className={date === selectedDate ? 'week-selected' : ''} onClick={() => onSelect(date)}>{weekDays[new Date(`${date}T12:00:00`).getDay()]}<strong>{new Date(`${date}T12:00:00`).getDate()}</strong></button>)}</div><div className="week-columns">{dates.map((date) => <div className="week-column" key={date} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(date, event)}>{posts.filter((post) => post.date === date).map((post) => <button draggable onDragStart={(event) => event.dataTransfer.setData('postId', post.id)} key={post.id} className="week-event" style={{ borderLeftColor: post.color }} onClick={() => onSelectPost(post)}><small>{post.time}</small><strong>{post.title}</strong><span>{post.platform}</span></button>)}</div>)}</div></div>; });
function BaselineWeekView({ posts, selectedDate, onSelect, onSelectPost, onDrop }) { const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(`${selectedDate}T12:00:00`); date.setDate(date.getDate() - date.getDay() + index); return isoDate(date.getFullYear(), date.getMonth(), date.getDate()); }); return <div className="week-view"><div className="week-head">{dates.map((date) => <button key={date} className={date === selectedDate ? 'week-selected' : ''} onClick={() => onSelect(date)}>{weekDays[new Date(`${date}T12:00:00`).getDay()]}<strong>{new Date(`${date}T12:00:00`).getDate()}</strong></button>)}</div><div className="week-columns">{dates.map((date) => <div className="week-column" key={date} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(date, event)}>{posts.filter((post) => post.date === date).map((post) => <button draggable onDragStart={(event) => event.dataTransfer.setData('postId', post.id)} key={post.id} className="week-event" style={{ borderLeftColor: post.color }} onClick={() => onSelectPost(post)}><small>{post.time}</small><strong>{post.title}</strong><span>{post.platform}</span></button>)}</div>)}</div></div>; }

export { App, getMonthDays, initialPosts };

if (typeof document !== 'undefined' && document.getElementById('root')) {
  createRoot(document.getElementById('root')).render(<App />);
}
