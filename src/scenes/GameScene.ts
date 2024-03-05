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
import { Collision } from "../utils/Collision";
import { PlayerController } from "../utils/PlayerController";
import { BossController } from "../utils/BossController";
import { IScene } from "./SceneManager";
import { Particle } from "../game/Particle";
import { HealthBossBar } from "../game/HealthBossBar";
import { MessageModal } from "../game/MessageModal";
import { StatusBar } from "../game/StatusBar";
import { COLOR_DARK_GRAY, COLOR_GREEN } from "../utils/constants";

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
  private app!: Application;
  private background!: Sprite;
  private gameEnded: boolean = false;
  private countEnemy: number = 5;
  private projectile: number = 10;
  private time: number = 60000;
  public timeoutForShoot!: number | null;
  private health: number = 4;
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
    this.messageModal.eventMode = "auto";
    this.messageModal.on("click", () => this.startGame());
  }

  public handleResize(options: {
    viewWidth: number;
    viewHeight: number;
  }): void {
    this.resizeBackground(options);
    this.positionObjectGame(options);
  }

  private positionObjectGame({
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

  public spawnEnemies(): void {
    for (let i = 0; i < this.countEnemy; i++) {
      const enemy = new Enemy({ texture: this.enemyTexture });
      this.enemiesContainer.addChild(enemy);
      enemy.position.set(this.width / 2, this.height / 2)
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


    if (this.countEnemy > 0 && this.projectile <= 0) {
      this.beginEndGame("Lose");
    }

    const { x, y, width, height } = this;
    this.player.updateMove();
    this.enemiesContainer.children.forEach((enemy, i) => {
      (enemy as Enemy).update({
        i,
        width,
        height: height - this.player.height,
      });
    });
    this.time -= deltaMS;
    this.statusBar.updateTime(this.time);
    this.statusBar.updateProjectile(this.projectile);
    this.statusBar.updateProjectile(this.projectile);
    if (this.countEnemy === 0) {
      this.bossFight();
    }

    if (
      !this.timeoutForShoot &&
      this.player.state.shoot &&
      this.projectile > 0
    ) {
      this.projectilesPlayerContainer.addChild(this.player.shipShoot("up"));
      this.timeoutForShoot = setTimeout(() => {
        this.timeoutForShoot = null;
      }, 1000);
    }

    if (!this.timeoutForShoot && this.boss.state.shoot) {
      this.projectilesBossContainer.addChild(this.boss.shipShoot("down"));
      this.timeoutForShoot = setTimeout(() => {
        this.timeoutForShoot = null;
      }, 1000);
    }

    this.updateContainer(this.particlesContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });
    this.projectilesPlayerContainer.children.forEach((child) => {
      const particle: Particle = child as Particle;
      particle.update();
      if (
        particle.alpha <= 0 ||
        particle.isOutOfViewport({
          left: x,
          top: y,
          right: x + width,
          bottom: y + height,
        })
      ) {
        particle.removeFromParent();
        this.projectile -= 1;
      }
    });
    this.updateContainer(this.projectilesBossContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });

    this.checkCollisionsProjectilePlayerForEnemy();
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
  public bossFight() {
    this.addChild(this.boss, this.healthBar);
    this.boss.updateMove();

    if (this.startBossFight) {
      this.projectile = 10;
      this.time = 60000;
      this.bossController = new BossController(this.boss);
      this.startBossFight = false;
    }

    const { x, y, width, height } = this;
    this.updateContainer(this.projectilesBossContainer, {
      left: x,
      top: y,
      right: x + width,
      bottom: y + height,
    });

    this.checkCollisionsProjectilePlayerForBoss();
    this.checkCollisionsProjectileBossForPlayer();
  }

  private checkCollisionsProjectilePlayerForEnemy(): void {
    this.enemiesContainer.children.forEach((enemy) => {
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
          this.projectile -= 1;
        }
      });
    });
  }

  private checkCollisionsProjectilePlayerForBoss() {
    this.projectilesPlayerContainer.children.forEach((child) => {
      const projectileBounds = (child as Projectile).getBounds();
      const bossBounds = this.boss.getBounds();
      if (Collision.checkCollision(bossBounds, projectileBounds) > 0) {
        (child as Projectile).removeFromParent();
        this.projectile -= 1;
        this.health -= 1;
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

  private checkCollisionsProjectileBossForPlayer() {
    this.projectilesBossContainer.children.forEach((projectileBoss) => {
      const projectileBossBounds = (projectileBoss as Projectile).getBounds();
      const playerBounds = this.player.getBounds();
      if (Collision.checkCollision(playerBounds, projectileBossBounds) > 0) {
        (projectileBoss as Projectile).removeFromParent();
        this.beginEndGame("Lose");
      }
      this.projectilesPlayerContainer.children.forEach((projectilePlayer) => {
        const projectilePlayerBounds = (
          projectilePlayer as Projectile
        ).getBounds();

        if (
          Collision.checkCollision(
            projectilePlayerBounds,
            projectileBossBounds
          ) > 0
        ) {

          this.spawnParticles({
            count: projectilePlayer.width,
            posX: projectilePlayer.x,
            posY: projectilePlayer.y,
            fillColor: 0xbaa0de,
          });
          this.spawnParticles({
            count: projectileBoss.width,
            posX: projectileBoss.x,
            posY: projectileBoss.y,
            fillColor: 0xbaa0de,
          });
          projectilePlayer.removeFromParent();
          projectileBoss.removeFromParent();
          this.projectile -= 1;
        }
      });
    }
    );
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

  public startGame(): void {
    this.projectile = 10;
    this.time = 60000;
    this.health = 100;
    this.gameEnded = false;
    this.player.isAlive = true;
    this.messageModal.visible = false;
    this.gameEnded = false;
    this.player.isAlive = true;

    this.spawnEnemies();
  }

  public endGame(): void {
    this.gameEnded = true;
    this.messageModal.visible = true;
  }

  public beginEndGame(message: string): void {
    this.projectile = 0;
    this.time = 0;
    this.spawnParticles({
      count: this.player.width,
      posX: this.player.x,
      posY: this.player.y,
      fillColor: 0xffffff,
    });
    this.boss.removeFromParent();
    this.healthBar.removeFromParent();
    this.player.setKilled();
    this.messageModal.setButtonText(`You ${message}`);
    setTimeout(() => this.endGame(), 1000);
  }
}
