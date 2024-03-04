import {
  Container,
  Application,
  Texture,
  Sprite,
  ParticleContainer,
} from "pixi.js";
import { Ship } from "../game/Ship";
import { Projectile } from "../game/Projectile";

import { Enemy } from "../game/Enemy";
import { Collision } from "../game/Collision";
import { PlayerController } from "../game/PlayerController";
import { BossController } from "../game/BossController";
import { IScene } from "./SceneManager";
import { Particle } from "../game/Particle";
import { HealthBossBar } from "../game/HealthBossBar";
import { MessageModal } from "../game/MessageModal";
import { StatusBar } from "../game/StatusBar";

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
  private countEnemy: number = 5;
  private projectile: number = 10;
  private time: number = 60000;
  private bossFightStarted: boolean = false;
  private app!: Application;
  private background!: Sprite;
  private health: number = 100;
  private healthBar!: HealthBossBar;
  private player!: Ship;
  private boss!: Ship;
  private projectilesPlayerContainer!: ParticleContainer;
  private projectilesBossContainer!: ParticleContainer;
  private particlesContainer!: ParticleContainer;
  private enemiesContainer!: ParticleContainer;
  private messageModal!: MessageModal;
  public statusBar!: StatusBar;
  private enemyTexture!: Texture;
  public playerController!: PlayerController;
  public bossController!: BossController;
  public timeout!: number | null;
  public startBossFight: boolean = true;

  constructor(options: IGameSceneOptions) {
    super();
    this.app = options.app;

    this.setup(options);
    this.playerController = new PlayerController({
      player: this.player,
      game: this,
    });


  }

  private setup(options: IGameSceneOptions): void {
    this.background = new Sprite(options.backgroundTexture);
    this.statusBar = new StatusBar();

    this.player = new Ship({
      app: this.app,
      shipAnimation: options.playerAnimation,
    });
    this.boss = new Ship({
      app: this.app,
      shipAnimation: options.bossAnimation,
    });
    this.healthBar = new HealthBossBar({ boxWidth: this.health });
    this.enemyTexture = options.asterodTexture;

    this.addChild(this.background, this.player, this.statusBar);
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
    setTimeout(() => {
      this.spawnEnemies();
    }, 500);

    this.messageModal = new MessageModal({
      viewWidth: options.viewWidth,
      viewHeight: options.viewHeight,
    });
    this.messageModal.visible = false;
    this.addChild(this.messageModal);
    this.messageModal.eventMode = "dynamic";
    this.messageModal.on("click", () => this.startGame());
  }

  private spawnEnemies(): void {
    for (let i = 0; i < this.countEnemy; i++) {
      const enemy = new Enemy({ texture: this.enemyTexture });

      this.enemiesContainer.addChild(enemy);
    }
  }

  public handleUpdate(deltaMS: number): void {
    if (this.gameEnded) return;
    if (this.health <= 0) {
      this.beginEndGame("Win");
    }
    if (this.time <= 0) {
      this.beginEndGame("Lose");
    }
    if (this.projectile === 0) {
      if (this.countEnemy > 0) {
        this.beginEndGame("Lose");
      }
    }

    this.time -= deltaMS;
    this.statusBar.updateTime(this.time);
    this.statusBar.updateProjectile(this.projectile);
    if (this.startBossFight && this.countEnemy === 0) {
      this.startBossFight = false;
      this.projectile = 10;
      this.time = 60000;
    }
    this.statusBar.updateProjectile(this.projectile);
    if (this.countEnemy === 0) {
      this.bossFight();
    }
    const WIDTH = this.background.width;
    const HEIGHT = this.background.height;

    this.player.updateVelocity();

    if (!this.timeout && this.player.velocity.vy > 0) {
      this.projectilesPlayerContainer.addChild(this.player.shipShoot("up"));
      this.timeout = setTimeout(() => {
        this.timeout = null;
      }, 1000);

      this.projectile -= 1;
    }

    this.player.updateMove();

    this.player.updateState();

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
      (enemy as Enemy).update({
        i,
        WIDTH,
        HEIGHT: HEIGHT - this.player.height,
      });
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
    this.player.position.set(
      viewWidth / 2,
      viewHeight - this.player.height / 2
    );
    this.boss.position.set(viewWidth / 2, this.boss.height);
    this.statusBar.position.set(viewWidth - this.statusBar.width * 2, 0);
  }

  private centerModal({
    viewWidth,
    viewHeight,
  }: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.messageModal.position.set(
      viewWidth / 2 - this.messageModal.width / 2,
      viewHeight / 2 - this.messageModal.height / 2
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
    this.projectile = 10;
    this.time = 60000;
    this.health = 100;
    this.gameEnded = false;
    this.player.isAlive = true;

    this.messageModal.visible = false;

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

    if (!this.timeout && this.boss.velocity.vy > 0) {
      this.projectilesBossContainer.addChild(this.boss.shipShoot("down"));
      this.timeout = setTimeout(() => {
        this.timeout = null;
      }, 1000);
    }

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
        this.health -= 25;
        this.healthBar.updateHealth(this.health);
        this.spawnParticles({
          count: this.boss.width,
          posX: this.boss.x,
          posY: this.boss.y,
          fillColor: 0xbaa0de,
        });
        if (this.health <= 0) {
          this.boss.removeFromParent();
          this.healthBar.removeFromParent();
        }
      }
    });
  }

  public endGame(): void {
    this.gameEnded = true;
    this.messageModal.visible = true;
  }

  public beginEndGame(message: string): void {
    this.spawnParticles({
      count: this.player.width,
      posX: this.player.x,
      posY: this.player.y,
      fillColor: 0xffffff,
    });

    this.player.setKilled();
    this.messageModal.setButtonText(`You ${message}`);

    setTimeout(() => this.endGame(), 2000);
  }
}
