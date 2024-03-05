import { AnimatedSprite, Application, type Texture } from "pixi.js";
import { Projectile } from "./Projectile";
import { gsap } from "gsap";
import { COLOR_DARK_GRAY, COLOR_GREEN } from "../utils/constants";

export interface IShipOptions {
  shipAnimation: Texture[];
  app: Application;
}

export class Ship extends AnimatedSprite {
  public app!: Application;
  private ids: number = 0;
  static options = {
    scale: 0.5,
    angle: 0.3,
    moveSpeed: 6,
    bulletSpeed: -6,
  };

  public velocity = {
    vx: 0,
    vy: 0,
  };

  public isAlive = true;

  public state!: {
    movingLeft: boolean;
    movingRight: boolean;
    shoot: boolean;
  };

  constructor(optyions: IShipOptions) {
    super(optyions.shipAnimation);
    this.animationSpeed = 0.1;

    this.scale.set(Ship.options.scale);
    this.anchor.set(0.5, 0.5);

    this.app = optyions.app;
    this.state = {
      movingLeft: false,
      movingRight: false,
      shoot: false,
    };
    this.play();
  }

  updateMove() {
    if (!this.isAlive) {
      return;
    }

    if (!this.state.movingLeft && !this.state.movingRight) {
      this.rotation = 0;
    }
    if (this.state.movingLeft) {
      if (this.x > 50) {
        this.rotation = -0.2;
        gsap.to(this, { x: "-=20" });
      }
    } else if (this.state.movingRight) {
      if (this.x < this.app.screen.width - 50) {
        this.rotation = 0.2;
        gsap.to(this, { x: "+=20" });
      }
    }
  }

  shipShoot(direction: "up" | "down"): Projectile {
    let directionProjectile: number = Ship.options.bulletSpeed;
    if (direction == "up") {
      directionProjectile = Ship.options.bulletSpeed;
    }
    if (direction == "down") {
      directionProjectile = -Ship.options.bulletSpeed / 2;
    }
    const projectile = new Projectile({
      id: ++this.ids,
      app: this.app,
      radius: 10,
      fillColor: COLOR_DARK_GRAY,
      vx: Ship.options.angle,
      vy: directionProjectile,
    });
    projectile.anchor.set(0.5, 0.5);
    projectile.position.set(this.x, this.y);

    return projectile;
  }

  setKilled(): void {
    this.isAlive = false;

    this.velocity.vx = 0;
    this.velocity.vy = 0;
  }
}
