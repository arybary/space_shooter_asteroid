import {
  Container,
  type Application,
  type Texture,
  Sprite,
  Resource,
  AnimatedSprite,
  FederatedPointerEvent,
  ParticleContainer,
} from "pixi.js";

import { type IScene } from "./SceneManager";
import { Player } from "../game/Player";
import { Projectile } from "../game/Projectile";
import { StartModal } from "../game/StartModal";
import { Particle } from "../game/Particle";

interface IShootingSceneOptions {
  app: Application;
  viewWidth: number;
  viewHeight: number;
  shipAnimation: Texture<Resource>[];
  bossAnimation: Texture<Resource>[];
  backgroundTexture: Texture;
}

export class GameScene extends Container implements IScene {
  public gameEnded = false;
  public elapsedSpawnFrames = 0;
  public elapsedShootFrames = 0;
  public spawnFrame = Math.floor(Math.random() * 500 + 500);
  public invaderShootFrame = Math.floor(Math.random() * 150 + 50);
  public ids = 0;
  public app!: Application;
  public background!: Sprite;
  public player!: Player;
  public boss!: AnimatedSprite;
  public projectilesContainer!: ParticleContainer;
  public particlesContainer!: ParticleContainer;
  public startModal!: StartModal;

  public backgroundSettings = {
    color: 0x000000,
  };

  public invaderTexture!: Texture;

  constructor(options: IShootingSceneOptions) {
    super();
    this.app = options.app;
    this.setup(options);
    this.addEventLesteners();
  }

  setup({
    viewWidth,
    viewHeight,
    shipAnimation,
    bossAnimation,
    backgroundTexture,
  }: IShootingSceneOptions): void {
    this.background = new Sprite(backgroundTexture);
    this.player = new Player({ shipAnimation });
    this.boss = new AnimatedSprite(bossAnimation);
    this.player.animationSpeed = 0.05;
    this.player.play();
    this.addChild(this.background, this.player);
    this.projectilesContainer = new ParticleContainer(2000, {
      scale: true,
      position: true,
      tint: true,
    });
    this.addChild(this.projectilesContainer);
    this.particlesContainer = new ParticleContainer(1000, {
      position: true,
      tint: true,
    });
    this.addChild(this.particlesContainer);
  }

  handleUpdate(): void {
    if (this.gameEnded) {
      return;
    }
    const levelLeft = this.background.x;
    const levelRight = this.background.width;
    const levelTop = this.background.y;
    const levelBottom = this.background.y + this.background.height;

    this.player.updateVelocity();
    const { velocity, position } = this.player;
    if (velocity.vy > 0) {
      this.playerShoot();
    }
    const playerBounds = this.player.getBounds();

    if (playerBounds.left + velocity.vx < this.background.x) {
      velocity.vx = 0;
      position.x = this.background.x + playerBounds.width / 2;
    } else if (playerBounds.right + velocity.vx > this.background.width) {
      velocity.vx = 0;
      position.x = this.background.width - playerBounds.width / 2;
    } else {
      position.x += velocity.vx;
    }
    this.player.updateState();

    const { x, y, width, height } = this;
    const left = x;
    const top = y;
    const right = x + width;
    const bottom = y + height;
    for (const child of this.particlesContainer.children) {
      const particle: Particle = child as Particle;
      particle.update();
      if (particle.alpha <= 0) {
        particle.removeFromParent();
      } else if (particle.isOutOfViewport({ left, top, right, bottom })) {
        particle.removeFromParent();
      }
    }

    for (const child of this.projectilesContainer.children) {
      const projectile: Projectile = child as Projectile;
      projectile.update();
      if (projectile.isOutOfViewport({ left, top, right, bottom })) {
        projectile.removeFromParent();
      }
    }
  }

  handleResize(options: { viewWidth: number; viewHeight: number }): void {
    this.centerPlayer(options);
    this.resizeBackground(options);
  }

  centerPlayer({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.player.position.set(viewWidth / 2, viewHeight - this.player.height);
  }

  resizeBackground({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.background.width = viewWidth;
    this.background.height = viewHeight;
  }
  addEventLesteners(): void {
    this.eventMode = "dynamic";
    this.on("pointerdown", this.handlePlayerStartMove);
    this.on("pointermove", this.handlePlayerKeepMove);
    this.on("pointerup", this.handlePlayerStopMove);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  handlePlayerMove(
    pressed: boolean | undefined,
    e: FederatedPointerEvent
  ): void {
    const point = this.toLocal(e.global);

    this.player.handleMove(pressed, point.x, point.y);
  }

  handlePlayerStartMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(true, e);
  };

  handlePlayerKeepMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(undefined, e);
  };

  handlePlayerStopMove = (e: FederatedPointerEvent): void => {
    this.handlePlayerMove(false, e);
  };

  handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
      case "Space":
      case "ShiftLeft":
        this.player.applyTopDirection(true);
        break;
      case "KeyA":
      case "ArrowLeft":
        console.log("s");
        this.player.applyLeftDirection(true);
        break;
      case "KeyD":
      case "ArrowRight":
        this.player.applyRightDirection(true);
        break;
    }
  };

  handleKeyUp = (e: KeyboardEvent): void => {
    switch (e.code) {
      case "KeyW":
      case "ArrowUp":
      case "Space":
      case "ShiftLeft":
        this.player.applyTopDirection(false);
        break;
      case "KeyA":
      case "ArrowLeft":
        this.player.applyLeftDirection(false);
        break;
      case "KeyD":
      case "ArrowRight":
        this.player.applyRightDirection(false);
        break;
    }
  };

  playerShoot(): void {
    if (this.gameEnded) {
      return;
    }
    if (this.player.shoot()) {
      const projectile = new Projectile({
        id: ++this.ids,
        app: this.app,
        radius: 8,
        fillColor: 0xffffff,
        vx: 0,
        vy: Player.options.bulletSpeed,
      });
      projectile.anchor.set(0.5, 0.5);
      projectile.position.set(this.player.x, this.player.y - this.player.height / 2 - projectile.height)
      this.projectilesContainer.addChild(projectile);
      const trailProjectiles = projectile.BuildTrail();

      trailProjectiles.forEach((p) => {
        p.anchor.set(0.5, 0.5);
        p.position.set(this.player.x, this.player.y);
        this.projectilesContainer.addChild(p);
      });
    }
  }
}
