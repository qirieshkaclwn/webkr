import React, { useState, useEffect } from 'react';

function EditItem({ item, onCancel, onUpdate }) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [photo, setPhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(item.photo);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
    setCurrentPhoto(item.photo);
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (photo) {
      formData.append('photo', photo);
    } else {
      formData.append('photo', currentPhoto);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении элемента');
      }

      onUpdate();
      onCancel();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <h2>Редактировать элемент</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="edit-title">Название:</label>
        <input
          type="text"
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="edit-description">Описание:</label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="edit-photo">Фото:</label>
        {currentPhoto && (
          <img
            src={`http://localhost:5000/uploads/${currentPhoto}`}
            alt="Текущее"
            className="current-photo"
          />
        )}
        <input
          type="file"
          id="edit-photo"
          onChange={(e) => setPhoto(e.target.files[0])}
          accept="image/*"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="update-btn">
          Обновить
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          Отмена
        </button>
      </div>
    </form>
  );
}

export default EditItem; 