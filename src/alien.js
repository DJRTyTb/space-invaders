export default class Alien {
  constructor(x, y, [spriteA, spriteB]) {
    this.x = x;
  	this.y = y;

    this.vx = 1;
    this.alive = true;

    this._spriteA = spriteA;
    this._spriteB = spriteB;

    this.w = spriteA.w;
    this.h = spriteA.h;
  }

  update() {
    this.x += this.vx;
  }

  moveDown(distance) {
    this.y += distance;
  }

  reverse(direction) {
    this.vx = direction;
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
    if (!this.alive) {
      return;
    }

    let sp = (Math.ceil(time / 1000) % 2 === 0) ? this._spriteA : this._spriteB;

    ctx.drawImage(
      sp.img,
      sp.x, sp.y, sp.w, sp.h,
      this.x, this.y, sp.w, sp.h
    );
  }
}