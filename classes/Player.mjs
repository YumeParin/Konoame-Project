import Bullet from "./Bullet.mjs";

export default class Player {
  constructor({
    x,
    y,
    speed,
    spriteSrc,
    cooldown,
    hitboxSize = 10,
    life = 3,
    bomb = 3,
  }) {
    this.position = { x, y };
    this.spawn = { x, y };
    this.speed = speed;
    this.cooldown = { shoot: cooldown, bomb: 1 };
    this.timers = { shoot: 0, bomb: 0 };
    this.hitboxRadius = hitboxSize / 2;
    this.stats = { life, bomb };

    this.sprite = this.loadSprite(spriteSrc);
  }

  loadSprite(src) {
    const img = new Image();
    img.src = src;
    return img;
  }
  update(deltaTime, keys, gameZone, bullets, status) {
    this.updateTimers(deltaTime);
    this.handleMovement(keys, deltaTime);
    this.enforceBoundaries(gameZone);
    this.handleCollisions(bullets, status);
    this.handleActions(keys, bullets);
  }

  updateTimers(deltaTime) {
    Object.keys(this.timers).forEach((key) => {
      if (this.timers[key] > 0) this.timers[key] -= deltaTime;
    });
  }
  handleMovement(keys, deltaTime) {
    const currentSpeed = keys["shift"] ? this.speed / 2.5 : this.speed;
    if (keys["arrowup"]) this.position.y -= currentSpeed * deltaTime;
    if (keys["arrowdown"]) this.position.y += currentSpeed * deltaTime;
    if (keys["arrowleft"]) this.position.x -= currentSpeed * deltaTime;
    if (keys["arrowright"]) this.position.x += currentSpeed * deltaTime;
  }

  enforceBoundaries(gameZone) {
    const radius = this.hitboxRadius; // For centering hitbox
    this.position.x = Math.max(
      gameZone.x + radius,
      Math.min(this.position.x, gameZone.x + gameZone.width - radius)
    );
    this.position.y = Math.max(
      gameZone.y + radius,
      Math.min(this.position.y, gameZone.y + gameZone.height - radius)
    );
  }

  handleActions(keys, bullets) {
    if (keys["y"] && this.timers.shoot <= 0) {
      this.shootBullets(bullets);
      this.timers.shoot = this.cooldown.shoot;
    }
    if (keys["x"] && this.timers.bomb <= 0 && this.stats.bomb > 0) {
      this.useBomb(bullets);
    }
  }

  shootBullets(bullets) {
    const bulletOffsets = [
      { x: 20, y: 0 },
      { x: 7, y: -10 },
      { x: -7, y: -10 },
      { x: -20, y: 0 },
    ];
    bulletOffsets.forEach((offset) => {
      bullets.push(
        new Bullet({
          friendly: true,
          direction: 180,
          x: this.position.x + offset.x,
          y: this.position.y + offset.y,
          speed: 2000,
          damage: 10,
          spriteSrc: "./assets/characters/reimu/bullet_0.png",
        })
      );
    });
  }
  useBomb(bullets) {
    bullets.length = 0;
    this.stats.bomb--;
    this.timers.bomb = this.cooldown.bomb;
    console.log("Bomb used");
  }

  handleCollisions(bullets, status) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];

      if (!bullet.friendly && bullet.collidesWith(this)) {
        this.onHit(status);
        // bullets.splice(i, 1);
        bullets.length = 0;
        break;
      }
    }
  }

  onHit(status) {
    console.log("Player hit");
    this.stats.life--;
    if (this.stats.life <= 0) this.onDeath(status);
    this.position = { ...this.spawn };
  }

  onDeath(status) {
    console.log("Defeated Reimu");
    status.lost = true;
  }

  render(ctx) {
    // console.log(this.sprite);
    ctx.drawImage(
      this.sprite,
      this.position.x - this.sprite.width / 2,
      this.position.y - this.sprite.height / 2
    );

    ctx.save();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      this.hitboxRadius,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
