export default class Bullet {
  constructor({
    friendly = true,
    direction = 0,
    x = 0,
    y = 0,
    speed = 500,
    spriteSrc,
    damage = 10,
    width = null,
    height = null,
    isRound = false,
  }) {
    if (!spriteSrc)
      throw new Error("A sprite source is required for the Bullet class.");

    this.friendly = friendly;
    this.direction = direction;
    this.position = { x, y };
    this.speed = speed;
    this.damage = damage;
    this.isRound = isRound;
    this.sprite = this.loadSprite(spriteSrc);

    if (width && height) {
      this.width = width;
      this.height = height;
    } else {
      this.width = 0;
      this.height = 0;
      this.sprite.onload = () => {
        this.width = this.sprite.width;
        this.height = this.sprite.height;
      };
    }
  }

  loadSprite(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  getVelocity() {
    const radians = (this.direction * Math.PI) / 180;
    return {
      x: Math.sin(radians) * this.speed,
      y: Math.cos(radians) * this.speed,
    };
  }

  update(deltaTime) {
    const { x, y } = this.getVelocity();
    this.position.x += x * deltaTime;
    this.position.y += y * deltaTime;
  }

  render(ctx) {
    ctx.drawImage(
      this.sprite,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height
    );
    // // Debug;
    // ctx.save();
    // ctx.strokeStyle = "green";
    // ctx.lineWidth = 2;
    // ctx.strokeRect(
    //   this.position.x - this.width / 2,
    //   this.position.y - this.height / 2,
    //   this.width,
    //   this.height
    // );
    // ctx.restore();
  }
  isOffScreen(scene) {
    const { x = 0, y = 0, width, height } = scene;
    return (
      this.position.x + this.width / 2 < x ||
      this.position.x - this.width / 2 > width + x ||
      this.position.y + this.height / 2 < y ||
      this.position.y - this.height / 2 > height + y
    );
  }
  collidesWith(target) {
    if (this.isRound || target.hitboxRadius) {
      return this.checkCircularCollision(target);
    } else {
      return this.checkRectangularCollision(target);
    }
  }

  checkCircularCollision(target) {
    const dx = this.position.x - target.position.x;
    const dy = this.position.y - target.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const targetRadius =
      target.hitboxRadius || Math.min(target.width, target.height) / 2;
    const bulletRadius = Math.min(this.width, this.height) / 2;

    return distance < bulletRadius + targetRadius;
  }

  checkRectangularCollision(target) {
    const bulletBounds = this.getBounds();
    const targetBounds = target.getBounds();
    return (
      bulletBounds.right > targetBounds.left &&
      bulletBounds.left < targetBounds.right &&
      bulletBounds.bottom > targetBounds.top &&
      bulletBounds.top < targetBounds.bottom
    );
  }

  getBounds() {
    return {
      left: this.position.x - this.width / 2,
      right: this.position.x + this.width / 2,
      top: this.position.y - this.height / 2,
      bottom: this.position.y + this.height / 2,
    };
  }
}
