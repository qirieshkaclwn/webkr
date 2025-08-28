import React from 'react';

function MatchList({ matches, onDelete, onEdit }) {
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Функция для определения статуса матча
  const getMatchStatus = (status) => {
    switch (status) {
      case 'upcoming':
        return { text: 'Предстоит', className: 'status-upcoming' };
      case 'live':
        return { text: 'В прямом эфире', className: 'status-live' };
      case 'finished':
        return { text: 'Завершен', className: 'status-finished' };
      case 'cancelled':
        return { text: 'Отменен', className: 'status-cancelled' };
      default:
        return { text: 'Неизвестно', className: 'status-unknown' };
    }
  };

  // Функция для определения победителя
  const getWinner = (match) => {
    if (match.status !== 'finished') return null;
    
    if (match.team1_score > match.team2_score) {
      return 'team1';
    } else if (match.team2_score > match.team1_score) {
      return 'team2';
    } else {
      return 'draw';
    }
  };

  return (
    <div className="match-list">
      <h2>Результаты матчей</h2>
      {matches.length === 0 && <p className="no-matches">Нет доступных матчей</p>}
      <div className="matches-grid">
        {matches.map((match) => {
          const status = getMatchStatus(match.status);
          const winner = getWinner(match);
          
          return (
            <div key={match.id} className={`match-card ${winner ? `winner-${winner}` : ''}`}>
              {match.photo && (
                <img
                  src={`http://localhost:5000/uploads/${match.photo}`}
                  alt={`${match.team1} vs ${match.team2}`}
                  className="match-image"
                />
              )}
              <div className="match-content">
                <div className="match-header">
                  <h3>{match.tournament || 'Турнир'}</h3>
                  <span className={`match-status ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                
                <div className="match-teams">
                  <div className={`team team1 ${winner === 'team1' ? 'winner' : ''}`}>
                    <span className="team-name">{match.team1}</span>
                    <span className="team-score">{match.team1_score}</span>
                  </div>
                  <div className="vs-separator">VS</div>
                  <div className={`team team2 ${winner === 'team2' ? 'winner' : ''}`}>
                    <span className="team-score">{match.team2_score}</span>
                    <span className="team-name">{match.team2}</span>
                  </div>
                </div>
                
                <div className="match-info">
                  <div className="game-type">
                    <span className="label">Игра:</span>
                    <span className="value">{match.game_type || 'Не указано'}</span>
                  </div>
                  <div className="match-date">
                    <span className="label">Дата:</span>
                    <span className="value">{formatDate(match.match_date)}</span>
                  </div>
                  {match.description && (
                    <p className="match-description">{match.description}</p>
                  )}
                </div>
                
                {onDelete && onEdit && (
                  <div className="match-actions">
                    <button onClick={() => onEdit(match)} className="edit-btn">
                      Редактировать
                    </button>
                    <button onClick={() => onDelete(match.id)} className="delete-btn">
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MatchList;
