import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { FONT_FAMILY } from "../utils/constants";

export class MessageModal extends Container {
  public styleTextButton = new TextStyle({
    fontFamily: FONT_FAMILY,
    fontSize: 32,
    fontStyle: "normal",
    fontWeight: "bold",
    fill: ["#ffffff", "#00ff99"],
    stroke: "#4a1850",
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
    lineJoin: "round",
  });
  public button!: Graphics;

  public buttonText!: Text;

  public buttonOptions = {
    top: 0,
    left: 0,
    width: 200,
    height: 50,
    fill: 0x650a5a,
    lineStyle: 0xff00ff,
    borderRadius: 10,
  };

  constructor() {
    super();
    this.setup();
    this.draw();
    this.setupEventListeners();
  }

  setup(): void {
    const { buttonOptions } = this;
    this.button = new Graphics();
    this.button.eventMode = "dynamic";
    this.button.cursor = "pointer";
    this.addChild(this.button);

    this.buttonText = new Text("Start Game", this.styleTextButton);
    this.buttonText.anchor.set(0.5, 0.5);
    this.buttonText.position.set(
      buttonOptions.width / 2,
      buttonOptions.height / 2
    );

    this.button.addChild(this.buttonText);
  }

  draw(): void {
    const { buttonOptions } = this;

    this.button.beginFill(buttonOptions.fill, 0.25);
    this.button.lineStyle(1, buttonOptions.lineStyle, 1);
    this.button.drawRoundedRect(
      buttonOptions.left,
      buttonOptions.top,
      buttonOptions.width,
      buttonOptions.height,
      buttonOptions.borderRadius
    );
    this.button.endFill();
  }

  setupEventListeners(): void {
    this.button.on("pointertap", (e) => {
      this.emit("click", e);
    });
  }
  setButtonText(text: string): void {
    this.buttonText.text = text;
  }
}
