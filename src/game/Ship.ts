import { AnimatedSprite, Application, Resource, type Texture } from "pixi.js";
import { Projectile } from "./Projectile";

export interface IShipOptions {
  shipAnimation: Texture[];
  app: Application;
}

export enum ShipState {
  idle = "idle",
  skewLeft = "skewLeft",
  skewRight = "skewRight",
}

export class Ship extends AnimatedSprite {
  public pointerXDown: number | null = null;
  public pointerYDown: number | null = null;
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

  public state!: ShipState;

  constructor(opyions: IShipOptions) {
    super(opyions.shipAnimation);
    this.animationSpeed = 0.05;
    this.play();
    this.scale.set(Ship.options.scale);
    this.anchor.set(0.5, 0.5);
    this.switchState(ShipState.idle);
    this.app = opyions.app;
  }

  switchState(state: ShipState): void {
    switch (state) {
      case ShipState.idle:
        this.rotation = 0;
        break;
      case ShipState.skewLeft:
        this.rotation = -Ship.options.angle;
        break;
      case ShipState.skewRight:
        this.rotation = Ship.options.angle;
        break;
    }
    this.state = state;
  }

  isPointerDown(): boolean {
    return this.pointerXDown !== null && this.pointerYDown !== null;
  }

  applyShootDirection(pressed: boolean): void {
    if (!this.isAlive) {
      return;
    }
    this.pointerYDown = pressed ? -1 : null;
  }

  applyLeftDirection(pressed: boolean): void {
    if (!this.isAlive) {
      return;
    }
    this.pointerXDown = pressed
      ? -1
      : this.pointerXDown === -1
        ? null
        : this.pointerXDown;
  }

  applyRightDirection(pressed: boolean): void {
    if (!this.isAlive) {
      return;
    }
    this.pointerXDown = pressed
      ? 1
      : this.pointerXDown === 1
        ? null
        : this.pointerXDown;
  }

  handleMove(pressed: boolean | undefined, x: number, y: number): void {
    if (!this.isAlive) {
      return;
    }
    if (pressed === true) {
      this.pointerXDown = x - this.x;
      this.pointerYDown = y - this.y;
    } else if (pressed === false) {
      this.pointerXDown = null;
      this.pointerYDown = null;
    } else {
      if (this.isPointerDown()) {
        this.pointerXDown = x - this.x;
        this.pointerYDown = y - this.y;
      }
    }
  }

  updateVelocity(): void {
    if (!this.isAlive) {
      return;
    }

    const {
      options: { moveSpeed },
    } = Ship;
    const { pointerXDown, pointerYDown, velocity } = this;
    if (typeof pointerYDown === "number" && pointerYDown < 0) {
      velocity.vy = 1;
    } else {
      velocity.vy = 0;
    }
    if (typeof pointerXDown === "number") {
      if (pointerXDown < 0) {
        velocity.vx = -moveSpeed;
      } else if (pointerXDown > 0) {
        velocity.vx = moveSpeed;
      }
    } else {
      velocity.vx = 0;
    }
  }

  updateMove() {
    const { velocity, position } = this;
    const shipBounds = this.getBounds();
    if (shipBounds.left + velocity.vx < 0) {
      velocity.vx = 0;
      position.x = shipBounds.width / 2;
    } else if (shipBounds.right + velocity.vx > this.app.view.width) {
      velocity.vx = 0;
      position.x = this.app.view.width - shipBounds.width / 2;
    } else {
      position.x += velocity.vx;
    }
  }

  updateState(): void {
    if (!this.isAlive) {
      return;
    }
    if (this.velocity.vx > 0) {
      this.switchState(ShipState.skewRight);
    } else if (this.velocity.vx < 0) {
      this.switchState(ShipState.skewLeft);
    } else {
      this.switchState(ShipState.idle);
    }
  }

  shipShoot(direction: "up" | "down"): Projectile {
    let directionProjectile: number = Ship.options.bulletSpeed;
    if (direction == "up") {
      directionProjectile = Ship.options.bulletSpeed;
    }
    if (direction == "down") {
      directionProjectile = -Ship.options.bulletSpeed;
    }
    const projectile = new Projectile({
      id: ++this.ids,
      app: this.app,
      radius: 8,
      fillColor: 0xffffff,
      vx: 0,
      vy: directionProjectile,
    });
    projectile.anchor.set(0.5, 0.5);
    projectile.position.set(this.x, this.y);

    return projectile;
  }

  setKilled(): void {
    this.isAlive = false;
    this.pointerXDown = null;
    this.pointerYDown = null;
    this.velocity.vx = 0;
    this.velocity.vy = 0;
  }
}
