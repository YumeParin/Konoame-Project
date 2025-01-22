export default class Bullet {
    constructor({
        friendly = true,
        direction = 0,
        x = 0,
        y = 0,
        speed = 500,
        spriteSrc,
        damage,
        width = null,
        height = null,
        isRound,
    }) {
        if (!spriteSrc) {
            throw new Error("A sprite source is required for the Bullet class.");
        }

        this.friendly = friendly;
        this.direction = direction;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.damage = damage;
        this.isRound = isRound;

        this.sprite = new Image();
        this.sprite.src = spriteSrc;

        if (width && height) {
            this.width = width;
            this.height = height;
        } else {
            this.width = 0;
            this.height = 0;
            this.sprite.onload = () => {
                this.width = this.sprite.width;
                this.height = this.sprite.height;
            }
        }
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
        this.x += x * deltaTime;
        this.y += y * deltaTime;
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
        // ctx.strokeStyle = "green";
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
        const { x = 0, y = 0, width, height } = scene;
        return (
            this.x + this.width / 2 < x ||
            this.x - this.width / 2 > width + x ||
            this.y + this.height / 2 < y ||
            this.y - this.height / 2 > height + y
        );


    }
    collidesWith(target) {
        if (this.isRound) {
            const dx = this.x - target.x;
            const dy = this.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetRadius = target.hitboxRadius || Math.min(target.width, target.height) / 2;
            return distance < Math.min(this.width, this.height) / 2 + targetRadius;
        } else {
            const bulletLeft = this.x - this.width / 2
            const bulletRight = this.x + this.width / 2
            const bulletTop = this.y - this.width / 2
            const bulletBottom = this.y + this.width / 2

            const targetLeft = target.x - target.width / 2
            const targetRight = target.x + target.width / 2
            const targetTop = target.y - target.height / 2
            const targetBottom = target.y + target.height / 2

            return (
                bulletRight > targetLeft &&
                bulletLeft < targetRight &&
                bulletBottom > targetTop &&
                bulletTop < targetBottom
            );
        }
    }


}