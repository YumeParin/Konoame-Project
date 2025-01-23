export default class GameZone {

    constructor(x, y, width, height, color = "rgba(25, 52, 21, 0.759)", backgroundSrc = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.background = null;
        this.darkness = 0;
        if (backgroundSrc) {
            this.background = new Image();
            this.background.src = backgroundSrc;
        }
    }

    contains(x, y, width = 0, height = 0) {
        return (
            x >= this.x &&
            y >= this.y &&
            x + width <= this.x + this.width &&
            y + height <= this.y + this.height
        );
    }

    setBackgroundDarkness(darkness) {
        // fix darkness between 0 and 1, not less than 0 and more than 1
        this.darkness = Math.max(0, Math.min(darkness, 1));
    }

    render(ctx) {
        if (this.background) {
            ctx.drawImage(this.background, this.x, this.y - 20, this.width + 20, this.height + 25);
            if (this.darkness) {
                ctx.save();
                ctx.fillStyle = `rgba(0,0,0, ${this.darkness})`;
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.restore();
            }

        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

    }
}
