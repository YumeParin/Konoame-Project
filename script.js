import GameZone from "./classes/GameZone.mjs";
import Bullet from "./classes/Bullet.mjs";
import Player from "./classes/Player.mjs";
import Enemy from "./classes/Enemy.mjs";
import Sidebar from "./classes/Sidebar.mjs";
document.addEventListener("DOMContentLoaded", () => {
  const playerSpriteSrc = "./assets/characters/reimu/sprite00.png";
  const gamezoneBackgroundSrc = "./assets/backgrounds/background00.png";

  // Game State
  const gameState = {
    canvas: null,
    ctx: null,
    gameZone: null,
    bullets: [],
    enemies: [],
    keys: {},
    sidebar: null,
    player: null,
    lastTime: 0,
    accumulatedTime: 0,
    fixedTimeStep: 1000 / 60, //60 FPS
    paused: false,
  };
  const status = { lost: false };
  function initialize() {
    // Canvas
    gameState.canvas = document.getElementById("gameCanvas");
    gameState.ctx = gameState.canvas.getContext("2d");
    gameState.ctx.imageSmoothingEnabled = false;

    // Create game objects
    gameState.gameZone = new GameZone(
      100,
      50,
      600,
      800,
      "rgba(25, 52, 21, 0.759)",
      gamezoneBackgroundSrc
    );

    gameState.gameZone.setBackgroundDarkness(0.5);
    gameState.player = new Player({
      x: gameState.gameZone.width / 2 + gameState.gameZone.x,
      y:
        gameState.gameZone.height -
        gameState.gameZone.height / 6 +
        gameState.gameZone.y,
      speed: 450,
      spriteSrc: playerSpriteSrc,
      cooldown: 0.05,
      life: 3,
      bomb: 3,
      hitboxSize: 8,
    });

    gameState.sidebar = new Sidebar({ gameState: gameState });
    //////////////////
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      gameState.keys[key] = true;
      if (key === "escape") {
        gameState.paused = !gameState.paused;

        if (gameState.paused) {
          toggleOptionsWindow(true);
        } else {
          toggleOptionsWindow(false);
          requestAnimationFrame(gameLoop);
        }
      }
    });
    window.addEventListener("keyup", (e) => {
      gameState.keys[e.key.toLowerCase()] = false
    });

    //Start the game loop
    requestAnimationFrame(gameLoop);

  }

  function toggleOptionsWindow(show) {
    if (show) {
      console.log("Options window displayed");
    } else {
      console.log("Options window hidden");
    }

  }

  function spawnEnemy() {
    const enemySpriteSrc = "./assets/enemy/rumia/sprite00.png";
    const x = gameState.gameZone.width / 2 + gameState.gameZone.x;
    const y = gameState.gameZone.height / 5;
    const speed = 0;
    const cooldown = 0.4;
    const hitboxSize = 100;
    const maxHp = 10000;
    const enemy = new Enemy(
      x,
      y,
      speed,
      enemySpriteSrc,
      cooldown,
      hitboxSize,
      maxHp
    );

    gameState.enemies.push(enemy);
  }
  let pausedTime = 0;

  function gameLoop(timestamp) {
    if (gameState.paused) {
      renderPauseScreen();
      pausedTime = timestamp;
      return;
    }

    if (pausedTime > 0) {
      gameState.lastTime += timestamp - pausedTime;
      pausedTime = 0;
    }

    if (status.lost) {
      console.log("GameOver");
      return;
    }
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    gameState.accumulatedTime += deltaTime;
    // Update the game at 60fps
    while (gameState.accumulatedTime >= gameState.fixedTimeStep) {

      update(gameState.fixedTimeStep / 1000); // Convert to seconds
      gameState.accumulatedTime -= gameState.fixedTimeStep;
    }
    render();
    requestAnimationFrame(gameLoop);
  }
  function renderPauseScreen() {

    const { ctx, canvas } = gameState;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Paused", canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }


  function update(deltaTime) {

    const { player, enemies, keys, gameZone, bullets, canvas } = gameState;
    bullets.forEach((bullet) => {
      bullet.update(deltaTime)

    });
    enemies.forEach((enemy) => {

      enemy.update(deltaTime, bullets, enemies, player)
    });
    player.update(deltaTime, keys, gameZone, bullets, status);
    gameState.bullets = bullets.filter((bullet) => !bullet.isOffScreen(gameZone));
  }
  function render() {
    const { ctx, enemies, canvas, gameZone, bullets, player, sidebar } =
      gameState;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    gameZone.render(ctx);
    bullets.forEach((bullet) => {

      bullet.render(ctx)
    });
    enemies.forEach((enemy) => {

      enemy.render(ctx);

      if (enemy.sprite.src.includes("rumia")) {

        enemy.renderHpBar(ctx, gameZone);
      }
    });
    player.render(ctx);

    sidebar.render(ctx);
  }

  initialize();
  spawnEnemy();

});
