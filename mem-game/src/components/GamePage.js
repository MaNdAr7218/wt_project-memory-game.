import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './GamePage.css';

const GamePage = () => {
  const { difficulty } = useParams();
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const cardsAvailable = [
    { name: 'fries', img: 'fries.png' },
    { name: 'cheeseburger', img: 'cheeseburger.png' },
    { name: 'ice-cream', img: 'ice-cream.png' },
    { name: 'pizza', img: 'pizza.png' },
    { name: 'milkshake', img: 'milkshake.png' },
    { name: 'hotdog', img: 'hotdog.png' },
    { name: '8-ball', img: '8-ball.png' },
    { name: 'compass', img: 'compass.png' },
    { name: 'card', img: 'card.png' },
    { name: 'domino', img: 'domino.png' },
    { name: 'hand', img: 'hand.png' },
    { name: 'leaf', img: 'leaf.png' },
    { name: 'pig', img: 'pig.png' },
    { name: 'dog', img: 'dog.png' },
    { name: 'cat', img: 'cat.png' },
    { name: 'cross', img: 'cross.png' }
  ];

  const [cardsArray, setCardsArray] = useState([]);
  const [cardsChosen, setCardsChosen] = useState([]);
  const [cardsWon, setCardsWon] = useState([]);
  const [countFails, setCountFails] = useState(0);
  const [countTime, setCountTime] = useState(180);
  const [gameStatus, setGameStatus] = useState('');
  const [gameInProgress, setGameInProgress] = useState(false);

  const initializeTimer = (initialTime) => {
    setCountTime(initialTime);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setCountTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timerRef.current);
          setGameStatus('Time up! You lost the game.');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const loadGame = useCallback(() => {
    setGameInProgress(true);
    let numberOfPairs;
    let initialTime;

    if (difficulty === 'easy') {
      numberOfPairs = 4;
      initialTime = 60;
    } else if (difficulty === 'medium') {
      numberOfPairs = 8;
      initialTime = 180;
    } else if (difficulty === 'hard') {
      numberOfPairs = 16;
      initialTime = 240;
    }

    const newCardsArray = [];
    cardsAvailable.forEach((element) => {
      if (newCardsArray.length / 2 < numberOfPairs) {
        newCardsArray.push(element);
        newCardsArray.push({ ...element }); // Clone the card
      }
    });

    newCardsArray.sort(() => 0.5 - Math.random());
    setCardsArray(newCardsArray);
    setCardsChosen([]);
    setCardsWon([]);
    setCountFails(0);
    initializeTimer(initialTime);
  }, [difficulty]);

  useEffect(() => {
    if (difficulty && gameInProgress) {
      loadGame();
    }
  }, [difficulty, gameInProgress, loadGame]);

  const saveScoreToDatabase = useCallback(async (score, timeTaken, fails) => {
    try {
      const response = await fetch(`${API_URL}/saveScore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          score,
          timeTaken,
          difficulty,
          fails
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.log('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [API_URL, difficulty]);

  useEffect(() => {
    if (cardsChosen.length === 2) {
      const [firstChoice, secondChoice] = cardsChosen;

      if (firstChoice.name === secondChoice.name) {
        setCardsWon((prevWon) => {
          const updatedWon = [...prevWon, firstChoice, secondChoice];

          if (updatedWon.length === cardsArray.length) {
            const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setGameStatus(`Congratulations! You found them all in ${timeTaken} seconds!`);
            clearInterval(timerRef.current);
            saveScoreToDatabase(updatedWon.length / 2, timeTaken, countFails);
          }
          return updatedWon;
        });
      } else {
        setCountFails((prevFails) => prevFails + 1);
      }
      setCardsChosen([]);
    }
  }, [cardsChosen, cardsWon, cardsArray, countFails, saveScoreToDatabase]);

  const flipCard = (index) => {
    if (cardsChosen.length === 2 || cardsChosen.some((card) => card.id === index)) return;

    const card = cardsArray[index];
    setCardsChosen((prevChosen) => [...prevChosen, { name: card.name, id: index }]);
  };

  return (
    <div className="game-container">
      <div className="intro-section">
        <h1>Mind Mosaics</h1>
        <p>Match pairs of cards within the time limit!</p>
      </div>
      {!gameInProgress && !gameStatus && (
        <button onClick={loadGame} className="start-button">Start Game</button>
      )}
      {gameInProgress && (
        <div className="game-info">
          <div className="score">Score: {cardsWon.length / 2}</div>
          <div className="fails">Fails: {countFails}</div>
          <div className="time">Time: {countTime}s</div>
        </div>
      )}
      {gameInProgress && (
        <div className="grid-container">
          <div className="grid">
            {cardsArray.map((card, index) => (
              <img
                key={index}
                className="card"
                src={card.flipped
                  ? `${process.env.PUBLIC_URL}/images/${card.img}`
                  : `${process.env.PUBLIC_URL}/images/white.png`}
                alt={card.flipped ? card.name : 'hidden'}
                onClick={() => flipCard(index)}
              />
            ))}
          </div>
        </div>
      )}
      {gameStatus && (
        <div className="game-status">
          <p>{gameStatus}</p>
        </div>
      )}
    </div>
  );
};

export default GamePage;
