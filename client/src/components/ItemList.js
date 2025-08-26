import React from 'react';

function ItemList({ items, onDelete, onEdit }) {
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

  return (
    <div className="item-list">
      <h2>Каталог элементов</h2>
      {items.length === 0 && <p className="no-items">Нет доступных фитингов</p>}
      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-card">
            {item.photo && (
              <img
                src={`http://localhost:5000/uploads/${item.photo}`}
                alt={item.title}
                className="item-image"
              />
            )}
            <div className="item-content">
              <h3>{item.title}</h3>
              <div className="item-dates">
                {item.created_at && (
                  <div className="date-info">
                    <span className="date-label">Создано:</span> 
                    <span className="date-value">{formatDate(item.created_at)}</span>
                  </div>
                )}
                {item.updated_at && item.updated_at !== item.created_at && (
                  <div className="date-info">
                    <span className="date-label">Обновлено:</span> 
                    <span className="date-value">{formatDate(item.updated_at)}</span>
                  </div>
                )}
              </div>
              <p>{item.description}</p>
              {onDelete && onEdit && (
                <div className="item-actions">
                  <button onClick={() => onEdit(item)} className="edit-btn">
                    Редактировать
                  </button>
                  <button onClick={() => onDelete(item.id)} className="delete-btn">
                    Удалить
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemList; 