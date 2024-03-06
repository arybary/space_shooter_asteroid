import { Container, Text, TextStyle } from "pixi.js";
import {
    COLOR_DARC_PURP,
    COLOR_PURP,
    COLOR_WHITE,
    FONT_FAMILY,
} from "../utils/constants";

export class StatusBar extends Container {
    public styleText = new TextStyle({
        fontFamily: FONT_FAMILY,
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "bold",
        fill: COLOR_PURP,
        stroke: COLOR_DARC_PURP,
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: COLOR_WHITE,
        dropShadowBlur: 4,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
        lineJoin: "round",
    });

    static padding: 20;

    public projectileText!: Text;
    public timeText!: Text;

    constructor() {
        super();
        this.setup();
  }

    static getProjectileText(append: string | number): string {
        return `PROJECTILE: ${append}`;
  }

    static getTimeText(append: string | number): string {
        return `TIME: ${append}`;
  }

    setup(): void {
        const projectileText = new Text(
            StatusBar.getProjectileText("-"),
            this.styleText
        );
        projectileText.position.set(StatusBar.padding, StatusBar.padding);
      this.addChild(projectileText);
      this.projectileText = projectileText;

      const timeText = new Text(StatusBar.getTimeText(0), this.styleText);
      timeText.position.set(
          projectileText.x,
          projectileText.y + projectileText.height
      );
      this.addChild(timeText);
      this.timeText = timeText;
  }

    updateProjectile(Projectile: number): void {
        this.projectileText.text = StatusBar.getProjectileText(Projectile);
  }

    updateTime(time: number): void {
        const timeTxt = (time * 0.001).toFixed(1);
        this.timeText.text = StatusBar.getTimeText(timeTxt);
  }
}
