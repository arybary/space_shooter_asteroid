import { Ship } from "../game/Ship";

export class BossController {
    public boss: Ship;

    constructor(boss: Ship) {
        this.boss = boss;
  }

    shoot = () => {
        this.boss.state.shoot = true;
    };

    moveLeft = () => {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = true;
    };
    moveStop = () => {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = false;
  };

    moveRight = () => {
        this.boss.state.movingLeft = true;
        this.boss.state.movingRight = false;
  };

    randomizeMove(
        func1: () => void,
        func2: () => void,
        func3: () => void
    ): () => void {
        const functions = [func1, func2, func3];
        return functions[Math.floor(Math.random() * functions.length)];
    }

    changeFunctionRandomlyMove() {
        setInterval(() => {
        const randomFunction = this.randomizeMove(
            this.moveLeft,
            this.moveRight,
            this.moveStop
        );
        randomFunction();
    }, 1000);
  }
    stop() {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = false;
        this.boss.state.shoot = false;
    }
}
