import { Container, Text } from 'pixi.js'

export class StatusBar extends Container {
    static options = {
        padding: 20,
        textColor: 0xbb5857,
        textColorShadow: 0x98cbd8,
        textShadowOffset: 0.5,
        textSize: 20
    }

    public projectileText!: Text
    public projectileTextShadow!: Text
    public timeText!: Text
    public timeTextShadow!: Text

    constructor() {
        super()
        this.setup()
    }

    static getProjectileText(append: string | number): string {
        return `PROJECTILE: ${append}`
    }

    static getTimeText(append: string | number): string {
        return `TIME: ${append}`
    }

    setup(): void {
        const {
            options: {
                padding,
                textSize,
                textColor,
                textShadowOffset,
                textColorShadow
            }
        } = StatusBar

        const projectileTextShadow = new Text(StatusBar.getProjectileText('-'), {
            fontSize: textSize,
            fill: textColorShadow
        })
        projectileTextShadow.position.set(padding, padding)
        this.addChild(projectileTextShadow)
        this.projectileTextShadow = projectileTextShadow
        const projectileText = new Text(StatusBar.getProjectileText('-'), {
            fontSize: textSize,
            fill: textColor
        })
        projectileText.position.set(padding + textShadowOffset, padding + textShadowOffset)
        this.addChild(projectileText)
        this.projectileText = projectileText

        const timeTextShadow = new Text(StatusBar.getTimeText(0), {
            fontSize: textSize * 0.8,
            fill: textColorShadow
        })
        timeTextShadow.position.set(projectileTextShadow.x, projectileTextShadow.y + projectileTextShadow.height)
        timeTextShadow.alpha = 1
        this.addChild(timeTextShadow)
        this.timeTextShadow = timeTextShadow
        const timeText = new Text(StatusBar.getTimeText(0), {
            fontSize: textSize * 0.8,
            fill: textColor
        })
        timeText.position.set(projectileText.x, projectileText.y + projectileText.height)
        this.addChild(timeText)
        this.timeText = timeText
    }

    updateProjectile(Projectile: number): void {
        this.projectileText.text = StatusBar.getProjectileText(Projectile)
        this.projectileTextShadow.text = StatusBar.getProjectileText(Projectile)
    }

    updateTime(time: number): void {
        const timeTxt = (time * 0.001).toFixed(1)
        this.timeText.text = StatusBar.getTimeText(timeTxt)
        this.timeTextShadow.text = StatusBar.getTimeText(timeTxt)
    }
}