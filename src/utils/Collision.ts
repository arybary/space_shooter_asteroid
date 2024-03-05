interface IBound {
  top: number
  right: number
  bottom: number
  left: number
}
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Collision {
  static checkCollision(a: IBound, b: IBound): number {

    const rightmostLeft = a.left < b.left ? b.left : a.left
    const leftmostRight = a.right > b.right ? b.right : a.right

    if (leftmostRight <= rightmostLeft) {
      return 0
    }

    const bottommostTop = a.top < b.top ? b.top : a.top
    const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom


    if (topmostBottom > bottommostTop) {
      const squareIntersection = (leftmostRight - rightmostLeft) * (topmostBottom - bottommostTop)
      const squareTarget = (b.right - b.left) * (b.bottom - b.top)
      return squareIntersection / squareTarget
    }
    return 0
  }
}
