import FPSCounter from "./FPSCounter.mjs";
import PlayerLives from "./PlayerLives.mjs";
export default class Sidebar {
  constructor({ gameState }) {
    this.gameState = gameState;
    this.sidebarState = {
      playerLives: new PlayerLives({
        playerLives: this.gameState.player.life,
        gameState: this.gameState,
      }),

    };
    this.bg = new Image();
    this.bg.src = "./assets/sidebar/background.png";
  }
  update() { }
  render(ctx) {
    const { playerLives } = this.sidebarState;
    for (let i = 0; i < this.gameState.canvas.width; i += this.gameState.gameZone.y) {
      ctx.drawImage(this.bg, i, 0, this.gameState.gameZone.y, this.gameState.gameZone.y);
    }
    for (let i = 0; i < this.gameState.canvas.width; i += this.gameState.gameZone.y) {
      ctx.drawImage(this.bg, i, this.gameState.canvas.height - this.gameState.gameZone.y, this.gameState.gameZone.y, this.gameState.gameZone.y);
    }
    for (let i = 0; i < this.gameState.gameZone.x; i += this.gameState.gameZone.y) {
      for (let j = this.gameState.gameZone.y; j < this.gameState.canvas.height - this.gameState.gameZone.y; j += this.gameState.gameZone.y) {
        ctx.drawImage(this.bg, i, j, this.gameState.gameZone.y, this.gameState.gameZone.y);
      }
    }
    for (let i = this.gameState.gameZone.x + this.gameState.gameZone.width; i < this.gameState.canvas.width; i += this.gameState.gameZone.x / 2) {
      for (let j = this.gameState.gameZone.y; j < this.gameState.canvas.height - this.gameState.gameZone.y; j += this.gameState.gameZone.y) {
        ctx.drawImage(this.bg, i, j, this.gameState.gameZone.y, this.gameState.gameZone.y);
      }
    }
    playerLives.render(ctx);







  }

  reset() { }
}
