import { Container, Graphics } from 'pixi.js'
import gsap from 'gsap'

interface IHealthBossBarOptions {
    boxWidth?: number
}

export class HealthBossBar extends Container {
    public boxOptions = {
        border: 0xffffff,
        borderThick: 4,
        width: 442,
        height: 38,
        fill: 0x818cf8,
        empty: 0xff0000
    }

    public borderBox!: Graphics
    public fillBar!: Graphics
    public emptyBar!: Graphics

    constructor(options: IHealthBossBarOptions) {
        super()
        this.setup(options)
        this.draw(options)
    }

    setup(_: IHealthBossBarOptions): void {
        this.borderBox = new Graphics()
        this.addChild(this.borderBox)

        const bars = new Container()
        bars.rotation = Math.PI
        bars.position.set(this.boxOptions.width, this.boxOptions.height - this.boxOptions.borderThick)

        this.emptyBar = new Graphics()
        bars.addChild(this.emptyBar)

        const fillBar = new Graphics()
        bars.addChild(fillBar)
        this.fillBar = fillBar

        this.addChild(bars)
    }

    draw(_: IHealthBossBarOptions): void {
        const {
            borderBox, boxOptions, fillBar, emptyBar
        } = this
        borderBox.beginFill(boxOptions.border)
        borderBox.drawRect(0, 0, boxOptions.width, boxOptions.height)
        borderBox.endFill()

        emptyBar.beginFill(boxOptions.empty)
        emptyBar.drawRect(0, 0, boxOptions.width - boxOptions.borderThick, boxOptions.height - 2 * boxOptions.borderThick)
        emptyBar.endFill()

        fillBar.beginFill(boxOptions.fill)
        fillBar.drawRect(0, 0, boxOptions.width - boxOptions.borderThick, boxOptions.height - 2 * boxOptions.borderThick)
        fillBar.endFill()
    }


    updateHealth(health: number): void {
        if (health <= 0) {
            health = 0
        } else if (health >= 100) {
            health = 100
        }
        gsap.to(this.fillBar, {
            width: this.boxOptions.width * health / 100
        })
    }
}