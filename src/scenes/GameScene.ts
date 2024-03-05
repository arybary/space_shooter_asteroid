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
import { GameAudio } from "../utils/Audio";

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
  audio!: GameAudio;
  private background!: Sprite;
  private gameEnded: boolean = true;
  private countEnemy: number = 5;
  private countProjectile: number = 10;
  private time: number = 60000;
  public timeoutForShootPlayer!: number | null;
  public timeoutForShootBoss!: number | null;
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
    this.audio = new GameAudio();

    this.setup(options);
    this.playerController = new PlayerController({
      player: this.player,
      game: this,
    });
    this.bossController = new BossController(this.boss);
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
      this.particlesContainer
    );

    this.messageModal = new MessageModal({
      viewWidth: options.viewWidth,
      viewHeight: options.viewHeight,
    });
    this.messageModal.visible = true;
    this.addChild(this.messageModal);
    this.messageModal.eventMode = "auto";
    this.messageModal.on("click", () => {
      this.startGame();
    });
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
    Array.from({ length: this.countEnemy }, () => {
      const enemy = new Enemy({ texture: this.enemyTexture });
      this.enemiesContainer.addChild(enemy);
      enemy.position.set(this.width / 2, this.height / 2);
    });
    this.addChild(this.enemiesContainer);
  }

  public handleUpdate(deltaMS: number): void {
    if (this.gameEnded) return;


    if (this.time <= 0 || (this.countEnemy > 0 && this.countProjectile === 0)) {
      this.beginEndGame("Lose");
    }


    if (this.health <= 0) {
      this.beginEndGame("win");
    }


    const { x, y, width, height } = this;

    this.time -= deltaMS;
    this.statusBar.updateTime(this.time);
    this.statusBar.updateProjectile(this.countProjectile);
    this.healthBar.updateHealth(this.health);
    this.player.updateMove();
    this.enemiesContainer.children.forEach((enemy, i) => {
      (enemy as Enemy).update({
        i,
        width,
        height: height - this.player.height,
      });
    });

    if (this.countEnemy === 0) {



      this.bossFight();
    }

    if (!this.timeoutForShootPlayer && this.player.state.shoot) {
      this.audio.playShot();
      this.projectilesPlayerContainer.addChild(this.player.shipShoot("up"));
      this.timeoutForShootPlayer = setTimeout(() => {
        this.timeoutForShootPlayer = null;
      }, 500);
    }
    if (!this.timeoutForShootBoss && this.boss.state.shoot && this.countProjectile > 0) {
      this.audio.playShot();
      this.projectilesBossContainer.addChild(this.boss.shipShoot("down"));
      this.timeoutForShootBoss = setTimeout(() => {
        this.timeoutForShootBoss = null;
      }, 2000);
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
        this.countProjectile -= 1;
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
      this.countProjectile = 10;
      this.time = 60000;
      this.boss.state.shoot = true;

      this.bossController.changeFunctionRandomly();
      this.startBossFight = false;
    }

    if (this.countProjectile === 0 && this.health > 0) {
      this.beginEndGame("Lose");
    };
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
          this.countEnemy -= 1;
          this.countProjectile -= 1;
        }
      });
    });
  }

  private checkCollisionsProjectilePlayerForBoss() {
    this.projectilesPlayerContainer.children.forEach((child) => {
      const projectileBounds = (child as Projectile).getBounds();
      const bossBounds = this.boss.getBounds();
      if (Collision.checkCollision(bossBounds, projectileBounds) > 0) {
        this.health -= 1;
        (child as Projectile).removeFromParent();
        this.countProjectile -= 1;

        this.spawnParticles({
          count: this.boss.width,
          posX: this.boss.x,
          posY: this.boss.y,
          fillColor: 0xbaa0de,
        });
      }
    });
  }

  private checkCollisionsProjectileBossForPlayer() {
    this.projectilesBossContainer.children.forEach((projectileBoss) => {
      const projectileBossBounds = (projectileBoss as Projectile).getBounds();
      const playerBounds = this.player.getBounds();
      if (Collision.checkCollision(playerBounds, projectileBossBounds) > 0) {
        this.player.isAlive = false;
        (projectileBoss as Projectile).removeFromParent();
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
          this.countProjectile -= 1;
        }
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

  public startGame(): void {
    this.countProjectile = 10;
    this.countEnemy = 5;
    this.time = 60000;
    this.health = 4;
    this.gameEnded = false;
    this.startBossFight = true;
    this.player.isAlive = true;
    this.messageModal.visible = false;
    this.audio.playMusic();

    setTimeout(() => {
      this.spawnEnemies();
    }, 500);
  }

  public endGame(): void {
    this.gameEnded = true;
    this.messageModal.visible = true;
    this.bossController.stop();
    this.removeChild(this.boss, this.healthBar);
    while (this.projectilesBossContainer.children[0] != null) {
      this.projectilesBossContainer.removeChild(
        this.projectilesBossContainer.children[0]
      );
    }
    while (this.projectilesPlayerContainer.children[0] != null) {
      this.projectilesPlayerContainer.removeChild(
        this.projectilesBossContainer.children[0]
      );
    }
    while (this.enemiesContainer.children[0] != null) {
      this.enemiesContainer.removeChild(this.enemiesContainer.children[0]);
    }
    while (this.particlesContainer.children[0] != null) {
      this.particlesContainer.removeChild(this.particlesContainer.children[0]);
    }
  }

  public beginEndGame(message: string): void {
    this.audio.stopMusic();
    this.spawnParticles({
      count: this.player.width,
      posX: this.player.x,
      posY: this.player.y,
      fillColor: 0xffffff,
    });

    this.removeChild(this.boss, this.healthBar);
    this.player.setKilled();
    this.messageModal.setButtonText(`You ${message}`);
    setTimeout(() => this.endGame(), 1000);
  }
}
