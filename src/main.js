import { Application, Graphics, Sprite, Assets } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({
    background: 0x000000,
    resizeTo: window,
  });

  document.getElementById("pixi-container").appendChild(app.canvas);

  // === Load and Add Background Image ===
  const bgTexture = await Assets.load("/assets/black.jpg");
  const background = new Sprite(bgTexture);
  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // === Game Constants ===
  const paddleWidth = 20;
  const paddleHeight = 100;
  const ballRadius = 15;
  let score = 0;
  let vx = 5;
  let vy = 3;
  let isGameOver = false;
  const hitSound = new Audio("assets/hit.wav");

  // === UI Elements ===
  const scoreDiv = document.createElement("div");
  scoreDiv.id = "score";
  scoreDiv.style.cssText = `
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-family: sans-serif;
    font-size: 24px;
    z-index: 10;
  `;
  scoreDiv.innerText = `Score: 0`;
  document.body.appendChild(scoreDiv);

  const popup = document.getElementById("game-over");
  const finalScore = document.getElementById("final-score");
  const restartBtn = document.getElementById("restart-btn");

  // === Player Paddle ===
  const player = new Graphics()
    .beginFill(0xffffff)
    .drawRect(0, 0, paddleWidth, paddleHeight)
    .endFill();
  player.x = app.screen.width - paddleWidth - 10;
  player.y = app.screen.height / 2 - paddleHeight / 2;
  app.stage.addChild(player);

  // === AI Paddle ===
  const ai = new Graphics()
    .beginFill(0xffffff)
    .drawRect(0, 0, paddleWidth, paddleHeight)
    .endFill();
  ai.x = 10;
  ai.y = app.screen.height / 2 - paddleHeight / 2;
  app.stage.addChild(ai);

  // === Ball (Sprite) ===
  const ballTexture = await Assets.load("/assets/yoga-ball_6234119.png");
  const ball = new Sprite(ballTexture);
  ball.anchor.set(0.5);
  ball.width = ball.height = ballRadius * 2;
  ball.x = app.screen.width / 2;
  ball.y = app.screen.height / 2;
  app.stage.addChild(ball);

  // === Hit Effect (Red Flash) ===
  function playHitEffect(ball) {
    const originalTint = ball.tint;
    ball.tint = 0xff0000;
    setTimeout(() => {
      ball.tint = originalTint;
    }, 150);
  }

  // === Paddle Control (Touch / Mouse) ===
  const updatePlayerY = (y) => {
    player.y = Math.min(
      Math.max(0, y - paddleHeight / 2),
      app.screen.height - paddleHeight
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

  // === Restart Button ===
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

  // === Game Loop ===
  app.ticker.add(() => {
    if (isGameOver) return;

    // Move ball
    ball.x += vx;
    ball.y += vy;

    // Bounce off top/bottom
    if (ball.y - ballRadius < 0 || ball.y + ballRadius > app.screen.height) {
      vy *= -1;
    }

    // AI Paddle follows ball
    ai.y += (ball.y - paddleHeight / 2 - ai.y) * 0.08;

    // Player collision
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

    // AI collision
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

    // Game over
    if (ball.x > app.screen.width) {
      isGameOver = true;
      finalScore.innerText = `Game Over! Your score: ${score}`;
      popup.style.display = "block";
    }

    // If AI misses, just reset
    if (ball.x < 0) {
      resetGame();
    }
  });

  // Responsive background resize
  window.addEventListener("resize", () => {
    background.width = app.screen.width;
    background.height = app.screen.height;
  });
})();
