export default class Cannon {
  constructor(x, y, sprite) {
    this.x = x;
  	this.y = y;

    this.speed = 4;

    this._sprite = sprite;

    this.w = sprite.w;
    this.h = sprite.h;
  }

  moveLeft() {
    this.x -= this.speed;
  }

  moveRight() {
    this.x += this.speed;
  }

  clamp(canvasWidth) {
    if (this.x < 0) {
      this.x = 0;
    }

    if (this.x + this.w > canvasWidth) {
      this.x = canvasWidth - this.w;
    }
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.w,
      top: this.y,
      bottom: this.y + this.h
    };
  }

  draw(ctx, time) {
    ctx.drawImage(
      this._sprite.img,
      this._sprite.x, this._sprite.y, this._sprite.w, this._sprite.h,
      this.x, this.y, this._sprite.w, this._sprite.h
    );
  }
}