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
    width,
    height,
  }: {
    i: number;
      width: number;
      height: number;
  }): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    // Обновление позиции
    this.x += Math.cos(i) * this.vx;
    this.y += Math.sin(i) * this.vy;

    // Проверка выхода за границы экрана и корректировка позиции
    if (this.x < halfWidth) {
      this.x = halfWidth;
      this.vx *= -1; // изменяем направление
    } else if (this.x > width - halfWidth) {
      this.x = width - halfWidth;
      this.vx *= -1; // изменяем направление
    }

    if (this.y < halfHeight) {
      this.y = halfHeight;
      this.vy *= -1; // изменяем направление
    } else if (this.y > height - halfHeight) {
      this.y = height - halfHeight;
      this.vy *= -1; // изменяем направление
    }
  }
}
