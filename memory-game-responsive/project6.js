document.addEventListener("DOMContentLoaded", () => {
  const gameGrid      = document.getElementById("game-grid");
  const moveCounter   = document.getElementById("move-counter");
  const timer         = document.getElementById("timer");
  const startButton   = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");

  const cards = [
    "🍎", "🍎", "🍌", "🍌", "🍇", "🍇", "🍓", "🍓",
    "🍒", "🍒", "🍍", "🍍", "🥝", "🥝", "🍉", "🍉"
  ];

  const fruitDanceMap = {
    "🍎": "pivot-dance",
    "🍌": "bounce-dance",
    "🍇": "top-pivot-dance",
    "🍓": "surprise-dance",
    "🍒": "swing-dance",
    "🍍": "jitter-dance",
    "🥝": "spin-dance",
    "🍉": "float-dance"
  };

  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let gameTimer = null;
  let secondsElapsed = 0;
  let gameStarted = false;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const fruitBorderContainer = document.createElement("div");
  fruitBorderContainer.classList.add("fruit-border");
  document.body.appendChild(fruitBorderContainer);

  const fruitOptions = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥝", "🍉"];
  const fruitSize    = 40;

  function createFruit(x, y) {
    const fruitItem = document.createElement("div");
    fruitItem.classList.add("fruit-item");
    fruitItem.textContent = fruitOptions[Math.floor(Math.random() * fruitOptions.length)];
    fruitItem.style.position = "absolute";
    fruitItem.style.left = `${x}px`;
    fruitItem.style.top  = `${y}px`;
    // Some random dance
    const animations = ["rotateDance","bounceDance","wiggleDance"];
    fruitItem.style.animation = `${animations[Math.floor(Math.random() * animations.length)]} 3s infinite`;
    fruitBorderContainer.appendChild(fruitItem);
  }

  function generateFruitBorder() {
    fruitBorderContainer.innerHTML = "";
    const screenWidth  = window.innerWidth;
    const screenHeight = window.innerHeight;
    const borderPadding = fruitSize * 1.5; // Some margin

    // Top & Bottom rows
    for (let x = borderPadding; x < screenWidth - borderPadding; x += fruitSize) {
      createFruit(x, borderPadding - fruitSize); 
      createFruit(x, screenHeight - borderPadding);
    }
    // Left & Right columns
    for (let y = borderPadding; y < screenHeight - borderPadding; y += fruitSize) {
      createFruit(borderPadding - fruitSize, y);
      createFruit(screenWidth - borderPadding, y);
    }
  }
  generateFruitBorder();
  window.addEventListener("resize", generateFruitBorder);

  function initializeGame() {
    flippedCards = [];
    matchedPairs = 0;
    moves        = 0;
    secondsElapsed = 0;
    moveCounter.textContent = moves;
    timer.textContent       = "0:00";
    clearInterval(gameTimer);
    gameGrid.innerHTML = "";
    gameStarted = true;

    restartButton.disabled = false;
    startButton.disabled   = true;

    shuffle(cards).forEach(symbol => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-front");

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-back");

      const fruitSpan = document.createElement("span");
      fruitSpan.textContent = symbol;
      if (fruitDanceMap[symbol]) {
        fruitSpan.classList.add(fruitDanceMap[symbol]);
      }
      cardBack.appendChild(fruitSpan);

      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      cardElement.appendChild(cardInner);

      cardElement.addEventListener("click", flipCard);
      gameGrid.appendChild(cardElement);
    });

    startTimer();
    generateFruitBorder(); // Start the timer only when game starts
  }

  function startTimer() {
    clearInterval(gameTimer); // Ensure no duplicate timers
    secondsElapsed = 0;
    gameTimer = setInterval(() => {
      secondsElapsed++;
      const minutes = Math.floor(secondsElapsed / 60);
      const seconds = secondsElapsed % 60;
      timer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  function flipCard() {
    if (!gameStarted || flippedCards.length === 2) return;
    if (this.classList.contains("flip")) return;

    this.classList.add("flip");
    flippedCards.push(this);

    if (flippedCards.length === 2) {
      moves++;
      moveCounter.textContent = moves;
      checkForMatch();
    }
  }

  function checkForMatch() {
    const [card1, card2] = flippedCards;
    const fruit1 = card1.querySelector(".card-back span").textContent;
    const fruit2 = card2.querySelector(".card-back span").textContent;

    if (fruit1 === fruit2) {
      card1.classList.add("match");
      card2.classList.add("match");
      matchedPairs++;
      flippedCards = [];

      if (matchedPairs === cards.length / 2) {
        clearInterval(gameTimer);
        setTimeout(() => {
          triggerConfetti(); // 🎊 Trigger confetti animation!
          alert(`Congratulations! You completed the game in ${moves} moves and ${timer.textContent}.`);
        }, 500);
      }
    } else {
      setTimeout(() => {
        card1.classList.remove("flip");
        card2.classList.remove("flip");
        flippedCards = [];
      }, 1000);
    }
  }

  function triggerConfetti() {
    const confettiContainer = document.createElement("div");
    confettiContainer.classList.add("confetti-container");
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");

      // Randomize positions
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.animationDelay = `${Math.random()}s`;
      confettiContainer.appendChild(confetti);
    }

    // Remove confetti after it reaches the bottom
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  }

  startButton.addEventListener("click", initializeGame);
  restartButton.addEventListener("click", initializeGame);
});