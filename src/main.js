import { Application, Graphics, Sprite, Assets } from "pixi.js";

(async () => {
  const loadingScreen = document.getElementById("loading-screen");
  const startScreen = document.getElementById("start-screen");
  const startBtn = document.getElementById("start-btn");

  const app = new Application();
  await app.init({
    background: 0x000000,
    resizeTo: window,
  });

  document.getElementById("pixi-container").appendChild(app.canvas);

  // === Load Assets ===
  const [bgTexture, ballTexture] = await Promise.all([
    Assets.load("/assets/black.jpg"),
    Assets.load("/assets/yoga-ball_6234119.png"),
  ]);
  const hitSound = new Audio("assets/hit.wav");

  // === Create Background ===
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // === Game Constants ===
  const paddleWidth = 20;
  const paddleHeight = 100;
  const ballRadius = 15;
  let vx = 5;
  let vy = 3;
  let score = 0;
  let isGameOver = false;

  // === UI Elements ===
  const scoreDiv = document.createElement("div");
  scoreDiv.id = "score";
  scoreDiv.innerText = `Score: 0`;
  document.body.appendChild(scoreDiv);

  const popup = document.getElementById("game-over");
  const finalScore = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");

  // === Game Objects ===
  const player = new Graphics()
    .beginFill(0xffffff)
    .drawRect(0, 0, paddleWidth, paddleHeight)
    .endFill();
  player.x = app.screen.width - paddleWidth - 10;
  player.y = app.screen.height / 2 - paddleHeight / 2;
  app.stage.addChild(player);

  const ai = new Graphics()
    .beginFill(0xffffff)
    .drawRect(0, 0, paddleWidth, paddleHeight)
    .endFill();
  ai.x = 10;
  ai.y = app.screen.height / 2 - paddleHeight / 2;
  app.stage.addChild(ai);

  const ball = new Sprite(ballTexture);
  ball.anchor.set(0.5);
  ball.width = ball.height = ballRadius * 2;
  ball.x = app.screen.width / 2;
  ball.y = app.screen.height / 2;
  app.stage.addChild(ball);

  // === Effects ===
  function playHitEffect(ball) {
    const originalTint = ball.tint;
    ball.tint = 0xff0000;
    setTimeout(() => {
      ball.tint = originalTint;
    }, 150);
  }

  // === Control ===
  const updatePlayerY = (y) => {
    player.y = Math.min(
      Math.max(0, y - paddleHeight / 2),
      app.screen.height - paddleHeight,
    );
  };

  window.addEventListener("mousemove", (e) => {
    const bounds = app.canvas.getBoundingClientRect();
    updatePlayerY(e.clientY - bounds.top);
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const bounds = app.canvas.getBoundingClientRect();
      updatePlayerY(e.touches[0].clientY - bounds.top);
    }
  });

  // === Restart ===
  restartBtn.addEventListener("click", () => {
    popup.style.display = "none";
    resetGame();
  });

  function resetGame() {
    score = 0;
    vx = 5 * (Math.random() > 0.5 ? 1 : -1);
    vy = 3 * (Math.random() > 0.5 ? 1 : -1);
    ball.x = app.screen.width / 2;
    ball.y = app.screen.height / 2;
    isGameOver = false;
    scoreDiv.innerText = `Score: ${score}`;
  }

  function gameLoop() {
    if (isGameOver) return;

    ball.x += vx;
    ball.y += vy;

    if (ball.y - ballRadius < 0 || ball.y + ballRadius > app.screen.height)
      vy *= -1;

    ai.y += (ball.y - paddleHeight / 2 - ai.y) * 0.08;

    if (
      ball.x + ballRadius > player.x &&
      ball.y > player.y &&
      ball.y < player.y + paddleHeight
    ) {
      vx *= -1;
      ball.x = player.x - ballRadius;
      score++;
      scoreDiv.innerText = `Score: ${score}`;
      hitSound.currentTime = 0;
      hitSound.play();
      playHitEffect(ball);
    }

    if (
      ball.x - ballRadius < ai.x + paddleWidth &&
      ball.y > ai.y &&
      ball.y < ai.y + paddleHeight
    ) {
      vx *= -1;
      ball.x = ai.x + paddleWidth + ballRadius;
      hitSound.currentTime = 0;
      hitSound.play();
      playHitEffect(ball);
    }

    if (ball.x > app.screen.width) {
      isGameOver = true;
      finalScore.innerText = `Game Over! Your score: ${score}`;
      popup.style.display = "block";
    }

    if (ball.x < 0) resetGame();
  }

  // === Responsive Background Resize ===
  window.addEventListener("resize", () => {
    background.width = app.screen.width;
    background.height = app.screen.height;
  });

  // === Start Button ===
  loadingScreen.style.display = "none";
  startScreen.style.display = "flex";

  startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    resetGame();
    app.ticker.add(gameLoop);
  });
})();
