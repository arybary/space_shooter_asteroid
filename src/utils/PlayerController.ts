import { Ship } from "../game/Ship";
import { GameScene } from "../scenes/GameScene";

interface IPlayerController {
    game: GameScene;
    player: Ship;
}

export class PlayerController {
    private player: Ship;

    constructor({ player }: IPlayerController) {
        this.player = player;
        this.addEventListeners();
    }

    private addEventListeners(): void {
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
}
