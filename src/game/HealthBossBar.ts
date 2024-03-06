import { Container, Graphics } from "pixi.js";
import gsap from "gsap";

interface IHealthBossBarOptions {
    boxWidth: number;
}

export class HealthBossBar extends Container {
    boxWidth: number;
    public boxOptions = {
        border: 0xffffff,
        borderThick: 4,
        height: 28,
        fill: 0x818cf8,
        empty: 0xff0000,
    };

    public borderBox!: Graphics;
    public fillBar!: Graphics;
    public emptyBar!: Graphics;

    constructor({ boxWidth }: IHealthBossBarOptions) {
        super();
        this.boxWidth = boxWidth
        this.setup();
        this.draw();
    }

    setup(): void {
        this.borderBox = new Graphics();
        this.addChild(this.borderBox);

        const bars = new Container();
        bars.rotation = Math.PI;
        bars.position.set(
            this.boxWidth,
            this.boxOptions.height - this.boxOptions.borderThick
        );

        this.emptyBar = new Graphics();
        bars.addChild(this.emptyBar);

        const fillBar = new Graphics();
        bars.addChild(fillBar);
        this.fillBar = fillBar;

        this.addChild(bars);
    }

    draw(): void {

        const { borderBox, boxOptions, fillBar, emptyBar } = this;
        borderBox.beginFill(boxOptions.border);
        borderBox.drawRect(0, 0, this.boxWidth, boxOptions.height);
        borderBox.endFill();

        emptyBar.beginFill(boxOptions.empty);
        emptyBar.drawRect(
            0,
            0,
            this.boxWidth - boxOptions.borderThick,
            boxOptions.height - 2 * boxOptions.borderThick
        );
        emptyBar.endFill();

        fillBar.beginFill(boxOptions.fill);
        fillBar.drawRect(
            0,
            0,
            this.boxWidth - boxOptions.borderThick,
            boxOptions.height - 2 * boxOptions.borderThick
        );
        fillBar.endFill();
    }

    updateHealth(health: number): void {
        if (health <= 0) {
            health = 0;
        } else if (health >= 4) {
            health = 4;
        }
        gsap.to(this.fillBar, {
            width: ((this.boxWidth as number) * health) / 4,
        });
    }
}
