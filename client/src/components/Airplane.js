import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Airplane.css';

const Airplane = () => {
  const airplaneRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Путь к PNG изображению самолёта
  const airplaneImageUrl = '/airplane.png';

  const handleClick = useCallback(() => {
    if (isClicked) return;
    
    console.log('✈️ Самолёт кликнут!');
    setIsClicked(true);
    
    if (isLoaded) {
      animateAirplane();
    }
  }, [isClicked, isLoaded]);

  useEffect(() => {
    console.log('✈️ Компонент Airplane загружен');
    setIsLoaded(true);
    
    // Обработчик клавиш для запуска самолёта
    const handleKeyPress = (event) => {
      // Запуск по нажатию клавиши 'A' или 'а'
      if (event.key.toLowerCase() === 'a') {
        console.log('✈️ Запуск самолёта по команде клавиши A');
        if (!isClicked && isLoaded) {
          handleClick();
        }
      }
      // Запуск по нажатию клавиши 'Space' (пробел)
      if (event.key === ' ') {
        console.log('✈️ Запуск самолёта по команде пробела');
        if (!isClicked && isLoaded) {
          handleClick();
        }
      }
    };
    
    // Добавляем слушатель событий
    document.addEventListener('keydown', handleKeyPress);
    
    // Очистка при размонтировании компонента
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isClicked, isLoaded, handleClick]);

  // Отдельный useEffect для глобальной функции
  useEffect(() => {
    // Делаем функцию запуска доступной глобально для консоли
    window.launchAirplane = () => {
      console.log('✈️ Запуск самолёта из консоли');
      if (!isClicked && isLoaded) {
        handleClick();
      }
    };
    
    // Функция для сброса анимации
    window.resetAirplane = () => {
      console.log('✈️ Сброс анимации самолёта');
      const airplane = airplaneRef.current;
      if (airplane) {
        airplane.style.transition = 'none';
        airplane.style.transform = 'none';
        airplane.style.position = '';
        airplane.style.left = '';
        airplane.style.top = '';
        airplane.style.zIndex = '';
        airplane.style.width = '';
        airplane.style.height = '';
        setIsAnimating(false);
        setIsClicked(false);
      }
    };
    
    console.log('🚀 Функции launchAirplane() и resetAirplane() доступны в консоли');
    
    // Очистка при размонтировании компонента
    return () => {
      delete window.launchAirplane;
      delete window.resetAirplane;
    };
  }, [isClicked, isLoaded, handleClick]);

  const animateAirplane = () => {
    if (!airplaneRef.current) return;
    
    console.log('✈️ Запуск анимации самолёта');
    const airplane = airplaneRef.current;
    
    setIsAnimating(true);
    
    // Получаем размеры экрана
    const screenWidth = window.innerWidth;
    
    // Получаем размеры самолёта
    const rect = airplane.getBoundingClientRect();
    
    // Начальная позиция (по центру внизу экрана)
    const centerX = Math.max(0, (screenWidth / 2) - (rect.width / 2));
    const startY = Math.max(0, window.innerHeight - rect.height - 20); // 20px от низа экрана
    
    // Конечная позиция (по центру вверху экрана)
    const endY = -rect.height;
    
    // Устанавливаем начальную позицию
    airplane.style.position = 'fixed';
    airplane.style.left = `${centerX}px`;
    airplane.style.top = `${startY}px`;
    airplane.style.zIndex = '1000';
    airplane.style.display = 'block';
    airplane.style.width = `${rect.width}px`;
    airplane.style.height = `${rect.height}px`;
    airplane.style.transition = 'none';
    airplane.style.transform = 'none';
    
    // Принудительная перерисовка
    void airplane.offsetHeight;
    
    // Начинаем анимацию
    setTimeout(() => {
      airplane.style.transition = 'all 2s ease-out';
      airplane.style.left = `${centerX}px`;
      airplane.style.top = `${endY}px`;
    }, 50);
    
    // Анимация скролла страницы вверх
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 1000);
    
    // Завершение анимации
    setTimeout(() => {
      setIsAnimating(false);
      setIsClicked(false);
      
      // Автоматический сброс анимации
      setTimeout(() => {
        if (window.resetAirplane) {
          window.resetAirplane();
        }
      }, 1000);
    }, 2000);
  };

  const handleMouseOver = () => {
    if (!isClicked) {
      setIsAnimating(true);
    }
  };

  const handleMouseOut = () => {
    if (!isClicked) {
      setIsAnimating(false);
    }
  };

  return (
    <div className="footer-airplane">
      <div 
        ref={airplaneRef}
        id="airplane" 
        className={`airplane ${isAnimating ? 'airplane-animating' : ''}`}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={handleClick}
        style={{
          backgroundImage: `url(${airplaneImageUrl})`,
          backgroundPosition: 'center center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};

export default Airplane;
