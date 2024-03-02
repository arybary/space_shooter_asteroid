import { FederatedPointerEvent } from "pixi.js";
import { Player } from "../game/Player";

export class PlayerController {
    private player: Player;

    constructor(player: Player) {
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
                this.player.applyTopDirection(true);
                break;
            case "KeyA":
            case "ArrowLeft":
                this.player.applyLeftDirection(true);
                break;
            case "KeyD":
            case "ArrowRight":
                this.player.applyRightDirection(true);
                break;
        }
    };

    private handleKeyUp = (e: KeyboardEvent): void => {
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

    public handlePlayerMove(pressed: boolean | undefined, e: FederatedPointerEvent): void {
        const point = this.player.toLocal(e.global);
        this.player.handleMove(pressed, point.x, point.y);
    }

    public handlePlayerStartMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(true, e);
    };

    public handlePlayerKeepMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(undefined, e);
    };

    public handlePlayerStopMove = (e: FederatedPointerEvent): void => {
        this.handlePlayerMove(false, e);
    };
}
