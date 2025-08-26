import React, { useState, useEffect } from 'react';
import './App.css';
import ItemList from './components/ItemList';
import ItemForm from './components/ItemForm';
import EditItem from './components/EditItem';
import Auth from './components/Auth';

function App() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
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
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении');
      }

      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Фитинги и рукава высокого давления</h1>
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
            {editingItem ? (
              <EditItem
                item={editingItem}
                onCancel={() => setEditingItem(null)}
                onUpdate={fetchItems}
              />
            ) : (
              <ItemForm onAdd={fetchItems} />
            )}
          </div>
        )}
        <div className="list-section">
          <ItemList
            items={items}
            onDelete={user.is_admin ? handleDelete : null}
            onEdit={user.is_admin ? handleEdit : null}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
