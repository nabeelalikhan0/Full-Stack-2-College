import { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null); // { name, role } once logged in
  const [error, setError] = useState('');

  const login = (role) => {
    const name = username.trim();
    if (!name) {
      setError('Please enter a username.');
      return;
    }
    setError('');
    setUser({ name, role });
  };

  const logout = () => {
    setUser(null);
    setUsername('');
  };

  // Logged-in view: the form is hidden
  if (user) {
    return (
      <div className="card">
        <h2>
          Welcome, {user.name} ({user.role})
        </h2>

        {user.role === 'Admin' ? (
          <button className="danger" onClick={() => alert('Post deleted!')}>
            Delete Post
          </button>
        ) : (
          <p className="readonly">Read-only access</p>
        )}

        <button className="secondary" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  // Login form
  return (
    <form className="card" onSubmit={(e) => e.preventDefault()}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button type="button" onClick={() => login('Admin')}>
        Login as Admin
      </button>
      <button type="button" onClick={() => login('Viewer')}>
        Login as Viewer
      </button>
    </form>
  );
}

export default App;
