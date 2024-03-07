import { FederatedPointerEvent } from "pixi.js";
import { Ship } from "../game/Ship";
import { GameScene } from "../scenes/GameScene";

interface IPlayerController {
    game: GameScene;
    player: Ship;
}

export class PlayerController {
    private player: Ship;
    private game: GameScene;

    constructor({ game, player }: IPlayerController) {
        this.player = player;
        this.game = game;
        this.addEventListeners();
  }

    private addEventListeners(): void {
        this.game.eventMode = "dynamic";
        this.game.on("pointerdown", this.handlePlayerStartMove);
        this.game.on("pointermove", this.handlePlayerKeepMove);
        this.game.on("pointerup", this.handlePlayerStopMove);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
  }

    private handleKeyDown = (e: KeyboardEvent): void => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
            case "Space":
            case "ShiftLeft":
                this.player.state.shoot = true;

            break;
        case "KeyA":
        case "ArrowLeft":
            this.player.state.movingLeft = true;
            this.player.state.movingRight = false;
            break;
        case "KeyD":
        case "ArrowRight":
            this.player.state.movingLeft = false;
            this.player.state.movingRight = true;
            break;
    }
  };

    private handleKeyUp = (e: KeyboardEvent): void => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
            case "Space":
            case "ShiftLeft":
                this.player.state.shoot = false;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.player.state.movingLeft = false;

            break;
        case "KeyD":
        case "ArrowRight":
            this.player.state.movingLeft = false;
            this.player.state.movingRight = false;
            break;
    }
  };
    private handlePlayerMove(pressed: boolean, e: FederatedPointerEvent): void {
        const point = this.game.toLocal(e.global);

      if (
          pressed &&
          point.x > this.player.x &&
          point.y > this.game.height - this.player.height
      ) {
          this.player.state.movingRight = true;
      }
      if (
          pressed &&
          point.x < this.player.x &&
          point.y > this.game.height - this.player.height
      ) {
          this.player.state.movingLeft = true;
      }
      if (pressed && point.y < this.game.height - this.player.height) {
          this.player.state.shoot = true;
      }
      if (!pressed) {
          this.player.state.shoot = false;
          this.player.state.movingLeft = false;
          this.player.state.movingRight = false;
      }
  }

    private handlePlayerStartMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(true, e);
    };

    private handlePlayerKeepMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(true, e);
    };

    private handlePlayerStopMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(false, e);
    };
}
