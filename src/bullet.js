export default class Bullet {
  constructor(x, y, vy, w, h, color, owner = "player") {
    this.x = x;
  	this.y = y;

    this.prevX = x;
    this.prevY = y;

  	this.vy = vy;
  	this.w = w;
  	this.h = h;
  	this.color = color;

    this.owner = owner;
    this.active = true;
  }

  update(time) {
    this.prevX = this.x;
    this.prevY = this.y;

    this.y += this.vy;
  }

  isOutOfScreen(canvasHeight) {
    return this.y + this.h < 0 || this.y > canvasHeight;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.w,
      top: this.y,
      bottom: this.y + this.h
    };
  }

  draw(ctx) {
    if (!this.active) {
      return;
    }

    ctx.fillStyle = this.color;
  	ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}