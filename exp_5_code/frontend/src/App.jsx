import { useState, useEffect } from 'react'
import PostComposer from './PostComposer'
import PostList from './PostList'
import GlobalError from './GlobalError'
import './App.css'

const API_URL = 'http://localhost:8080/api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setGlobalError("Could not connect to backend server. Make sure Spring Boot is running on port 8080.");
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      setGlobalError("Failed to create post.");
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      setGlobalError("Failed to delete post.");
    }
  };

  const handleUpdatePost = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      setGlobalError("Failed to update post.");
    }
  };

  return (
    <div className="app-container">
      <GlobalError message={globalError} onClose={() => setGlobalError(null)} />
      
      <header className="app-header">
        <h1>OmniPost Composer</h1>
        <p>Write once, publish anywhere. Respects platform word limits.</p>
      </header>
      
      <main className="app-main">
        <PostComposer 
          onPostCreate={handleCreatePost} 
          onError={setGlobalError} 
        />
        <PostList 
          posts={posts} 
          onDelete={handleDeletePost} 
          onUpdate={handleUpdatePost} 
        />
      </main>
    </div>
  )
}

export default App;
