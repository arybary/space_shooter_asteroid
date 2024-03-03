import {
  Container,
  Application,
  Texture,
  Sprite,
  ParticleContainer,
} from "pixi.js";
import { Ship } from "../game/Ship";
import { Projectile } from "../game/Projectile";
import { StartModal } from "../game/StartModal";
import { Enemy } from "../game/Enemy";
import { Collision } from "../game/Collision";
import { PlayerController } from "../game/PlayerController";
import { BossController } from "../game/BossController";
import { IScene } from "./SceneManager";
import { Particle } from "../game/Particle";
import { HealthBossBar } from "../game/HealthBossBar";

interface IGameSceneOptions {
  app: Application;
  viewWidth: number;
  viewHeight: number;
  playerAnimation: Texture[];
  bossAnimation: Texture[];
  backgroundTexture: Texture;
  asterodTexture: Texture;
}

export class GameScene extends Container implements IScene {
  private gameEnded: boolean = false;
  private countEnemy: number = 10;
  private bossFightStarted: boolean = false;
  private app!: Application;
  private background!: Sprite;
  private health: number = 100;
  private healthBar: HealthBossBar;
  private player!: Ship;
  private boss!: Ship;
  private projectilesPlayerContainer!: ParticleContainer;
  private projectilesBossContainer!: ParticleContainer;
  private particlesContainer!: ParticleContainer;
  private enemiesContainer!: ParticleContainer;
  private startModal!: StartModal;
  private enemyTexture!: Texture;
  public playerController!: PlayerController;
  public bossController!: BossController;

  constructor(options: IGameSceneOptions) {
    super();
    this.app = options.app;
    this.healthBar = new HealthBossBar({ boxWidth: this.health });
    this.setup(options);
    this.playerController = new PlayerController(this.player);

    setTimeout(() => {
      this.spawnEnemies();
    }, 500);
  }

  private setup(options: IGameSceneOptions): void {
    this.background = new Sprite(options.backgroundTexture);
    this.player = new Ship({
      app: this.app,
      shipAnimation: options.playerAnimation,
    });
    this.boss = new Ship({
      app: this.app,
      shipAnimation: options.bossAnimation,
    });

    this.enemyTexture = options.asterodTexture;

    this.addChild(this.background, this.player);
    this.projectilesPlayerContainer = new ParticleContainer(2000, {
      scale: true,
      position: true,
      tint: true,
    });
    this.projectilesBossContainer = new ParticleContainer(2000, {
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
      this.projectilesPlayerContainer,
      this.projectilesBossContainer,
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
    for (let i = 0; i < this.countEnemy; i++) {
      const enemy = new Enemy({ texture: this.enemyTexture });
      enemy.position.set(i, i);
      this.enemiesContainer.addChild(enemy);
    }
  }

  public handleUpdate(): void {
    if (this.health === 0) {
      this.beginEndGame();
    }
    if (this.gameEnded) return;

    const WIDTH = this.background.width;
    const HEIGHT = this.background.height;

    this.player.updateVelocity();

    if (this.player.velocity.vy > 0)
      this.projectilesPlayerContainer.addChild(this.player.shipShoot("up"));

    this.player.updateMove();

    this.player.updateState();

    if (this.countEnemy === 0) {
      this.bossFight();
    }

    const { x, y, width, height } = this;
    this.updateContainer(this.particlesContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });
    this.updateContainer(this.projectilesPlayerContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });

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
      this.projectilesPlayerContainer.children.forEach((child) => {
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
          this.countEnemy = this.enemiesContainer.children.length;
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
    this.boss.position.set(viewWidth / 2, this.boss.height);
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
    setTimeout(() => this.spawnEnemies(), 1000);
  }

  public bossFight() {
    this.addChild(this.boss, this.healthBar);
    if (!this.bossFightStarted) {
      this.bossController = new BossController(this.boss);
      this.bossFightStarted = true;
    }

    this.boss.updateMove();
    this.boss.updateState();
    this.boss.updateVelocity();

    if (this.boss.velocity.vy > 0)
      this.projectilesBossContainer.addChild(this.boss.shipShoot("down"));

    const { x, y, width, height } = this;
    this.updateContainer(this.projectilesBossContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });

    this.projectilesPlayerContainer.children.forEach((child) => {
      const projectileBounds = (child as Projectile).getBounds();
      const bossBounds = this.boss.getBounds();
      if (Collision.checkCollision(bossBounds, projectileBounds) > 0) {
        (child as Projectile).removeFromParent();
        console.log("gjg");
        this.health -= 25;
        this.healthBar.updateHealth(this.health);
        this.spawnParticles({
          count: this.boss.width,
          posX: this.boss.x,
          posY: this.boss.y,
          fillColor: 0xbaa0de,
        });
      }
    });
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
    while (this.projectilesPlayerContainer.children[0] != null) {
      this.projectilesPlayerContainer.children[0].removeFromParent();
    }
    while (this.projectilesBossContainer.children[0] != null) {
      this.projectilesBossContainer.children[0].removeFromParent();
    }
    while (this.enemiesContainer.children[0] != null) {
      (this.enemiesContainer.children[0] as Enemy).removeFromParent();
    }
    while (this.particlesContainer.children[0] != null) {
      this.particlesContainer.children[0].removeFromParent();
    }
  }
}
