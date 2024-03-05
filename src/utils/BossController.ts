import { Ship } from "./Ship";

export class BossController {
    public boss: Ship;

    constructor(boss: Ship) {
        this.boss = boss;
        this.shoot();
        this.changeFunctionRandomly();
    }

    private shoot(): void {
        setInterval(() => {
        this.boss.state.shoot = true;
        setTimeout(() => (this.boss.state.shoot = false), 1);
    }, 2000);
  }

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

    randomizeFunction(
        func1: () => void,
        func2: () => void,
        func3: () => void
    ): () => void {
        const functions = [func1, func2, func3];
        return functions[Math.floor(Math.random() * functions.length)];
    }

    changeFunctionRandomly() {
        setInterval(() => {
        console.log("5");
        const randomFunction = this.randomizeFunction(
            this.moveLeft,
            this.moveRight,
            this.moveStop
        );
        randomFunction();
    }, 1000);
  }
}
