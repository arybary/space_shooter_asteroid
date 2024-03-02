import { Sprite, type Texture } from "pixi.js";

export interface IEnemy {
  texture: Texture;
}

export class Enemy extends Sprite {
  static options = {
    scale: 0.4,
    angle: 0.3,
    moveSpeed: 6,
  };
  public vx: number;
  public vy: number;
  constructor({ texture }: IEnemy) {
    super(texture);
    this.scale.set(Enemy.options.scale);
    this.anchor.set(0.5, 0.5);

    this.vx = Enemy.options.moveSpeed;
    this.vy = Enemy.options.moveSpeed;
  }

  update({
    i,
    WIDTH,
    HEIGHT,
  }: {
    i: number;
    WIDTH: number;
    HEIGHT: number;
  }): void {
    this.x += Math.cos(i) * this.vx;
    this.y += Math.sin(i) * this.vy;

    if (this.x < 0 || this.x > WIDTH) {
      this.vx *= -1;
    }

    if (this.y <= 0 || this.y > HEIGHT) {
      this.vy *= -1;
    }
    if (this.vy === 0) { this.vx = 6 }
  }
}
