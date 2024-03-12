import { Ship } from "../game/Ship";

export class BossController {
    public boss: Ship;

    constructor(boss: Ship) {
        this.boss = boss;
  }

    public shoot = () => {
        this.boss.state.shoot = true;
    };

    private moveLeft = () => {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = true;
    };
    private moveStop = () => {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = false;
  };

    private moveRight = () => {
        this.boss.state.movingLeft = true;
        this.boss.state.movingRight = false;
  };

    private randomizeMove(
        func1: () => void,
        func2: () => void,
        func3: () => void
    ): () => void {
        const functions = [func1, func2, func3];
        return functions[Math.floor(Math.random() * functions.length)];
    }

    public changeFunctionRandomlyMove() {
        setInterval(() => {
            const randomFunction = this.randomizeMove(
                this.moveLeft,
                this.moveRight,
                this.moveStop
            );
            randomFunction();
    }, 1000);
  }
    public stop() {
        this.boss.state.movingLeft = false;
        this.boss.state.movingRight = false;
        this.boss.state.shoot = false;
    }
}
