import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 3000); // Poll every 3 seconds to show updates
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !scheduleTime) return;

    try {
      await fetch('http://localhost:8080/api/posts/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          scheduledTime: new Date(scheduleTime).toISOString()
        })
      });
      setContent('');
      setScheduleTime('');
      fetchPosts();
    } catch (error) {
      console.error("Error scheduling post:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Kafka Event-Driven Publisher</h1>
        <p>Schedule your posts and watch the Kafka pipeline in action!</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <h2>Schedule a New Post</h2>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Post Content:</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required
              />
            </div>
            <div className="form-group">
              <label>Schedule Time:</label>
              <input 
                type="datetime-local" 
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Schedule Post</button>
          </form>
        </section>

        <section className="posts-section">
          <h2>Scheduled Posts</h2>
          <div className="posts-grid">
            {posts.length === 0 ? (
              <p className="no-posts">No posts scheduled yet.</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className={`post-card status-${post.status.toLowerCase()}`}>
                  <div className="post-header">
                    <span className="post-id">ID: {post.id}</span>
                    <span className="post-status">{post.status}</span>
                  </div>
                  <div className="post-content">{post.content}</div>
                  <div className="post-time">
                    Scheduled: {new Date(post.scheduledTime).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
