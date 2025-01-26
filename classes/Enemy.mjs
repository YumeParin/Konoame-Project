import Bullet from "./Bullet.mjs";

export default class Enemy {
  constructor({
    x,
    y,
    speed,
    spriteSrc,
    cooldown = 2,
    hitboxSize = 20,
    maxHp = 10000,
  }) {
    this.position = { x, y };
    this.speed = speed;
    this.cooldown = cooldown;
    this.timers = this.initializeTimers();

    this.hp = maxHp;
    this.maxHp = maxHp;
    this.hitboxRadius = hitboxSize / 2;

    this.sprite = this.loadSprite(spriteSrc);
    this.width = hitboxSize;
    this.height = hitboxSize;

    this.bulletColors = this.initializeBulletColors();
  }

  initializeTimers() {
    return {
      cooldowns: {
        spiralGreen: 0.6,
        spiralRed: 0.4,
        spiralCyan: 2.5,
        spiralMagenta: 0.05,
        spiralYellow: 0.3,
      },
      currentCooldowns: {
        spiralGreen: 0,
        spiralCyan: 0,
        spiralMagenta: 0,
        spiralRed: 0,
        spiralYellow: 0,
      },
      wave: {
        right: { timer: 0, index: 0 },
        left: { timer: 0, index: 0 },
      },
    };
  }

  initializeBulletColors() {
    return {
      red: "./assets/enemy/rumia/bullet04.png",
      magenta: "./assets/enemy/rumia/bullet03.png",
      green: "./assets/enemy/rumia/bullet00.png",
      cyan: "./assets/enemy/rumia/bullet02.png",
      yellow: "./assets/enemy/rumia/bullet01.png",
    };
  }

  loadSprite(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.width = img.width * 2;
      this.height = img.height * 2;
    };
    return img;
  }

  update(deltaTime, bullets, enemies, player) {
    this.reduceCooldowns(deltaTime);
    this.position.y += this.speed * deltaTime;
    this.shootPatterns(deltaTime, bullets, player);
    this.handleCollisions(bullets, enemies);
  }

  reduceCooldowns(deltaTime) {
    for (const key in this.timers.currentCooldowns) {
      if (this.timers.currentCooldowns[key] > 0) {
        this.timers.currentCooldowns[key] -= deltaTime;
      }
    }

    for (const wave in this.timers.wave) {
      if (this.timers.wave[wave].timer > 0) {
        this.timers.wave[wave].timer -= deltaTime;
      }
    }
  }

  shootPatterns(deltaTime, bullets, player) {
    const { spiralRed, spiralYellow, spiralGreen, spiralMagenta, spiralCyan } =
      this.timers.currentCooldowns;
    if (spiralRed <= 0) {
      const angleOffset = (performance.now() / 25) % 360;
      this.shootSpiral(bullets, 20, 150, true, "red", angleOffset);
      this.timers.currentCooldowns.spiralRed = this.timers.cooldowns.spiralRed;
    }
    if (spiralYellow <= 0) {
      const angleOffset = (performance.now() / 25) % 360;
      this.shootSpiral(bullets, 10, 250, true, "yellow", angleOffset);
      this.timers.currentCooldowns.spiralYellow =
        this.timers.cooldowns.spiralYellow;
    }
    if (spiralGreen <= 0) {
      const angleOffset = (performance.now() / 25) % 360;
      this.shootSpiral(bullets, 50, 100, true, "green", angleOffset);
      this.timers.currentCooldowns.spiralGreen =
        this.timers.cooldowns.spiralGreen;
    }
    if (spiralMagenta <= 0) {
      const angleOffset = (performance.now() / 5) % 360;
      this.shootSpiral(bullets, 1, 175, false, "magenta", angleOffset);
      this.shootSpiral(bullets, 1, 175, true, "magenta", angleOffset);
      this.timers.currentCooldowns.spiralMagenta =
        this.timers.cooldowns.spiralMagenta;
    }

    if (spiralCyan <= 0) {
      this.shootWave(
        bullets,
        3,
        0.25,
        250,
        player,
        deltaTime,
        this.bulletColors.cyan,
        "left",
        this.position.x - 100
      );
      this.shootWave(
        bullets,
        3,
        0.25,
        250,
        player,
        deltaTime,
        this.bulletColors.cyan,
        "right",
        this.position.x + 100
      );
    }
  }

  shootSpiral(bullets, bulletCount, speed, clockwise, colorKey, angleOffset) {
    const bulletColor = this.bulletColors[colorKey];
    const angleStep = 360 / bulletCount;
    for (let i = 0; i < bulletCount; i++) {
      const angle = clockwise
        ? i * angleStep + angleOffset
        : 360 - (i * angleStep + angleOffset);

      bullets.push(
        new Bullet({
          friendly: false,
          direction: angle,
          x: this.position.x,
          y: this.position.y,
          speed,
          spriteSrc: bulletColor,
          isRound: true,
          width: 25,
          height: 25,
        })
      );
    }
  }

  shootWave(
    bullets,
    bulletCount,
    spread,
    speed,
    player,
    deltaTime,
    bulletSpriteSrc,
    waveId,
    startX = this.position.x,
    startY = this.position.y
  ) {
    if (!this.timers.wave[waveId]) {
      console.error(`Invalid waveId: ${waveId}`);
      return;
    }
    const { x, y } = player.position;
    const dx = x - startX;
    const dy = y - startY;
    const angleToPlayer = Math.atan2(dy, -dx) * (180 / Math.PI);
    // console.log(this.timers.wave[waveId].index < bulletCount);
    // console.log(bulletCount);

    if (
      this.timers.wave[waveId].timer <= 0 &&
      this.timers.wave[waveId].index < bulletCount
    ) {
      bullets.push(
        new Bullet({
          friendly: false,
          direction: angleToPlayer - 90,
          x: startX,
          y: startY,
          speed: speed,
          spriteSrc: bulletSpriteSrc,
          isRound: true,
          width: 30,
          height: 30,
        })
      );
      this.timers.wave[waveId].index++; //index = 1

      this.timers.wave[waveId].timer = spread; //spread = 0.25
      // rentre 1 fois
    }

    if (this.timers.wave[waveId].index >= bulletCount) {
      this.timers.wave[waveId].index = 0;
      this.timers.wave[waveId].timer = 0;
      this.timers.currentCooldowns.spiralCyan =
        this.timers.cooldowns.spiralCyan;
      //rentre 0 fois
    }

    //rentre fréquement
  }

  handleCollisions(bullets, enemies) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (bullet.friendly && bullet.collidesWith(this)) {
        this.hp -= bullet.damage;
        bullets.splice(i, 1);
        if (this.hp <= 0) {
          this.onDeath(enemies);
          break;
        }
      }
    }
  }

  onDeath(enemies) {
    console.log("Rumia defeated !");
    const index = enemies.indexOf(this);
    if (index > -1) enemies.splice(index, 1);
  }

  render(ctx) {
    ctx.drawImage(
      this.sprite,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    );
    // //Debug
    // ctx.save();
    // ctx.strokeStyle = "yellow";
    // ctx.lineWidth = 2;
    // ctx.strokeRect(
    //     this.x - this.width / 2,
    //     this.y - this.height / 2,
    //     this.width,
    //     this.height
    // );
    // ctx.restore();
  }

  getBounds() {
    return {
      left: this.position.x - this.width / 2,
      right: this.position.x + this.width / 2,
      top: this.position.y - this.height / 2,
      bottom: this.position.y + this.height / 2,
    };
  }

  renderHpBar(ctx, gameZone) {
    const barWidth = gameZone.width * 0.8;
    const barHeight = 10;
    const barX = gameZone.x + (gameZone.width - barWidth) / 2;
    const barY = gameZone.y + barHeight - 5;

    const hpRatio = this.hp / this.maxHp; //give like 0.8 if it has 80% of hp

    // Background bar
    ctx.fillStyle = "gray";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    // current HP bar
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
    // Border around the bar
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
}
