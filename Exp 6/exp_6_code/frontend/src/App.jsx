import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  // Backend API URL
  const API_URL = 'http://localhost:8080/api/tasks';

  useEffect(() => {
    fetchTasks();
  }, [page]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?page=${page}&size=${pageSize}&sort=id,desc`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setTasks(data.content);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, completed: false })
      });
      await response.json();
      setNewTaskTitle(''); 
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PUT'
      });
      const updatedTask = await response.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Stats for the current page
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="app-container">
      {/* Animated Background Elements */}
      <div className="bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="glass-card">
        <header className="header">
          <h1 className="title">Student Task Manager</h1>
          <p className="subtitle">Experiment 6: Scalable APIs & Caching</p>
        </header>

        <div className="stats-container">
          <div className="stat-box">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Tasks</span>
          </div>
          <div className="stat-box">
            <span className="stat-number text-green">{completedCount}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat-box">
            <span className="stat-number text-orange">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <form onSubmit={handleAddTask} className="add-task-form">
          <div className="input-group">
            <input
              type="text"
              className="task-input"
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <div className="input-glow"></div>
          </div>
          <button type="submit" className="add-button">
            <span className="btn-text">Add</span>
            <div className="btn-glow"></div>
          </button>
        </form>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Fetching tasks from H2 Database...</p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <p className="empty-text">No tasks on this page. You're all caught up!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content" onClick={() => handleToggleTask(task.id)}>
                    <div className={`checkbox-wrapper ${task.completed ? 'checked' : ''}`}>
                      <div className="checkbox-inner">
                        {task.completed && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-meta">ID: #{task.id} • Backend Data</span>
                    </div>
                  </div>
                  <button className="delete-button" onClick={() => handleDeleteTask(task.id)} title="Delete Task">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="trash-icon">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))
            )}
            
            {/* Premium Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button 
                  onClick={() => setPage(page - 1)} 
                  disabled={page === 0}
                  className="page-button"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Prev
                </button>
                
                <div className="page-indicator">
                  <span className="current-page">{page + 1}</span>
                  <span className="page-divider">/</span>
                  <span className="total-pages">{totalPages}</span>
                </div>
                
                <button 
                  onClick={() => setPage(page + 1)} 
                  disabled={page >= totalPages - 1}
                  className="page-button"
                >
                  Next
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
