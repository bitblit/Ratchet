import { RectangularMaze } from "./rectangular-maze.js";

// 0,1,2,3...width-1
// width,

export class BinaryGenerator {

  public static generate(width: number, height: number): RectangularMaze {
    const rval: RectangularMaze = new RectangularMaze(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y === 0) {
          if (x < width - 1) {
            rval.addPassage({ x, y }, { x: x + 1, y: y });
          }
        } else if (x === width - 1) {
          rval.addPassage({ x, y }, { x: x, y: y - 1 });
        } else {
          const flip: number = Math.random();
          if (flip <= .5) {
            rval.addPassage({ x, y }, { x: x + 1, y: y });
          } else {
            rval.addPassage({ x, y }, { x: x, y: y - 1 });
          }
        }
      }
    }
    return rval;
  }
}