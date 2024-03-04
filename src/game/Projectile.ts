import { Sprite, Application, Texture, SimpleRope, Graphics, Point } from 'pixi.js';

export interface IProjectileOptions {
    id: number;
    app: Application;
    radius: number;
    fillColor: number;
    vx: number;
    vy: number;
}

export class Projectile extends Sprite {
    static textureCache: Texture;
    public id!: number;
    public isProjectile = true;
    public app!: Application;
    public radius!: number;
    public vx!: number;
    public vy!: number;
    public fillColor!: number;

    constructor(options: IProjectileOptions) {
      super();
      this.id = options.id;
      this.app = options.app;
      this.radius = options.radius;
      this.vx = options.vx;
      this.vy = options.vy;
      this.fillColor = options.fillColor;
      this.setup(options);
  }

    setup(options: IProjectileOptions): void {
      let texture = Projectile.textureCache;
      if (texture == null) {
        const circle = new Sprite(options.app.renderer.generateTexture(this.createCircleTexture()));
        Projectile.textureCache = texture = circle.texture;
    }
        this.texture = texture;
    }

    createCircleTexture(): Graphics {
        const circle = new Graphics();
        circle.beginFill(this.fillColor);
        circle.drawCircle(0, 0, this.radius);
        circle.endFill();
        return circle;
    }

    update(): void {
        this.x += this.vx;
        this.y += this.vy;
    }

    BuildTrail(): SimpleRope {
        const length = Math.floor(this.radius) * 3;
        const points = Array.from({ length }, (_, idx) => {
            const ratio = (idx + 1) / length;
            return new Point(this.x, this.y);
        });
        const rope = new SimpleRope(this.texture, points);
        this.app.stage.addChild(rope);
        return rope;
    }

    isOutOfViewport({ left, top, right, bottom }: { left: number; top: number; right: number; bottom: number }): boolean {
        const pLeft = this.x - this.radius;
        const pTop = this.y - this.radius;
        const pRight = this.x + this.radius;
        const pBottom = this.y + this.radius;
        if (pRight < left) {
          return true;
      }
      if (pLeft > right) {
          return true;
      }
      if (pBottom < top) {
          return true;
      }
      if (pTop > bottom) {
        return true;
    }
      return false;
  }
}
