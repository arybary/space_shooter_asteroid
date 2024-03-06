import { Container, Graphics } from "pixi.js";
import gsap from "gsap";
import { COLOR_GREEN, COLOR_RED, HEALTH } from "../utils/constants";

interface IHealthBossBarOptions {
    boxWidth: number;
}

export class HealthBossBar extends Container {
    public boxWidth: number;
    private borderBox: Graphics;
    private fillBar: Graphics;
    private emptyBar: Graphics;

    private readonly boxOptions = {
        borderThick: HEALTH,
        height: 28,
        fill: COLOR_GREEN,
        empty: COLOR_RED,
    };

    constructor({ boxWidth }: IHealthBossBarOptions) {
        super();
        this.boxWidth = boxWidth;
        this.borderBox = new Graphics();
        this.emptyBar = new Graphics();
        this.fillBar = new Graphics();
        this.setup();
        this.draw();
    }

    private setup(): void {
        this.addChild(this.borderBox);
        this.addChild(this.emptyBar);
        this.addChild(this.fillBar);
    }

    private draw(): void {
        this.borderBox.drawRect(0, 0, this.boxWidth, this.boxOptions.height);
        this.borderBox.endFill();

        this.emptyBar.beginFill(this.boxOptions.empty);
        this.emptyBar.drawRect(
            0,
            0,
            this.boxWidth - this.boxOptions.borderThick,
            this.boxOptions.height - 2 * this.boxOptions.borderThick
        );
        this.emptyBar.endFill();

        this.fillBar.beginFill(this.boxOptions.fill);
        this.fillBar.drawRect(
            0,
            0,
            this.boxWidth - this.boxOptions.borderThick,
            this.boxOptions.height - 2 * this.boxOptions.borderThick
        );
        this.fillBar.endFill();
    }

    public updateHealth(health: number): void {
        if (health <= 0) {
            health = 0;
        } else if (health >= HEALTH) {
            health = HEALTH;
        }
        gsap.to(this.fillBar, {
            width: (this.boxWidth * health) / HEALTH,
        });
    }
}
