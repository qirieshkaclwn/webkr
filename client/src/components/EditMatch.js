import React, { useState, useEffect } from 'react';

function EditMatch({ match, onCancel, onUpdate }) {
  const [formData, setFormData] = useState({
    team1: '',
    team2: '',
    team1_score: '',
    team2_score: '',
    tournament: '',
    game_type: '',
    match_date: '',
    status: 'upcoming',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (match) {
      setFormData({
        team1: match.team1 || '',
        team2: match.team2 || '',
        team1_score: match.team1_score || '',
        team2_score: match.team2_score || '',
        tournament: match.tournament || '',
        game_type: match.game_type || '',
        match_date: match.match_date ? match.match_date.slice(0, 16) : '',
        status: match.status || 'upcoming',
        description: match.description || ''
      });
    }
  }, [match]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    if (photo) {
      formDataToSend.append('photo', photo);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/matches/${match.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении матча');
      }

      onUpdate();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="match-form edit-form">
      <h2>Редактировать матч</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="team1">Команда 1:</label>
          <input
            type="text"
            id="team1"
            name="team1"
            value={formData.team1}
            onChange={handleChange}
            required
            placeholder="Название первой команды"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="team2">Команда 2:</label>
          <input
            type="text"
            id="team2"
            name="team2"
            value={formData.team2}
            onChange={handleChange}
            required
            placeholder="Название второй команды"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="team1_score">Счет команды 1:</label>
          <input
            type="number"
            id="team1_score"
            name="team1_score"
            value={formData.team1_score}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="team2_score">Счет команды 2:</label>
          <input
            type="number"
            id="team2_score"
            name="team2_score"
            value={formData.team2_score}
            onChange={handleChange}
            min="0"
            placeholder="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tournament">Турнир:</label>
          <input
            type="text"
            id="tournament"
            name="tournament"
            value={formData.tournament}
            onChange={handleChange}
            placeholder="Название турнира"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="game_type">Тип игры:</label>
          <select
            id="game_type"
            name="game_type"
            value={formData.game_type}
            onChange={handleChange}
          >
            <option value="">Выберите игру</option>
            <option value="CS:GO">CS:GO</option>
            <option value="Dota 2">Dota 2</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Valorant">Valorant</option>
            <option value="Overwatch">Overwatch</option>
            <option value="Rainbow Six Siege">Rainbow Six Siege</option>
            <option value="PUBG">PUBG</option>
            <option value="Fortnite">Fortnite</option>
            <option value="Rocket League">Rocket League</option>
            <option value="Другое">Другое</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="match_date">Дата матча:</label>
          <input
            type="datetime-local"
            id="match_date"
            name="match_date"
            value={formData.match_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Статус:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="upcoming">Предстоит</option>
            <option value="live">В прямом эфире</option>
            <option value="finished">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Описание:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Дополнительная информация о матче"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label htmlFor="photo">Новое фото (необязательно):</label>
        <input
          type="file"
          id="photo"
          onChange={(e) => setPhoto(e.target.files[0])}
          accept="image/*"
        />
        {match.photo && (
          <p className="current-photo">
            Текущее фото: {match.photo}
          </p>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn">
          Обновить матч
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          Отмена
        </button>
      </div>
    </form>
  );
}

export default EditMatch;
