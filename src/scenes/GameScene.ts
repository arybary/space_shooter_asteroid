import {
  Container,
  Application,
  Texture,
  Sprite,
  ParticleContainer,
  AnimatedSprite,
} from "pixi.js";
import { Player } from "../game/Player";
import { Projectile } from "../game/Projectile";
import { StartModal } from "../game/StartModal";
import { Enemy } from "../game/Enemy";
import { Collision } from "../game/Collision";
import { PlayerController } from "../game/PlayerController";
import { IScene } from "./SceneManager";
import { Particle } from "../game/Particle";

interface IShootingSceneOptions {
  app: Application;
  viewWidth: number;
  viewHeight: number;
  shipAnimation: Texture[];
  bossAnimation: Texture[];
  backgroundTexture: Texture;
  asterodTexture: Texture;
}

export class GameScene extends Container implements IScene {
  private gameEnded: boolean = false;
  private elapsedSpawnFrames: number = 0;
  private elapsedShootFrames: number = 0;
  private spawnFrame: number = Math.floor(Math.random() * 500 + 500);
  private invaderShootFrame: number = Math.floor(Math.random() * 150);
  private ids: number = 0;
  private app!: Application;
  private background!: Sprite;
  private player!: Player;
  private boss!: AnimatedSprite;
  private projectilesContainer!: ParticleContainer;
  private particlesContainer!: ParticleContainer;
  private enemiesContainer!: ParticleContainer;
  private startModal!: StartModal;
  private enemyTexture!: Texture;
  private playerController!: PlayerController;

  constructor(options: IShootingSceneOptions) {
    super();
    this.app = options.app;
    this.setup(options);
    this.playerController = new PlayerController(this.player);
    setTimeout(() => {
      this.spawnEnemies();
    });
  }

  private setup(options: IShootingSceneOptions): void {
    this.background = new Sprite(options.backgroundTexture);
    this.player = new Player({ shipAnimation: options.shipAnimation });
    this.boss = new AnimatedSprite(options.bossAnimation);
    this.enemyTexture = options.asterodTexture;

    this.addChild(this.background, this.player);
    this.projectilesContainer = new ParticleContainer(2000, {
      scale: true,
      position: true,
      tint: true,
    });
    this.particlesContainer = new ParticleContainer(1000, {
      position: true,
      tint: true,
    });
    this.enemiesContainer = new ParticleContainer(500, { position: true });

    this.addChild(
      this.projectilesContainer,
      this.particlesContainer,
      this.enemiesContainer
    );

    this.startModal = new StartModal({
      viewWidth: options.viewWidth,
      viewHeight: options.viewHeight,
    });
    this.startModal.visible = false;
    this.addChild(this.startModal);
  }

  private spawnEnemies(): void {
    for (let i = 0; i < 10; i++) {
      const enemy = new Enemy({ texture: this.enemyTexture });
      enemy.position.set(i, i);
      this.enemiesContainer.addChild(enemy);
    }
  }

  public handleUpdate(): void {
    if (this.gameEnded) return;

    const WIDTH = this.background.width;
    const HEIGHT = this.background.height;

    // Update player velocity
    this.player.updateVelocity();
    const { velocity, position } = this.player;
    if (velocity.vy > 0) this.playerShoot();

    // Check player boundaries
    const playerBounds = this.player.getBounds();
    if (playerBounds.left + velocity.vx < this.background.x) {
      velocity.vx = 0;
      position.x = this.background.x + playerBounds.width / 2;
    } else if (playerBounds.right + velocity.vx > WIDTH) {
      velocity.vx = 0;
      position.x = WIDTH - playerBounds.width / 2;
    } else {
      position.x += velocity.vx;
    }
    this.player.updateState();

    // Update and check particles and projectiles
    const { x, y, width, height } = this;
    this.updateContainer(this.particlesContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });
    this.updateContainer(this.projectilesContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });

    // Check collisions between enemies and projectiles
    this.checkCollisions(WIDTH, HEIGHT);
  }

  private updateContainer(
    container: ParticleContainer,
    bounds: { left: number; top: number; right: number; bottom: number }
  ): void {
    container.children.forEach((child) => {
      const particle: Particle = child as Particle;
      particle.update();
      if (particle.alpha <= 0 || particle.isOutOfViewport(bounds)) {
        particle.removeFromParent();
      }
    });
  }

  private checkCollisions(WIDTH: number, HEIGHT: number): void {
    this.enemiesContainer.children.forEach((enemy, i) => {
      const enemyBounds = (enemy as Enemy).getBounds();
      this.projectilesContainer.children.forEach((child) => {
        const projectileBounds = (child as Projectile).getBounds();
        if (Collision.checkCollision(enemyBounds, projectileBounds) > 0) {
          (child as Projectile).removeFromParent();
          this.spawnParticles({
            count: enemy.width,
            posX: enemy.x,
            posY: enemy.y,
            fillColor: 0xbaa0de,
          });
          (enemy as Enemy).removeFromParent();
          if (this.enemiesContainer.children.length === 0) {
            this.addChild(this.boss);
          }
        }
      });
      (enemy as Enemy).update({ i, WIDTH, HEIGHT });
    });
  }

  private spawnParticles({
    count,
    posX,
    posY,
    fillColor,
  }: {
    count: number;
    posX: number;
    posY: number;
    fillColor: number;
  }): void {
    for (let index = 0; index < count; index++) {
      const vx = (Math.random() - 0.5) * 10;
      const vy = (Math.random() - 0.5) * 10;
      const particle = new Particle({
        app: this.app,
        radius: 2,
        vx,
        vy,
        fillColor,
      });
      particle.position.set(posX, posY);
      this.particlesContainer.addChild(particle);
    }
  }

  private playerShoot(): void {
    if (this.gameEnded || !this.player.shoot()) return;

    const projectile = new Projectile({
      id: ++this.ids,
      app: this.app,
      radius: 8,
      fillColor: 0xffffff,
      vx: 0,
      vy: Player.options.bulletSpeed,
    });
    projectile.anchor.set(0.5, 0.5);
    projectile.position.set(this.player.x, this.player.y);
    this.projectilesContainer.addChild(projectile);

    const trailProjectiles = projectile.BuildTrail();
    trailProjectiles.forEach((p) => {
      p.anchor.set(0.5, 0.5);
      p.position.set(this.player.x, this.player.y);
      this.projectilesContainer.addChild(p);
    });
  }

  public handleResize(options: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.centerPlayer(options);
    this.resizeBackground(options);
    this.centerModal(options);
  }

  private centerPlayer({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.player.position.set(viewWidth / 2, viewHeight - this.player.height);
  }

  private centerModal({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.startModal.position.set(
      viewWidth / 2 - this.startModal.boxOptions.width / 2,
      viewHeight / 2 - this.startModal.boxOptions.height / 2
    );
  }

  private resizeBackground({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.background.width = viewWidth;
    this.background.height = viewHeight;
  }

  public startGame(): void {
    this.startModal.visible = false;
    this.clearContainers();
    this.gameEnded = false;
    this.player.isAlive = true;
    setTimeout(() => this.spawnEnemies());
    this.elapsedShootFrames = 0;
    this.elapsedSpawnFrames = 0;
  }

  public endGame(): void {
    this.gameEnded = true;
    this.startModal.visible = true;
  }

  private beginEndGame(): void {
    this.spawnParticles({
      count: this.player.width,
      posX: this.player.x,
      posY: this.player.y,
      fillColor: 0xffffff,
    });
    this.player.setKilled();

    setTimeout(() => this.endGame(), 2000);
  }

  private clearContainers(): void {
    while (this.projectilesContainer.children[0] != null) {
      this.projectilesContainer.children[0].removeFromParent();
    }
    while (this.enemiesContainer.children[0] != null) {
      (this.enemiesContainer.children[0] as Enemy).removeFromParent();
    }
    while (this.particlesContainer.children[0] != null) {
      this.particlesContainer.children[0].removeFromParent();
    }
  }
}
