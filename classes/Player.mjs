import Bullet from "./Bullet.mjs";

export default class Player {
  constructor({ x, y, speed, spriteSrc, cooldown, hitboxSize = 10, life = 3 }) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = new Image();
    this.sprite.src = spriteSrc;
    this.cooldown = cooldown;
    this.currentCooldown = 0;
    this.hitboxRadius = hitboxSize / 2;
    this.life = life;
  }
  handleMovement(keys, deltaTime) {
    const currentSpeed = keys["shift"] ? this.speed / 2.5 : this.speed;
    if (keys["arrowup"]) this.y -= currentSpeed * deltaTime;
    if (keys["arrowdown"]) this.y += currentSpeed * deltaTime;
    if (keys["arrowleft"]) this.x -= currentSpeed * deltaTime;
    if (keys["arrowright"]) this.x += currentSpeed * deltaTime;
  }
  checkBoundaries(gameZone) {
    const radius = this.hitboxRadius; // For centering hitbox
    this.x = Math.max(
      gameZone.x + radius,
      Math.min(this.x, gameZone.x + gameZone.width - radius)
    );
    this.y = Math.max(
      gameZone.y + radius,
      Math.min(this.y, gameZone.y + gameZone.height - radius)
    );
  }
  shoot({ bullets, direction = 180, speed = 2000, bulletX, bulletY }) {
    const bullet = new Bullet({
      friendly: true,
      direction: direction,
      x: this.x + bulletX,
      y: this.y + bulletY,
      speed: speed,
      damage: 20,
      spriteSrc: "./assets/characters/reimu/bullet_0.png",
      isRound: false,
    });
    bullets.push(bullet);
    this.currentCooldown = this.cooldown;
  }
  update(deltaTime, keys, gameZone, bullets, status) {

    if (this.cooldown > 0) this.currentCooldown -= deltaTime;

    this.handleMovement(keys, deltaTime);
    this.checkBoundaries(gameZone);

    this.handleCollisions(bullets, status);

    if (keys["y"] && this.currentCooldown <= 0) {
      this.shoot({ bullets: bullets, bulletX: 15, bulletY: 0 });
      this.shoot({ bullets: bullets, bulletX: 0, bulletY: -10 });
      this.shoot({ bullets: bullets, bulletX: -15, bulletY: 0 });
    }
  }
  handleCollisions(bullets, status) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (!bullet.friendly && bullet.collidesWith(this)) {
        console.log("Player Hit");
        this.life -= 1;
        bullets.splice(i, 1);
        if (this.life <= 0) {
          this.onDeath(status);
          break;
        }
      }
    }
  }
  onDeath(status) {
    console.log("Defeated Reimu");
    status.lost = true;
  }

  render(ctx) {
    ctx.drawImage(
      this.sprite,
      this.x - this.sprite.width / 2,
      this.y - this.sprite.height / 2
    );

    ctx.save();
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.hitboxRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
