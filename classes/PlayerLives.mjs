export default class PlayerLives {
  constructor({ playerLives, gameState }) {
    this.playerLives = playerLives;
    this.gameState = gameState;
    this.currentLives = this.playerLives;
    this.playerSrc = "./assets/sidebar/player.png";
    this.playerSprite = new Image();
    this.playerSprite.src = this.playerSrc;
    this.lifeSrc = "./assets/sidebar/life.png";
    this.lifeSprite = new Image();
    this.lifeSprite.src = this.lifeSrc;
  }
  update() {}
  render(ctx) {
    const { player, canvas } = this.gameState;
    ctx.drawImage(
      this.playerSprite,
      730,
      220,
      this.playerSprite.width * 2.5,
      this.playerSprite.height * 2.5
    );
    for (let i = 0; i < player.life - 1; i++) {
      ctx.drawImage(
        this.lifeSprite,
        880 + i * 35,
        220,
        this.lifeSprite.width * 2.2,
        this.lifeSprite.height * 2.2
      );
    }
  }

  reset() {
    this.currentLives = this.playerLives;
  }
}
