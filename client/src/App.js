import React, { useState, useEffect } from 'react';
import './App.css';
import MatchList from './components/MatchList';
import MatchForm from './components/MatchForm';
import EditMatch from './components/EditMatch';
import Auth from './components/Auth';
import Airplane from './components/Airplane';

function App() {
  const [matches, setMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении');
      }

      fetchMatches();
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Киберспортивные результаты</h1>
        <div className="user-info">
          <span>Привет, {user.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
        </div>
      </header>
      <div className="container">
        {user.is_admin && (
          <div className="form-section">
            {editingMatch ? (
              <EditMatch
                match={editingMatch}
                onCancel={() => setEditingMatch(null)}
                onUpdate={fetchMatches}
              />
            ) : (
              <MatchForm onAdd={fetchMatches} />
            )}
          </div>
        )}
        <div className="list-section">
          <MatchList
            matches={matches}
            onDelete={user.is_admin ? handleDelete : null}
            onEdit={user.is_admin ? handleEdit : null}
          />
        </div>
        <Airplane />
      </div>
    </div>
  );
}

export default App;
