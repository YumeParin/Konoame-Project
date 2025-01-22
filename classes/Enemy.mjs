
import Bullet from "./Bullet.mjs";
export default class Enemy {
    constructor(x, y, speed, spriteSrc, cooldown = 2, hitboxSize = 20, maxHp = 10000) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.sprite = new Image();
        this.sprite.src = spriteSrc;
        this.cooldown = cooldown;
        this.hitboxSize = hitboxSize;
        this.currentCooldown = 0;

        this.hp = maxHp;
        this.maxHp = maxHp;

        this.width = hitboxSize;
        this.height = hitboxSize;

        this.waveTimer = 0;
        this.waveIndex = 0;

        this.currentCooldowns = {
            spiralGreen: 0,
            spiralCyan: 0,
            spiralMagenta: 0,
            spiralRed: 0,
            spiralYellow: 0,
        };
        this.cooldowns = {
            spiralGreen: 0.6,
            spiralRed: 0.4,
            spiralCyan: 1,
            spiralMagenta: 0.05,
            spiralYellow: 0.3,
        }


        this.sprite.onload = () => {
            this.width = this.sprite.width * 2;
            this.height = this.sprite.height * 2;
        }
        this.bulletColors = {
            red: "./assets/enemy/rumia/bullet04.png",
            magenta: "./assets/enemy/rumia/bullet03.png",
            green: "./assets/enemy/rumia/bullet00.png",
            cyan: "./assets/enemy/rumia/bullet02.png",
            yellow: "./assets/enemy/rumia/bullet01.png"
        }
    }

    update(deltaTime, bullets, enemies, player) {
        for (const key in this.currentCooldowns) {
            if (this.currentCooldowns[key] > 0) {
                this.currentCooldowns[key] -= deltaTime;
            }
        }

        this.y += this.speed * deltaTime;

        if (this.currentCooldowns.spiralRed <= 0) {
            const time = (performance.now() / 25) % 360;
            const numOfBullets = 20;
            this.shootSpiral(bullets, numOfBullets, time, 150, true, this.bulletColors.red);
            this.currentCooldowns.spiralRed = this.cooldowns.spiralRed;
        }
        if (this.currentCooldowns.spiralYellow <= 0) {
            const time = (performance.now() / 50) % 360;
            const numOfBullets = 10;
            this.shootSpiral(bullets, numOfBullets, time, 250, false, this.bulletColors.yellow);
            this.currentCooldowns.spiralYellow = this.cooldowns.spiralYellow;
        }
        if (this.currentCooldowns.spiralGreen <= 0) {
            const time = (performance.now() / 50) % 360;
            const numOfBullets = 50;
            this.shootSpiral(bullets, numOfBullets, time, 100, false, this.bulletColors.green);
            this.currentCooldowns.spiralGreen = this.cooldowns.spiralGreen;
        }
        if (this.currentCooldowns.spiralMagenta <= 0) {
            const time = (performance.now() / 10) % 360;
            const numOfBullets = 1;
            this.shootSpiral(bullets, numOfBullets, time, 175, false, this.bulletColors.magenta);
            this.shootSpiral(bullets, numOfBullets, time, 175, true, this.bulletColors.magenta);
            this.currentCooldowns.spiralMagenta = this.cooldowns.spiralMagenta;
        }

        if (this.currentCooldowns.spiralCyan <= 0) {
            const bulletCount = 3;
            const spread = 40;
            const speed = 200;
            this.shootWave(bullets, bulletCount, spread, speed, player, deltaTime);

        }

        this.handleCollisions(bullets, enemies);

    }
    // shoot(bullets) {

    //     if (this.currentCooldown <= 0) {
    //         this.shootSpiral(bullets, 15, 0, 100);
    //         this.currentCooldown = this.cooldown;
    //     }
    // }
    shootWave(bullets, bulletCount, spread, speed, player, deltaTime) {
        // Calculate angle to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angleToPlayer = Math.atan2(dy, -dx) * (180 / Math.PI);

        // Check if it's time to shoot the next bullet in the wave
        if (this.waveTimer <= 0 && this.waveIndex < bulletCount) {
            bullets.push(
                new Bullet({
                    friendly: false,
                    direction: angleToPlayer - 90,
                    x: this.x,
                    y: this.y,
                    speed: speed,
                    spriteSrc: "./assets/enemy/rumia/bullet02.png",
                    isRound: true,
                    width: 35,
                    height: 35,
                })
            );
            this.waveIndex++;
            this.waveTimer = 0.15; // Delay between bullets in the wave
        }

        // Reset wave after firing all bullets
        if (this.waveIndex >= bulletCount) {
            this.waveIndex = 0;
            this.waveTimer = 0;
            this.currentCooldowns.spiralCyan = this.cooldowns.spiralCyan; // Cooldown before the next wave
        }

        // Reduce wave timer
        if (this.waveTimer > 0) {
            this.waveTimer -= deltaTime;
        }
    }
    shootSpiral(bullets, bulletCount, angleOffset, speed, clockwise, bulletColorSpriteSrc) {

        const angleStep = 360 / bulletCount;
        for (let i = 0; i < bulletCount; i++) {

            const angle = clockwise ? i * angleStep + angleOffset : 360 - (i * angleStep + angleOffset);

            bullets.push(new Bullet({
                friendly: false,
                direction: angle,
                x: this.x,
                y: this.y,
                speed: speed,
                spriteSrc: bulletColorSpriteSrc,
                width: 30,
                height: 30,
                isRound: true,
            }));
        }
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
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy == this) {
                enemies.splice(i, 1);
            }
        }
    }


    render(ctx) {
        ctx.drawImage(
            this.sprite,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );

        // Debug
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
    isOffScreen(scene) {
        return this.y - this.height > scene.height;
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